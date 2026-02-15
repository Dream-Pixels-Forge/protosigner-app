
import { ProjectSettings, AppSettings, UIElement } from '../types';

export const defaultSettings: ProjectSettings = {
  darkMode: true,
  animateEntrance: true,
  fontFamily: 'Space Grotesk',
  
  pageSize: { width: 1440, height: 3600 }, // Increased height to fit new sections
  viewportSize: { width: 1440, height: 900 },
  
  pageBorder: { show: true, width: 1, color: '#333333', style: 'solid' },
  viewportBorder: { show: true, width: 2, color: 'rgba(255, 255, 255, 0.2)', style: 'dashed' },
  
  guides: {
      showFold: true,
      foldPosition: 900,
      showSafeZone: false,
      safeZoneWidth: 1140,
      showColumnGrid: false,
      columns: 12,
      gap: 24,
      margin: 0,
      color: 'rgba(255, 0, 0, 0.05)'
  },

  padding: { x: 0, y: 0 },
  showGrid: true,
  snapToGrid: true,
  gridSize: 20,
  componentLibrary: 'html-tailwind',

  enableGridMaster: true,
  autoSkillMode: true,
  
  // Local model optimization - default for maximum compatibility
  localHardwareLevel: 'light'
};

export const defaultAppSettings: AppSettings = {
  autoSave: true,
  syncInterval: 30,
  offlineMode: false,
  debugMode: false,
  showFps: false,
  reduceMotion: false,
  mcpServers: [
    { id: 'srv-1', name: 'Localhost Node', url: 'ws://localhost:3000', status: 'connected' },
    { id: 'srv-2', name: 'Filesystem MCP', url: 'ws://localhost:3001', status: 'disconnected' }
  ]
};

// --- ATOMIC INITIAL STATE (FUTURISTIC LANDING PAGE DEMO) ---
export const initialElements: UIElement[] = [
  {
    id: 'root',
    type: 'page',
    name: 'Protosigner Landing',
    props: {},
    isExpanded: true,
    isLocked: false,
    style: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#030303',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        height: 3600, // Match pageSize.height
        minHeight: 3600,
        fontFamily: 'Space Grotesk',
        alignItems: 'center',
        paddingBottom: 0
    },
    children: [
        // Background Glows
        {
            id: 'bg-glow-1',
            type: 'box',
            name: 'Purple Glow',
            props: {},
            isLocked: true,
            style: {
                position: 'absolute',
                top: -200,
                left: -200,
                width: 1000,
                height: 1000,
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                filter: 'blur(100px)',
                zIndex: 0,
                pointerEvents: 'none'
            }
        },
        {
            id: 'bg-glow-2',
            type: 'box',
            name: 'Cyan Glow',
            props: {},
            isLocked: true,
            style: {
                position: 'absolute',
                top: '10%',
                right: -300,
                width: 900,
                height: 900,
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
                filter: 'blur(120px)',
                zIndex: 0,
                pointerEvents: 'none'
            }
        },
        // Navigation
        {
            id: 'navbar',
            type: 'container',
            name: 'Glass Navbar',
            props: {},
            style: {
                width: '90%',
                maxWidth: 1200,
                height: 80,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
                marginTop: 20,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'sticky',
                top: 20,
                zIndex: 100,
                flexShrink: 0,
                boxSizing: 'border-box'
            },
            children: [
                {
                    id: 'nav-logo',
                    type: 'text',
                    name: 'Logo',
                    props: { text: 'Protosigner.' },
                    style: { fontSize: 24, fontWeight: '700', letterSpacing: '-1px' }
                },
                {
                    id: 'nav-links',
                    type: 'container',
                    name: 'Links',
                    props: {},
                    style: { display: 'flex', gap: 32, alignItems: 'center' },
                    children: [
                        { id: 'link-1', type: 'text', name: 'Link', props: { text: 'Features' }, style: { fontSize: 14, color: '#94a3b8', cursor: 'pointer' } },
                        { id: 'link-2', type: 'text', name: 'Link', props: { text: 'Showcase' }, style: { fontSize: 14, color: '#94a3b8', cursor: 'pointer' } },
                        { id: 'link-3', type: 'text', name: 'Link', props: { text: 'Pricing' }, style: { fontSize: 14, color: '#94a3b8', cursor: 'pointer' } },
                        { 
                            id: 'nav-cta', 
                            type: 'button', 
                            name: 'CTA', 
                            props: { label: 'Get Started' }, 
                            style: { 
                                backgroundColor: '#ffffff', 
                                color: '#000000', 
                                padding: '10px 24px', 
                                borderRadius: 100, 
                                fontSize: 14, 
                                fontWeight: '600',
                                border: 'none'
                            } 
                        }
                    ]
                }
            ]
        },
        // Hero Content
        {
            id: 'hero-section',
            type: 'section',
            name: 'Hero Section',
            props: {},
            style: {
                width: '100%',
                height: 900, // EXPLICIT HEIGHT for hero
                maxWidth: 1200,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 40px',
                gap: 80,
                position: 'relative',
                zIndex: 10,
                flexShrink: 0,
                boxSizing: 'border-box'
            },
            children: [
                // Left Text
                {
                    id: 'hero-left',
                    type: 'container',
                    name: 'Hero Content',
                    props: {},
                    style: { flex: 1, display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'flex-start' },
                    children: [
                        {
                            id: 'hero-badge',
                            type: 'text',
                            name: 'Badge',
                            props: { text: '✨ V2.0 Now Available' },
                            style: { 
                                fontSize: 12, 
                                color: '#67e8f9', 
                                backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                                padding: '6px 12px', 
                                borderRadius: 100,
                                border: '1px solid rgba(6, 182, 212, 0.2)'
                            }
                        },
                        {
                            id: 'hero-title',
                            type: 'text',
                            name: 'Title',
                            props: { text: 'Architect the\nFuture Interface' },
                            style: { 
                                fontSize: 72, 
                                fontWeight: '800', 
                                lineHeight: '1.1', 
                                letterSpacing: '-2px',
                                background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }
                        },
                        {
                            id: 'hero-desc',
                            type: 'text',
                            name: 'Description',
                            props: { text: 'Generate high-fidelity UI components with the power of generative AI. Stop coding from scratch, start designing with intelligence.' },
                            style: { fontSize: 18, color: '#64748b', lineHeight: '1.6', maxWidth: 500 }
                        },
                        {
                            id: 'hero-buttons',
                            type: 'container',
                            name: 'Actions',
                            props: {},
                            style: { display: 'flex', gap: 16, marginTop: 10 },
                            children: [
                                {
                                    id: 'hero-btn-1',
                                    type: 'button',
                                    name: 'Primary',
                                    props: { label: 'Start Building Free' },
                                    style: { 
                                        height: 52,
                                        padding: '0 32px', 
                                        backgroundColor: '#3b82f6', 
                                        color: '#ffffff', 
                                        borderRadius: 12, 
                                        fontSize: 15, 
                                        fontWeight: '600',
                                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                                    }
                                },
                                {
                                    id: 'hero-btn-2',
                                    type: 'button',
                                    name: 'Secondary',
                                    props: { label: 'View Demo' },
                                    style: { 
                                        height: 52,
                                        padding: '0 32px', 
                                        backgroundColor: 'rgba(255,255,255,0.05)', 
                                        color: '#ffffff', 
                                        borderRadius: 12, 
                                        fontSize: 15, 
                                        fontWeight: '600',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }
                                }
                            ]
                        }
                    ]
                },
                // Right Visual (Glass Cards)
                {
                    id: 'hero-visual',
                    type: 'container',
                    name: 'Visual Stack',
                    props: {},
                    style: { 
                        flex: 1, 
                        height: 500, 
                        position: 'relative',
                        display: 'flex',
                    },
                    children: [
                         {
                            id: 'glass-card-back',
                            type: 'container',
                            name: 'Back Card',
                            props: {},
                            style: {
                                position: 'absolute',
                                width: 380,
                                height: 240,
                                top: 40,
                                left: 140, 
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 24,
                                transform: 'rotate(6deg)',
                                zIndex: 1
                            },
                             children: []
                        },
                        {
                            id: 'glass-card-front',
                            type: 'container',
                            name: 'Front Card',
                            props: {},
                            style: {
                                position: 'absolute',
                                top: 80,
                                left: 80, 
                                width: 400,
                                height: 280,
                                backgroundColor: 'rgba(20, 20, 20, 0.6)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 24,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                zIndex: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: 24,
                                gap: 20
                            },
                            children: [
                                {
                                    id: 'card-header',
                                    type: 'container',
                                    name: 'Header',
                                    props: {},
                                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                                    children: [
                                        { id: 'card-title', type: 'text', name: 'Title', props: { text: 'Analytics' }, style: { fontSize: 16, fontWeight: 'bold' } },
                                        { id: 'card-icon', type: 'circle', name: 'Dot', props: {}, style: { width: 8, height: 8, backgroundColor: '#4ade80', borderRadius: '50%' } }
                                    ]
                                },
                                {
                                    id: 'chart-mock',
                                    type: 'container',
                                    name: 'Chart Area',
                                    props: {},
                                    style: { 
                                        flex: 1, 
                                        display: 'flex', 
                                        alignItems: 'flex-end', 
                                        gap: 12, 
                                        paddingBottom: 10,
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    },
                                    children: [
                                        { id: 'bar-1', type: 'box', name: 'Bar', props: {}, style: { flex: 1, height: '40%', backgroundColor: '#3b82f6', borderRadius: 4 } },
                                        { id: 'bar-2', type: 'box', name: 'Bar', props: {}, style: { flex: 1, height: '70%', backgroundColor: '#60a5fa', borderRadius: 4 } },
                                        { id: 'bar-3', type: 'box', name: 'Bar', props: {}, style: { flex: 1, height: '50%', backgroundColor: '#93c5fd', borderRadius: 4 } },
                                        { id: 'bar-4', type: 'box', name: 'Bar', props: {}, style: { flex: 1, height: '85%', backgroundColor: '#2563eb', borderRadius: 4 } },
                                    ]
                                },
                                {
                                    id: 'card-footer',
                                    type: 'text',
                                    name: 'Footer',
                                    props: { text: '+24% increase vs last week' },
                                    style: { fontSize: 12, color: '#94a3b8' }
                                }
                            ]
                        },
                         {
                            id: 'floating-badge',
                            type: 'container',
                            name: 'Badge',
                            props: {},
                            style: {
                                position: 'absolute',
                                left: 40,
                                bottom: 100,
                                backgroundColor: '#ffffff',
                                borderRadius: 100,
                                padding: '12px 24px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                zIndex: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10
                            },
                             children: [
                                 { id: 'badge-icon', type: 'circle', name: 'Icon', props: {}, style: { width: 16, height: 16, backgroundColor: '#3b82f6', borderRadius: '50%' } },
                                 { id: 'badge-text', type: 'text', name: 'Label', props: { text: 'AI Optimized' }, style: { color: '#000', fontWeight: 'bold', fontSize: 13 } }
                             ]
                        }
                    ]
                }
            ]
        },
        // Features Grid (FIXED: Added flex-wrap and better sizing)
        {
            id: 'features-section',
            type: 'section',
            name: 'Features',
            props: {},
            style: {
                width: '100%',
                height: 500, // EXPLICIT HEIGHT for features
                maxWidth: 1200,
                padding: '40px 40px',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap', // FIXED: Allow wrapping
                gap: 24,
                zIndex: 10,
                flexShrink: 0,
                boxSizing: 'border-box'
            },
            children: [
                {
                    id: 'feat-1',
                    type: 'container',
                    name: 'Feature Card 1',
                    props: {},
                    style: {
                        flex: '1 1 300px', // Allow shrink/grow with min-width
                        height: 220,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        padding: 30,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backdropFilter: 'blur(10px)',
                        boxSizing: 'border-box'
                    },
                    children: [
                        { id: 'f1-icon', type: 'text', name: 'Icon', props: { text: 'auto_awesome' }, style: { fontFamily: 'Material Icons', fontSize: 32, color: '#a78bfa' } },
                        {
                            id: 'f1-content',
                            type: 'container',
                            name: 'Content',
                            props: {},
                            style: { display: 'flex', flexDirection: 'column', gap: 8 },
                            children: [
                                { id: 'f1-title', type: 'text', name: 'Title', props: { text: 'Generative Design' }, style: { fontSize: 18, fontWeight: 'bold' } },
                                { id: 'f1-text', type: 'text', name: 'Text', props: { text: 'Create full layouts from a simple text prompt.' }, style: { fontSize: 14, color: '#94a3b8' } }
                            ]
                        }
                    ]
                },
                {
                    id: 'feat-2',
                    type: 'container',
                    name: 'Feature Card 2',
                    props: {},
                    style: {
                        flex: '1 1 300px',
                        height: 220,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        padding: 30,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backdropFilter: 'blur(10px)',
                        boxSizing: 'border-box'
                    },
                    children: [
                        { id: 'f2-icon', type: 'text', name: 'Icon', props: { text: 'code' }, style: { fontFamily: 'Material Icons', fontSize: 32, color: '#38bdf8' } },
                        {
                            id: 'f2-content',
                            type: 'container',
                            name: 'Content',
                            props: {},
                            style: { display: 'flex', flexDirection: 'column', gap: 8 },
                            children: [
                                { id: 'f2-title', type: 'text', name: 'Title', props: { text: 'React Export' }, style: { fontSize: 18, fontWeight: 'bold' } },
                                { id: 'f2-text', type: 'text', name: 'Text', props: { text: 'Production-ready code with Tailwind CSS.' }, style: { fontSize: 14, color: '#94a3b8' } }
                            ]
                        }
                    ]
                },
                {
                    id: 'feat-3',
                    type: 'container',
                    name: 'Feature Card 3',
                    props: {},
                    style: {
                        flex: '1 1 300px',
                        height: 220,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        padding: 30,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backdropFilter: 'blur(10px)',
                        boxSizing: 'border-box'
                    },
                    children: [
                        { id: 'f3-icon', type: 'text', name: 'Icon', props: { text: 'grid_view' }, style: { fontFamily: 'Material Icons', fontSize: 32, color: '#f472b6' } },
                        {
                            id: 'f3-content',
                            type: 'container',
                            name: 'Content',
                            props: {},
                            style: { display: 'flex', flexDirection: 'column', gap: 8 },
                            children: [
                                { id: 'f3-title', type: 'text', name: 'Title', props: { text: 'Smart Components' }, style: { fontSize: 18, fontWeight: 'bold' } },
                                { id: 'f3-text', type: 'text', name: 'Text', props: { text: 'Interactive atomic elements that scale.' }, style: { fontSize: 14, color: '#94a3b8' } }
                            ]
                        }
                    ]
                }
            ]
        },
        // Testimonials Section (NEW)
        {
            id: 'testimonials-section',
            type: 'section',
            name: 'Testimonials',
            props: {},
            style: {
                width: '100%',
                height: 600, // EXPLICIT HEIGHT for testimonials
                maxWidth: 1200,
                padding: '80px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 40,
                zIndex: 10,
                flexShrink: 0,
                boxSizing: 'border-box'
            },
            children: [
                { id: 'test-header', type: 'text', name: 'Header', props: { text: 'Loved by Developers' }, style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center' } },
                {
                    id: 'test-grid',
                    type: 'container',
                    name: 'Review Grid',
                    props: {},
                    style: { display: 'flex', flexDirection: 'row', gap: 24, flexWrap: 'wrap', justifyContent: 'center', width: '100%' },
                    children: [
                        {
                            id: 'review-1',
                            type: 'container',
                            name: 'Review Card',
                            props: {},
                            style: { flex: '1 1 300px', backgroundColor: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 16 },
                            children: [
                                { id: 'r1-text', type: 'text', name: 'Quote', props: { text: '"This tool saved me weeks of frontend work. The AI generation is startlingly accurate."' }, style: { fontSize: 14, color: '#cbd5e1', lineHeight: 1.5, fontStyle: 'italic' } },
                                { 
                                    id: 'r1-user', type: 'container', name: 'User', props: {}, style: { display: 'flex', alignItems: 'center', gap: 12 },
                                    children: [
                                        { id: 'r1-av', type: 'circle', name: 'Avatar', props: {}, style: { width: 32, height: 32, backgroundColor: '#3b82f6' } },
                                        { id: 'r1-name', type: 'text', name: 'Name', props: { text: 'Alex C. - Engineer' }, style: { fontSize: 12, fontWeight: 'bold' } }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 'review-2',
                            type: 'container',
                            name: 'Review Card',
                            props: {},
                            style: { flex: '1 1 300px', backgroundColor: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 16 },
                            children: [
                                { id: 'r2-text', type: 'text', name: 'Quote', props: { text: '"Finally, a design tool that actually understands code structure. The export is clean."' }, style: { fontSize: 14, color: '#cbd5e1', lineHeight: 1.5, fontStyle: 'italic' } },
                                { 
                                    id: 'r2-user', type: 'container', name: 'User', props: {}, style: { display: 'flex', alignItems: 'center', gap: 12 },
                                    children: [
                                        { id: 'r2-av', type: 'circle', name: 'Avatar', props: {}, style: { width: 32, height: 32, backgroundColor: '#ec4899' } },
                                        { id: 'r2-name', type: 'text', name: 'Name', props: { text: 'Sarah L. - Designer' }, style: { fontSize: 12, fontWeight: 'bold' } }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        // Contact / CTA Section (NEW)
        {
            id: 'contact-section',
            type: 'section',
            name: 'Contact CTA',
            props: {},
            style: {
                width: '100%',
                height: 500, // EXPLICIT HEIGHT for CTA
                maxWidth: 1200,
                padding: '60px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 24,
                zIndex: 10,
                flexShrink: 0,
                boxSizing: 'border-box',
                marginTop: 20
            },
            children: [
                {
                    id: 'cta-container',
                    type: 'container',
                    name: 'CTA Box',
                    props: {},
                    style: {
                        width: '100%',
                        maxWidth: 800,
                        backgroundColor: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                        padding: '48px',
                        borderRadius: 32,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 24,
                        border: '1px solid rgba(255,255,255,0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    },
                    children: [
                        { id: 'cta-glow', type: 'box', name: 'Glow', props: {}, isLocked: true, style: { position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.3), transparent 70%)', pointerEvents: 'none' } },
                        { id: 'cta-head', type: 'text', name: 'Heading', props: { text: 'Ready to build faster?' }, style: { fontSize: 32, fontWeight: 'bold', zIndex: 2 } },
                        { id: 'cta-sub', type: 'text', name: 'Sub', props: { text: 'Join 10,000+ developers shipping beautiful UIs today.' }, style: { fontSize: 16, color: '#c7d2fe', zIndex: 2 } },
                        {
                            id: 'cta-input-group',
                            type: 'container',
                            name: 'Input Group',
                            props: {},
                            style: { display: 'flex', gap: 12, marginTop: 12, width: '100%', maxWidth: 400, zIndex: 2, flexWrap: 'wrap' },
                            children: [
                                { id: 'email-input', type: 'button', name: 'Input Mock', props: { label: 'Enter your email' }, style: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', borderRadius: 8, padding: '12px', textAlign: 'left', cursor: 'text' } },
                                { id: 'join-btn', type: 'button', name: 'Join Btn', props: { label: 'Join Now' }, style: { backgroundColor: '#ffffff', color: '#4f46e5', fontWeight: 'bold', borderRadius: 8, padding: '12px 24px' } }
                            ]
                        }
                    ]
                }
            ]
        },
        // Footer (NEW)
        {
            id: 'footer-section',
            type: 'section',
            name: 'Footer',
            props: {},
            style: {
                width: '100%',
                height: 400, // EXPLICIT HEIGHT for footer
                padding: '60px 40px 40px 40px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 40,
                marginTop: 40,
                backgroundColor: '#000000',
                boxSizing: 'border-box',
                flexShrink: 0
            },
            children: [
                {
                    id: 'footer-top',
                    type: 'container',
                    name: 'Footer Top',
                    props: {},
                    style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 40 },
                    children: [
                        {
                            id: 'footer-brand',
                            type: 'container',
                            name: 'Brand',
                            props: {},
                            style: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 300 },
                            children: [
                                { id: 'ft-logo', type: 'text', name: 'Logo', props: { text: 'Protosigner.' }, style: { fontSize: 20, fontWeight: 'bold' } },
                                { id: 'ft-desc', type: 'text', name: 'Desc', props: { text: 'The next generation UI builder for the AI era.' }, style: { fontSize: 14, color: '#64748b' } }
                            ]
                        },
                        {
                            id: 'footer-links',
                            type: 'container',
                            name: 'Links Group',
                            props: {},
                            style: { display: 'flex', gap: 60, flexWrap: 'wrap' },
                            children: [
                                {
                                    id: 'col-1',
                                    type: 'container',
                                    name: 'Product',
                                    props: {},
                                    style: { display: 'flex', flexDirection: 'column', gap: 12 },
                                    children: [
                                        { id: 'h-1', type: 'text', name: 'Head', props: { text: 'PRODUCT' }, style: { fontSize: 12, fontWeight: 'bold', color: '#475569' } },
                                        { id: 'l-1a', type: 'text', name: 'Link', props: { text: 'Features' }, style: { fontSize: 14, color: '#94a3b8' } },
                                        { id: 'l-1b', type: 'text', name: 'Link', props: { text: 'Pricing' }, style: { fontSize: 14, color: '#94a3b8' } }
                                    ]
                                },
                                {
                                    id: 'col-2',
                                    type: 'container',
                                    name: 'Company',
                                    props: {},
                                    style: { display: 'flex', flexDirection: 'column', gap: 12 },
                                    children: [
                                        { id: 'h-2', type: 'text', name: 'Head', props: { text: 'COMPANY' }, style: { fontSize: 12, fontWeight: 'bold', color: '#475569' } },
                                        { id: 'l-2a', type: 'text', name: 'Link', props: { text: 'About' }, style: { fontSize: 14, color: '#94a3b8' } },
                                        { id: 'l-2b', type: 'text', name: 'Link', props: { text: 'Blog' }, style: { fontSize: 14, color: '#94a3b8' } }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'footer-btm',
                    type: 'container',
                    name: 'Bottom Bar',
                    props: {},
                    style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 30, borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: 20 },
                    children: [
                        { id: 'copy', type: 'text', name: 'Copyright', props: { text: '© 2026 ProtoSigner Inc.' }, style: { fontSize: 12, color: '#475569' } },
                        { 
                            id: 'socials', type: 'container', name: 'Socials', props: {}, style: { display: 'flex', gap: 16 },
                            children: [
                                { id: 'soc-1', type: 'text', name: 'Twitter', props: { text: '𝕏' }, style: { color: '#94a3b8', fontSize: 14 } },
                                { id: 'soc-2', type: 'text', name: 'GitHub', props: { text: 'GH' }, style: { color: '#94a3b8', fontSize: 14 } }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
  }
];
