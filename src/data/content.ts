import { ProjectCaseStudy, StudioService, MediaItem } from '../types';

export const CASE_STUDIES: ProjectCaseStudy[] = [
  {
    id: 'meridian-os',
    title: 'Meridian Capital Intelligence OS',
    slug: 'meridian-os',
    category: 'Fintech',
    year: '2025',
    summary: 'A sub-millisecond quantitative portfolio risk terminal and automated execution platform for algorithmic asset managers.',
    client: 'Meridian Global Assets',
    deliverables: ['Design System', 'React Performance Engine', 'Risk Visualizer', 'WebSocket Telemetry'],
    metrics: [
      { label: 'Latency', value: '0.8ms', context: 'WebSocket stream render cycle' },
      { label: 'AUM Supported', value: '$14.2B', context: 'Real-time monitored assets' },
      { label: 'Decision Velocity', value: '+184%', context: 'Trader benchmark vs Bloomberg' }
    ],
    challenge: 'Legacy financial workstations suffered from UI thread lockup during high-volatility market events, leading to delayed trade decisions and disjointed risk calculations across decentralized trading desks.',
    solution: 'Engineered an off-thread Web Worker architecture coupled with a custom virtualized WebGL canvas grid, delivering 120 FPS continuous streaming across 180 simultaneous ticker pairs with zero UI stutter.',
    outcome: 'Adopted across all 6 international trading hubs, reducing critical trade reconciliation time from 14 minutes to 8 seconds.',
    technologies: ['TypeScript', 'React', 'WebGL Canvas', 'Web Workers', 'Highcharts Engine', 'Tailwind CSS'],
    testimonial: {
      quote: 'Aura reconstructed our core analytical workstation from bare metal. Our portfolio managers executed $4.2B with zero display latency during the Q3 market rotation.',
      author: 'Marcus Vance',
      role: 'Chief Technology Officer',
      company: 'Meridian Global Assets'
    },
    visualTone: {
      accent: 'emerald',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      icon: 'trending-up'
    },
    beforeAfterComparison: {
      beforeLabel: 'Legacy Workstation',
      beforeMetric: '2,400ms tick latency · 12 FPS grid stutter',
      afterLabel: 'Aura Meridian Terminal',
      afterMetric: '0.8ms tick latency · 120 FPS fluid render',
      description: 'Side-by-side performance audit during simultaneous market open spikes.'
    }
  },
  {
    id: 'kallisto-mobility',
    title: 'Kallisto Autonomous Fleet Command',
    slug: 'kallisto-mobility',
    category: 'Mobility',
    year: '2026',
    summary: 'Centralized spatial telemetry and incident dispatch operating console for commercial driverless delivery fleets.',
    client: 'Kallisto Robotics Group',
    deliverables: ['Spatial UI Design', '3D Map Componentry', 'Fleet Dispatch System', 'Operator Ergonomics'],
    metrics: [
      { label: 'Fleet Scale', value: '1,200+', context: 'Autonomous commercial pods active' },
      { label: 'Response Time', value: '-68%', context: 'Incident triage and handoff speed' },
      { label: 'Safety Compliance', value: '99.99%', context: 'ISO 26262 compliant UX' }
    ],
    challenge: 'Remote tele-operators experienced cognitive fatigue after 45 minutes of multi-camera oversight due to cluttered sensor visualizers and high false-positive alert noise.',
    solution: 'Designed a high-contrast ergonomic spatial dark canvas with contextual attention hierarchy, dynamic route predictive ghost trails, and single-touch remote intervention overrides.',
    outcome: 'Operator shift endurance increased by 2.4x while false-positive emergency dispatches decreased by 74% across pilot metropolitan testing.',
    technologies: ['Three.js', 'React', 'MapLibre GL', 'WebRTC Low-Latency', 'Tailwind CSS'],
    testimonial: {
      quote: 'The ergonomic clarity of the fleet interface directly translated into safer street trials and faster regulatory certification in three tier-one jurisdictions.',
      author: 'Dr. Elena Rostova',
      role: 'VP of Safety & Autonomy',
      company: 'Kallisto Robotics Group'
    },
    visualTone: {
      accent: 'blue',
      gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      icon: 'navigation'
    },
    beforeAfterComparison: {
      beforeLabel: 'Legacy Telemetry Stack',
      beforeMetric: '18 high-noise alerts/hr · 44% operator fatigue rate',
      afterLabel: 'Kallisto Command OS',
      afterMetric: '2 prioritized alerts/hr · 9% operator fatigue rate',
      description: 'Cognitive load and alert triage study during peak urban delivery cycles.'
    }
  },
  {
    id: 'nordik-spatial',
    title: 'Nordik Architecture & Living Atelier',
    slug: 'nordik-spatial',
    category: 'Spatial',
    year: '2025',
    summary: 'Interactive architectural catalog, spatial lighting simulator, and custom specification engine for Scandinavian contract furniture.',
    client: 'Nordik Living Group (Copenhagen)',
    deliverables: ['Digital Flagship Store', 'Real-time 3D Configurator', 'Trade Portal', 'Spec Sheet Generator'],
    metrics: [
      { label: 'Conversion', value: '+142%', context: 'Architect trade inquiries within 90 days' },
      { label: 'Configurator Dwell', value: '6m 40s', context: 'Average interactive session duration' },
      { label: 'B2B Order Volume', value: '€8.4M', context: 'Direct spec bookings recorded' }
    ],
    challenge: 'Commercial interior architects found traditional static PDF product binders cumbersome for specifying finishes, textiles, and lighting behavior in multi-story residential projects.',
    solution: 'Crafted an editorial interactive catalog with real-time solar daylight angle simulation, instant photorealistic fabric swatching, and one-click CAD/BIM specification export.',
    outcome: 'Spec-to-quote conversion rate skyrocketed by 142%, leading to Nordik securing primary furnishing contracts for four European landmark developments.',
    technologies: ['React 19', 'Three.js / WebGL', 'Tailwind CSS', 'Dynamic PDF Generator', 'PostgreSQL'],
    testimonial: {
      quote: 'Aura transformed our digital presence into a working tool for the world’s top architectural firms. It is as thoughtfully crafted as our physical furniture.',
      author: 'Frederik Lindqvist',
      role: 'Creative Director',
      company: 'Nordik Living'
    },
    visualTone: {
      accent: 'amber',
      gradient: 'from-amber-500/20 via-stone-500/10 to-transparent',
      icon: 'compass'
    },
    beforeAfterComparison: {
      beforeLabel: 'Static PDF Spec Catalog',
      beforeMetric: '3-day quote turnaround · 4.2% conversion rate',
      afterLabel: 'Interactive Atelier Portal',
      afterMetric: 'Instant BIM spec export · 18.6% conversion rate',
      description: 'Architect specification workflow audit across 50 international design firms.'
    }
  },
  {
    id: 'helix-bio',
    title: 'Helix Genomic Variant Explorer',
    slug: 'helix-bio',
    category: 'Healthcare',
    year: '2026',
    summary: 'Clinical-grade oncology gene mutation annotation and collaborative diagnosis workbench for specialized pathology laboratories.',
    client: 'Helix Molecular Systems',
    deliverables: ['Clinical UX Design', 'Genome Sequence Viewer', 'Collaborative Notes', 'HIPAA Compliant UI'],
    metrics: [
      { label: 'Annotation Time', value: '-52%', context: 'Per complex clinical biopsy review' },
      { label: 'Diagnostic Concordance', value: '99.8%', context: 'Multi-pathologist agreement score' },
      { label: 'Lab Adoption', value: '38 Labs', context: 'Accredited cancer research centers' }
    ],
    challenge: 'Oncology pathologists navigated fragmented bioinformatics databases and spreadsheet exports, risking delayed diagnosis for critical late-stage cancer patients.',
    solution: 'Built an unified clinical workbench consolidating variant databases, chromosome chromosome locus visualization, and annotated peer sign-off into a single accessible interface.',
    outcome: 'Average genomic diagnosis turnaround shortened by 3.2 days, enabling earlier onset of targeted immunotherapy treatments.',
    technologies: ['React', 'TypeScript', 'D3.js Visualization', 'FHIR API Integration', 'Tailwind CSS'],
    testimonial: {
      quote: 'The clarity and speed of Helix have made genomic analysis intuitive for our clinical staff. It is rare to see software combine clinical precision with such refined design.',
      author: 'Dr. Sarah Jenkins, MD',
      role: 'Director of Molecular Pathology',
      company: 'St. Jude Oncology Research'
    },
    visualTone: {
      accent: 'violet',
      gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
      icon: 'activity'
    },
    beforeAfterComparison: {
      beforeLabel: 'Fragmented Clinical Tools',
      beforeMetric: '6.4 hrs per panel review · 11 tool switches',
      afterLabel: 'Helix Unified Workbench',
      afterMetric: '2.8 hrs per panel review · 1 cohesive workstation',
      description: 'Pathologist review time metrics measured across 400 clinical cases.'
    }
  }
];

export const SERVICES: StudioService[] = [
  {
    number: '01',
    title: 'Human-Centered Interface Systems',
    shortDesc: 'Design systems, high-density applications, and responsive product software built for clarity and sustained workflow focus.',
    description: 'We craft modular, accessible design systems that allow engineering and product teams to move 3x faster without visual drift. Every component adheres to strict spatial math, tokenized variables, and WCAG AA compliance.',
    capabilities: [
      'Multi-Brand Design Tokens & Figma Variables',
      'Complex Data-Dense Dashboards & Tables',
      'Accessible Micro-Interactions & Spring Physics',
      'Mobile & Desktop Ergonomic Layouts'
    ],
    typicalTimeline: '4 to 8 Weeks',
    outcomes: ['3x faster engineering velocity', 'Zero visual regression', '100% WCAG AA contrast compliance'],
    technologies: ['Figma Tokens', 'React / TypeScript', 'Tailwind CSS', 'Radix UI', 'CSS Custom Properties']
  },
  {
    number: '02',
    title: 'High-Performance Web Architecture',
    shortDesc: 'Sub-second frontend architecture, client-side caching, off-thread data crunching, and cloud-native resilience.',
    description: 'Speed is the foundation of user respect. We engineer web applications that load in under 400 milliseconds, hydrate cleanly, and stream real-time data at 60–120 FPS without dropped frames.',
    capabilities: [
      'Virtualization for 100k+ Records',
      'Web Workers & Off-Thread Data Processing',
      'Real-Time WebSocket & Server-Sent Events',
      'Zero-Layout-Shift Performance Auditing'
    ],
    typicalTimeline: '6 to 12 Weeks',
    outcomes: ['Sub-500ms First Contentful Paint', '100 Lighthouse Performance Score', 'Zero frame drop during streaming'],
    technologies: ['Vite', 'TypeScript', 'Web Workers', 'WebSockets', 'IndexedDB', 'Express / Node.js']
  },
  {
    number: '03',
    title: 'Kinetic Motion & Spatial 3D Systems',
    shortDesc: 'Purposeful micro-interactions, WebGL canvas shaders, interactive product models, and spatial storytelling.',
    description: 'Motion should communicate state, not distract. We engineer physical-feeling spring curves, purposeful spatial transitions, and interactive WebGL canvas scenes that elevate product perceived value.',
    capabilities: [
      'Three.js & WebGL 3D Product Viewports',
      'Physics-Based Spring Micro-Interactions',
      'Interactive Exploded Mechanical Views',
      'Reduced-Motion Accessible Fallbacks'
    ],
    typicalTimeline: '4 to 10 Weeks',
    outcomes: ['4.2x higher interactive dwell time', '60 FPS hardware accelerated', 'Full fallbacks for low-power devices'],
    technologies: ['Three.js', 'Motion for React', 'GLSL Shaders', 'Canvas API', 'SVG Interpolation']
  },
  {
    number: '04',
    title: 'Product Strategy & MVP Fast-Tracking',
    shortDesc: 'Transforming complex ambiguous ideas into production-ready web platforms with validated user loops in record time.',
    description: 'We partner directly with founders and technical leaders to define the absolute critical path, eliminate scope bloat, and deliver a market-defining release that wins customers and investor confidence.',
    capabilities: [
      'Core Loop Wireframing & Prototyping',
      'Technical Feasibility & Architecture Specs',
      'Full-Stack Rapid Implementation',
      'Analytics & User Journey Instrumenting'
    ],
    typicalTimeline: '6 to 10 Weeks',
    outcomes: ['Production-ready launch in weeks', 'Clear unit economics & user loops', 'Clean maintainable code ready for scale'],
    technologies: ['Full-Stack TypeScript', 'REST / GraphQL', 'Firebase / Cloud SQL', 'Tailwind', 'CI/CD Pipelines']
  }
];

export const STUDIO_STATISTICS = [
  { label: 'Client Venture Capital Raised', value: '$480M+', context: 'Across 28 funded client startups' },
  { label: 'System Uptime SLA Maintained', value: '99.98%', context: 'Over 14 enterprise deployments' },
  { label: 'Average Conversion Uplift', value: '+142%', context: 'Measured across redesign rollouts' },
  { label: 'Median Frontend Render Latency', value: '<120ms', context: 'Audited across real user monitoring' }
];

export const FREQUENTLY_ASKED_QUESTIONS = [
  {
    question: 'How quickly can your studio kick off a new engagement?',
    answer: 'We operate in dedicated quarterly sprints. We typically onboard new projects within 10 to 14 business days following our initial discovery session and scope alignment.'
  },
  {
    question: 'Do you work with early-stage teams or established enterprises?',
    answer: 'Both. We partner with high-ambition Seed-to-Series B startups building flagship products, as well as publicly traded enterprises redesigning mission-critical internal and customer-facing platforms.'
  },
  {
    question: 'How do you ensure accessibility and performance aren’t compromised?',
    answer: 'Every interface is engineered against strict automated test suites for WCAG AA contrast (minimum 4.5:1), keyboard focus management, screen reader semantic trees, and sub-second Lighthouse performance budgets.'
  },
  {
    question: 'What is your technology stack preference?',
    answer: 'Our core production stack is modern TypeScript, React 19, Tailwind CSS, Vite, and Node.js. For 3D and graphics, we specialize in Three.js and custom GLSL WebGL shaders.'
  },
  {
    question: 'What does the engagement handover process look like?',
    answer: 'We provide complete production-grade source code, clean documentation, tokenized design libraries in Figma, automated CI/CD deployment configurations, and scheduled engineering training sessions for your team.'
  }
];

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-1',
    youtubeId: '8aGhZQkoFbQ',
    title: 'What the Heck is the Event Loop Anyway? · Philip Roberts',
    channel: 'JSConf EU',
    category: 'Keynotes',
    duration: '26:52',
    published: 'Classic Keynote',
    description: 'An essential architectural deep-dive into JavaScript single-threaded execution, call stacks, task queues, and rendering frames in browser runtimes.',
    chapters: [
      { time: '00:00', label: 'The Runtime & Call Stack', seconds: 0 },
      { time: '05:10', label: 'Blocking the UI Thread', seconds: 310 },
      { time: '12:40', label: 'Concurrency & The Event Loop', seconds: 760 },
      { time: '19:15', label: '60 FPS Rendering Pipeline', seconds: 1155 }
    ]
  },
  {
    id: 'media-2',
    youtubeId: 'cCOL7MC4Pl0',
    title: 'In The Loop · Browser Rendering, Microtasks & RAF',
    channel: 'Jake Archibald · JSConf',
    category: 'Keynotes',
    duration: '35:11',
    published: 'Systems Architecture',
    description: 'How modern web browsers coordinate event loops, requestAnimationFrame, style calculation, layout geometry, and compositor frames.',
    chapters: [
      { time: '00:00', label: 'Main Thread Task Scheduling', seconds: 0 },
      { time: '08:45', label: 'requestAnimationFrame Timing', seconds: 525 },
      { time: '18:20', label: 'Microtask Queue Mechanics', seconds: 1100 }
    ]
  },
  {
    id: 'media-3',
    youtubeId: 'mr15Xzb1Ook',
    title: 'Tailwind CSS Full Architectural Course & Design Systems',
    channel: 'Web Dev Simplified',
    category: 'Tutorials',
    duration: '28:40',
    published: 'Design Tokens',
    description: 'Building utility-first design systems, responsive breakpoints, dark mode tokens, and maintainable component architectures.',
    chapters: [
      { time: '00:00', label: 'Utility-First Philosophy', seconds: 0 },
      { time: '06:30', label: 'Responsive Grid Systems', seconds: 390 },
      { time: '15:20', label: 'Customizing Design Tokens', seconds: 920 }
    ]
  },
  {
    id: 'media-4',
    youtubeId: 'Tn6-PIqc4UM',
    title: 'React in 100 Seconds · Modern Declarative UI',
    channel: 'Fireship',
    category: 'Tutorials',
    duration: '02:08',
    published: 'Rapid Briefing',
    description: 'A high-velocity breakdown of declarative component trees, reactive state hooks, and modern frontend rendering concepts.',
    chapters: [
      { time: '00:00', label: 'Declarative UI Primitives', seconds: 0 },
      { time: '00:55', label: 'State & Props Architecture', seconds: 55 }
    ]
  },
  {
    id: 'media-5',
    youtubeId: 'zBkVc3B0cBM',
    title: 'UI & UX Design Systems · Spatial Hierarchy & Typography',
    channel: 'DesignCourse',
    category: 'Design & Motion',
    duration: '19:14',
    published: 'Interface Craft',
    description: 'Mastering visual hierarchy, whitespace math, optical contrast, and typography scales for modern digital products.',
    chapters: [
      { time: '00:00', label: 'Visual Hierarchy Fundamentals', seconds: 0 },
      { time: '07:15', label: 'Contrast & Legibility Math', seconds: 435 },
      { time: '13:40', label: 'Refining Component Spacing', seconds: 820 }
    ]
  },
  {
    id: 'media-6',
    youtubeId: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio · Beats to Relax / Code / Architect To',
    channel: 'Lofi Girl Studio',
    category: 'Focus Beats',
    duration: 'LIVE',
    published: 'Ambient Audio',
    description: 'Continuous ambient instrumental beats curated for deep engineering flow states, architecture design sessions, and distraction-free coding.',
    chapters: [
      { time: '00:00', label: 'Live Studio Stream', seconds: 0 }
    ]
  },
  {
    id: 'media-7',
    youtubeId: '5qap5aO4i9A',
    title: 'Synthwave & Chill Ambient Coding Mix · Deep Focus Session',
    channel: 'Chillhop Music',
    category: 'Focus Beats',
    duration: '58:20',
    published: 'Studio Session',
    description: 'Warm analog synth textures and downtempo rhythms tailored for late-night debugging and creative UI prototyping.',
    chapters: [
      { time: '00:00', label: 'Opening Ambient Sequence', seconds: 0 },
      { time: '15:00', label: 'Deep Flow State Groove', seconds: 900 },
      { time: '35:00', label: 'Midnight Horizon Mix', seconds: 2100 }
    ]
  },
  {
    id: 'media-8',
    youtubeId: 'aircAruvnKk',
    title: 'But What is a Neural Network? · Deep Learning Visualized',
    channel: '3Blue1Brown',
    category: 'Design & Motion',
    duration: '19:13',
    published: 'Mathematical Visuals',
    description: 'Gold-standard mathematical storytelling and custom programmatic animations explaining multilayer perceptrons and gradient descent.',
    chapters: [
      { time: '00:00', label: 'Visualizing Neurons & Activations', seconds: 0 },
      { time: '06:15', label: 'Hidden Layers & Edge Detection', seconds: 375 },
      { time: '13:30', label: 'Weights, Biases & Linear Algebra', seconds: 810 }
    ]
  }
];

