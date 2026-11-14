import React, { useState, useMemo } from 'react';
import {
  InternalEndpointItem,
  InternalEndpointResolveResponse,
  ResolvedMedia,
} from '../types';
import {
  Play,
  RefreshCw,
  Search,
  Server,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ListVideo,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface InternalEndpointsHubProps {
  endpoints: InternalEndpointItem[];
  isLoading: boolean;
  activeEndpointId?: string;
  onRefresh: () => Promise<void>;
  onPlayResolvedMedia: (media: ResolvedMedia) => void;
  onBackToDiscover: () => void;
}

type ProtocolFilter = 'all' | 'hls' | 'direct' | 'audio' | 'catalog' | 'embed';

export const InternalEndpointsHub: React.FC<InternalEndpointsHubProps> = ({
  endpoints,
  isLoading,
  activeEndpointId,
  onRefresh,
  onPlayResolvedMedia,
  onBackToDiscover,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [protocolFilter, setProtocolFilter] = useState<ProtocolFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Per-endpoint probe / resolution cache in component state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [probeMap, setProbeMap] = useState<
    Record<string, InternalEndpointResolveResponse>
  >({});
  const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(
    null
  );

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const resolveEndpointFromServer = async (
    endpoint: InternalEndpointItem
  ): Promise<InternalEndpointResolveResponse | null> => {
    try {
      const resp = await fetch(
        `/api/internal-endpoints/${encodeURIComponent(endpoint.id)}/resolve`,
        { cache: 'no-store' }
      );
      const data: InternalEndpointResolveResponse = await resp.json();
      setProbeMap((prev) => ({ ...prev, [endpoint.id]: data }));
      if (!resp.ok && resp.status === 404) {
        // Endpoint was removed from environment variables — refresh list automatically
        await onRefresh();
      }
      return data;
    } catch {
      const fallbackErr: InternalEndpointResolveResponse = {
        id: endpoint.id,
        name: endpoint.name,
        envKey: endpoint.envKey,
        reachable: false,
        error: 'Could not contact server resolver.',
      };
      setProbeMap((prev) => ({ ...prev, [endpoint.id]: fallbackErr }));
      return fallbackErr;
    }
  };

  const handleVerifyEndpoint = async (endpoint: InternalEndpointItem) => {
    setVerifyingId(endpoint.id);
    const result = await resolveEndpointFromServer(endpoint);
    setVerifyingId(null);
    if (
      result?.reachable &&
      result.catalogItems &&
      result.catalogItems.length > 1
    ) {
      setExpandedCatalogId(endpoint.id);
    }
  };

  const handlePlayEndpoint = async (endpoint: InternalEndpointItem) => {
    setResolvingId(endpoint.id);
    const result = await resolveEndpointFromServer(endpoint);
    setResolvingId(null);

    if (!result || !result.reachable) {
      return;
    }

    if (result.catalogItems && result.catalogItems.length > 1) {
      setExpandedCatalogId(endpoint.id);
      return;
    }

    if (result.media) {
      onPlayResolvedMedia(result.media);
    }
  };

  const filteredEndpoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return endpoints.filter((ep) => {
      if (protocolFilter !== 'all') {
        if (protocolFilter === 'hls' && ep.protocolHint !== 'hls') return false;
        if (
          protocolFilter === 'direct' &&
          ep.protocolHint !== 'direct' &&
          ep.protocolHint !== 'auto'
        ) {
          return false;
        }
        if (protocolFilter === 'audio' && ep.protocolHint !== 'audio') {
          return false;
        }
        if (
          protocolFilter === 'catalog' &&
          ep.protocolHint !== 'json' &&
          ep.protocolHint !== 'm3u'
        ) {
          return false;
        }
        if (
          protocolFilter === 'embed' &&
          ep.protocolHint !== 'embed' &&
          ep.protocolHint !== 'youtube' &&
          ep.protocolHint !== 'vimeo'
        ) {
          return false;
        }
      }

      if (!q) return true;
      return (
        ep.name.toLowerCase().includes(q) ||
        ep.envKey.toLowerCase().includes(q) ||
        ep.protocolLabel.toLowerCase().includes(q) ||
        ep.maskedTarget.toLowerCase().includes(q) ||
        (ep.group && ep.group.toLowerCase().includes(q))
      );
    });
  }, [endpoints, searchQuery, protocolFilter]);

  return (
    <section
      aria-label="Internal Stream Endpoints"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-2">
          <button
            type="button"
            onClick={onBackToDiscover}
            className="text-xs font-medium text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cinema &amp; Public URL Player</span>
          </button>

          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
            style={{ textWrap: 'balance' }}
          >
            Internal Stream Endpoints
          </h1>

          <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Managed strictly via server environment variables. Streams are
            resolved and proxied server-side so private VPC services, HLS
            manifests, direct media files, and JSON feeds play without exposing
            raw URLs or credentials to the browser.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-xs text-neutral-400 font-mono tabular-nums">
            <span className="text-white font-semibold">{endpoints.length}</span>{' '}
            {endpoints.length === 1 ? 'endpoint active' : 'endpoints active'}
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing || isLoading ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh from Env</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && endpoints.length === 0 ? (
        <div className="space-y-3" role="status" aria-live="polite">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-20 rounded-xl bg-[#101118] border border-white/[0.07] animate-pulse px-5 flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-white/[0.08]" />
                <div className="h-3 w-72 rounded bg-white/[0.05]" />
              </div>
              <div className="h-9 w-28 rounded-lg bg-white/[0.08]" />
            </div>
          ))}
        </div>
      ) : endpoints.length === 0 ? (
        /* Empty State when no environment variables are set */
        <div className="rounded-2xl bg-[#101118] border border-white/[0.08] p-6 sm:p-10 space-y-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Server className="w-4 h-4 shrink-0" />
              <span>Environment-Driven Configuration</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              No internal endpoints are currently configured
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              For security, internal endpoints cannot be added through the
              browser UI. Define one or more environment variables in your AWS
              service (App Runner, ECS, Elastic Beanstalk) or container{' '}
              <code className="font-mono text-neutral-200">.env</code>, then
              click <strong className="text-white">Refresh from Env</strong>.
              Removing an environment variable immediately revokes access to
              that stream.
            </p>
          </div>

          <div className="pt-4 border-t border-white/[0.07] grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-200">
                Option A · Individual Environment Variables
              </h3>
              <p className="text-neutral-400">
                Add or remove individual keys freely in your AWS environment
                settings:
              </p>
              <pre className="p-3.5 rounded-xl bg-[#08080c] border border-white/[0.07] font-mono text-[11px] text-neutral-300 overflow-x-auto leading-relaxed">
{`INTERNAL_ENDPOINT_1="http://10.0.1.25:8080/live/master.m3u8"
INTERNAL_ENDPOINT_CINEMA="Main Stage|http://10.0.1.30:9000/movie.mp4"
INTERNAL_ENDPOINT_CATALOG="http://internal-api.local:3000/streams"`}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-200">
                Option B · Single List Variable &amp; Optional Auth
              </h3>
              <p className="text-neutral-400">
                Provide a comma-separated list or JSON array, plus optional
                server-side auth headers:
              </p>
              <pre className="p-3.5 rounded-xl bg-[#08080c] border border-white/[0.07] font-mono text-[11px] text-neutral-300 overflow-x-auto leading-relaxed">
{`INTERNAL_ENDPOINTS="Feed 1|http://10.0.1.10/a.m3u8, Feed 2|http://10.0.1.11/b.mp4"
INTERNAL_ENDPOINT_AUTH_TOKEN="your-internal-bearer-token"`}
              </pre>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Check Environment Variables</span>
            </button>

            <button
              type="button"
              onClick={onBackToDiscover}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-colors whitespace-nowrap"
            >
              Use Public Stream URL Player
            </button>
          </div>
        </div>
      ) : (
        /* Populated State */
        <div className="space-y-5">
          {/* Search & Interactive Segmented Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by endpoint name, env key, or host…"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#101118] border border-white/[0.09] text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#101118] border border-white/[0.08]">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'hls', label: 'HLS' },
                  { id: 'direct', label: 'Direct Video' },
                  { id: 'audio', label: 'Audio' },
                  { id: 'catalog', label: 'JSON / M3U' },
                  { id: 'embed', label: 'Embed' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setProtocolFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    protocolFilter === tab.id
                      ? 'bg-amber-400 text-neutral-950 font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredEndpoints.length === 0 ? (
            <div className="rounded-xl bg-[#101118] border border-white/[0.08] p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-white">
                No endpoints match the current filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setProtocolFilter('all');
                }}
                className="text-xs font-medium text-amber-400 hover:text-amber-300 underline underline-offset-4"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.07] rounded-2xl bg-[#101118] border border-white/[0.08] overflow-hidden">
              {filteredEndpoints.map((ep, index) => {
                const probe = probeMap[ep.id];
                const isResolving = resolvingId === ep.id;
                const isVerifying = verifyingId === ep.id;
                const isCurrentlyPlaying = activeEndpointId === ep.id;
                const hasCatalog =
                  Boolean(probe?.catalogItems) &&
                  (probe?.catalogItems?.length || 0) > 1;
                const isCatalogExpanded = expandedCatalogId === ep.id;

                return (
                  <div
                    key={ep.id}
                    className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Clean Editorial Index + Endpoint Title + Unboxed Metadata */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-mono tabular-nums text-neutral-500 shrink-0">
                            {String(index + 1).padStart(2, '0')}.
                          </span>
                          <h2 className="text-sm sm:text-base font-bold text-white truncate">
                            {ep.name}
                          </h2>
                          {isCurrentlyPlaying && (
                            <span className="text-xs font-medium text-amber-400 shrink-0">
                              · Active in Player
                            </span>
                          )}
                        </div>

                        {/* Unboxed Metadata with Subtle Separators */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-400 pl-6">
                          <span className="font-mono text-neutral-300">
                            {ep.envKey}
                          </span>
                          <span aria-hidden="true" className="text-neutral-600">
                            ·
                          </span>
                          <span>
                            {probe?.resolvedLabel || ep.protocolLabel}
                          </span>
                          <span aria-hidden="true" className="text-neutral-600">
                            ·
                          </span>
                          <span className="font-mono text-neutral-500 truncate max-w-xs sm:max-w-md">
                            {ep.maskedTarget}
                          </span>
                          {ep.group && (
                            <>
                              <span
                                aria-hidden="true"
                                className="text-neutral-600"
                              >
                                ·
                              </span>
                              <span>{ep.group}</span>
                            </>
                          )}
                        </div>

                        {/* Probe Status Feedback (Icon + Explicit Text, Never Color Alone) */}
                        {probe && (
                          <div className="pl-6 pt-1">
                            {probe.reachable ? (
                              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  Reachable
                                  {probe.httpStatus
                                    ? ` (HTTP ${probe.httpStatus})`
                                    : ''}
                                  {probe.resolvedLabel
                                    ? ` · ${probe.resolvedLabel}`
                                    : ''}
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 text-xs text-rose-400">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  {probe.error ||
                                    'Endpoint unreachable from server'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Functional Action Controls */}
                      <div className="flex flex-wrap items-center gap-2.5 pl-6 lg:pl-0 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleVerifyEndpoint(ep)}
                          disabled={isVerifying || isResolving}
                          className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                          {isVerifying ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Server className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                          <span>Verify</span>
                        </button>

                        {hasCatalog ? (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedCatalogId(
                                isCatalogExpanded ? null : ep.id
                              )
                            }
                            className="px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                          >
                            <ListVideo className="w-3.5 h-3.5" />
                            <span>
                              {isCatalogExpanded
                                ? 'Hide Streams'
                                : `Browse Streams (${probe.catalogItems?.length})`}
                            </span>
                            {isCatalogExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePlayEndpoint(ep)}
                            disabled={isResolving}
                            className="px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                          >
                            {isResolving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                            <span>
                              {isResolving ? 'Connecting…' : 'Play Endpoint'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Multi-Stream List if JSON or M3U Endpoint Returned Multiple Streams */}
                    {hasCatalog &&
                      isCatalogExpanded &&
                      probe?.catalogItems && (
                        <div className="mt-4 pt-4 border-t border-white/[0.07] pl-6 space-y-2">
                          <div className="text-xs font-semibold text-neutral-300 mb-2">
                            Available Streams in {ep.name}
                          </div>
                          <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
                            {probe.catalogItems.map((subItem, subIdx) => (
                              <div
                                key={subItem.id}
                                className="py-2.5 flex items-center justify-between gap-4"
                              >
                                <div className="min-w-0">
                                  <div className="text-xs sm:text-sm font-medium text-white truncate">
                                    <span className="font-mono tabular-nums text-neutral-500 mr-2">
                                      {String(subIdx + 1).padStart(2, '0')}.
                                    </span>
                                    {subItem.title}
                                  </div>
                                  {subItem.subtitle && (
                                    <div className="text-[11px] text-neutral-400 pl-6 truncate">
                                      {subItem.subtitle}
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    onPlayResolvedMedia(subItem.media)
                                  }
                                  className="px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-white hover:bg-neutral-200 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Play</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
