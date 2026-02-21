
import { Skill } from '../../types';

export const SKILL_REGISTRY: Skill[] = [
    {
        id: 'hero-split',
        name: 'Split Hero Pattern',
        icon: 'vertical_split',
        description: 'High-conversion left text / right image layout.',
        instruction: 'Use a flex-row layout. Left side contains marketing copy (Badge, H1, Subtext, CTAs). Right side contains a visual container or image. Ensure responsive wrapping on smaller screens.',
        structure: {
            type: 'section',
            name: 'Hero Split',
            props: {},
            style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                minHeight: 600,
                padding: 60,
                gap: 60,
                backgroundColor: 'transparent',
                boxSizing: 'border-box'
            },
            children: [
                {
                    type: 'container',
                    name: 'Text Content',
                    props: {},
                    style: { 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 24, 
                        flex: 1, 
                        alignItems: 'flex-start',
                        minWidth: 300,
                        zIndex: 10
                    },
                    children: [
                        { type: 'text', name: 'Badge', props: { text: 'NEW FEATURE' }, style: { fontSize: 12, padding: 12, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)', width: 'max-content', flexShrink: 0 } },
                        { type: 'text', name: 'Headline', props: { text: 'Headline Text' }, style: { fontSize: 56, fontWeight: 800, lineHeight: 1.1, width: '100%', wordBreak: 'break-word' } },
                        { type: 'text', name: 'Subtext', props: { text: 'Subtitle text goes here. Make it compelling and descriptive.' }, style: { fontSize: 18, opacity: 0.8, lineHeight: 1.6, width: '100%', maxWidth: 600 } },
                        { type: 'container', name: 'Buttons', props: {}, style: { display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }, children: [
                            { type: 'button', name: 'Primary', props: { label: 'Get Started' }, style: { padding: 20, borderRadius: 8, backgroundColor: '#ffffff', color: '#000000', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' } },
                            { type: 'button', name: 'Secondary', props: { label: 'Learn More' }, style: { padding: 20, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, whiteSpace: 'nowrap' } }
                        ], isExpanded: true, isLocked: false}
                    ],
                    isExpanded: true,
                    isLocked: false
                },
                {
                    type: 'container',
                    name: 'Visual',
                    props: {},
                    style: { 
                        flex: 1, 
                        height: 500, 
                        minWidth: 350,
                        backgroundColor: 'rgba(255,255,255,0.03)', 
                        borderRadius: 24, 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    },
                    children: [],
                    isExpanded: true,
                    isLocked: false
                }
            ],
            isExpanded: true,
            isLocked: false
        }
    },
    {
        id: 'bento-grid',
        name: 'Bento Grid Pattern',
        icon: 'grid_view',
        description: 'Modern, grid-based feature layout.',
        instruction: 'Implement a CSS Grid layout with auto-fit columns. Create cards with rounded corners (24px) and subtle borders. Span specific cards (gridColumn: span 2) to create visual interest. Ideal for feature showcases. IMPORTANT: Use display:grid with gridTemplateColumns:repeat(auto-fit,minmax(280px,1fr)) for the main container. All cards should use gridColumn property.',
        structure: {
            type: 'section',
            name: 'Bento Grid',
            props: {},
            style: {
                display: 'grid',
                width: '100%',
                minHeight: 600,
                padding: 60,
                gap: 24,
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gridAutoRows: 280,
                boxSizing: 'border-box',
                alignItems: 'start'
            },
            children: [
                { type: 'container', name: 'Feature Card 1', props: {}, style: { gridColumn: 'span 1', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', minHeight: 280, boxSizing: 'border-box' }, children: [], isExpanded: true, isLocked: false },
                { type: 'container', name: 'Feature Card 2', props: {}, style: { gridColumn: 'span 1', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', minHeight: 280, boxSizing: 'border-box' }, children: [], isExpanded: true, isLocked: false },
                { type: 'container', name: 'Feature Card 3', props: {}, style: { gridColumn: 'span 1', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', minHeight: 280, boxSizing: 'border-box' }, children: [], isExpanded: true, isLocked: false },
                { type: 'container', name: 'Feature Card 4', props: {}, style: { gridColumn: 'span 1', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', minHeight: 280, boxSizing: 'border-box' }, children: [], isExpanded: true, isLocked: false }
            ],
            isExpanded: true,
            isLocked: false
        }
    },
    {
        id: 'saas-pricing',
        name: 'Pricing Table Skill',
        icon: 'attach_money',
        description: 'Three column pricing table.',
        instruction: 'Create 3 flex column cards. The center card should be "Featured" (scaled up 1.05x, different border color). Use flex-col for card internals: Header (Price), Body (Feature List), Footer (Button).',
        structure: {
            type: 'section',
            name: 'Pricing',
            props: {},
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48, padding: 50, width: '100%', boxSizing: 'border-box' },
            children: [
                { type: 'text', name: 'Title', props: { text: 'Simple Pricing' }, style: { fontSize: 48, fontWeight: 800, textAlign: 'center' } },
                { 
                    type: 'container',
                    name: 'Cards Row',
                    props: {},
                    style: { display: 'flex', gap: 32, width: '100%', maxWidth: 1100, justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap' },
                    children: [
                        { type: 'container', name: 'Basic', props: {}, style: { flex: 1, minWidth: 300, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 40, display: 'flex', flexDirection: 'column', gap: 20 }, children: [], isExpanded: true, isLocked: false },
                        { type: 'container', name: 'Pro', props: {}, style: { flex: 1, minWidth: 300, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24, border: '1px solid rgba(59, 130, 246, 0.5)', padding: 40, display: 'flex', flexDirection: 'column', gap: 20, transform: 'scale(1.05)', zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }, children: [], isExpanded: true, isLocked: false },
                        { type: 'container', name: 'Enterprise', props: {}, style: { flex: 1, minWidth: 300, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 40, display: 'flex', flexDirection: 'column', gap: 20 }, children: [], isExpanded: true, isLocked: false }
                    ],
                    isExpanded: true,
                    isLocked: false
                }
            ],
            isExpanded: true,
            isLocked: false
        }
    },
    {
        id: 'center-splash',
        name: 'Center Splash Pattern',
        icon: 'crop_free',
        description: 'Centered hero with background image.',
        instruction: 'Use absolute positioning for a full-width background image/video. Overlay a flex-column container (centered) with high z-index for the Typography and CTA. Ensure text contrast.',
        structure: {
            type: 'section',
            name: 'Center Splash',
            props: {},
            style: { 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                textAlign: 'center',
                width: '100%', 
                minHeight: 800,
                padding: 40,
                gap: 32,
                boxSizing: 'border-box',
                position: 'relative'
            },
            children: [
                 { type: 'text', name: 'Title', props: { text: 'Big Impact' }, style: { fontSize: 80, fontWeight: 900, letterSpacing: -3, lineHeight: 1.1, zIndex: 10 } },
                 { type: 'text', name: 'Sub', props: { text: 'Center aligned content for maximum focus.' }, style: { fontSize: 24, maxWidth: 700, opacity: 0.8, lineHeight: 1.6, zIndex: 10 } },
                 { type: 'button', name: 'CTA', props: { label: 'Start Now' }, style: { marginTop: 20, padding: 36, fontSize: 18, borderRadius: 100, backgroundColor: 'white', color: 'black', fontWeight: 700, zIndex: 10, flexShrink: 0 } }
            ],
            isExpanded: true,
            isLocked: false
        }
    },
    {
        id: 'modular-grid',
        name: 'Modular Grid System',
        icon: 'view_comfy',
        description: 'Mathematically perfect grid layout.',
        instruction: 'Create a strict 12-column grid container using CSS Grid. Use precise gaps (e.g. 20px). Distribute content into distinct modules spanning 3, 4, 6, or 12 columns. Ensure strict alignment and visual balance.',
        structure: {
            type: 'section',
            name: 'Modular Grid',
            props: {},
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: 20,
                width: '100%',
                padding: 40,
                boxSizing: 'border-box'
            },
            children: [
                { type: 'container', name: 'Module 4-Col', props: {}, style: { gridColumn: 'span 4', height: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }, children: [], isExpanded: true, isLocked: false },
                { type: 'container', name: 'Module 8-Col', props: {}, style: { gridColumn: 'span 8', height: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }, children: [], isExpanded: true, isLocked: false },
                { type: 'container', name: 'Module 6-Col', props: {}, style: { gridColumn: 'span 6', height: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }, children: [], isExpanded: true, isLocked: false },
                { type: 'container', name: 'Module 6-Col', props: {}, style: { gridColumn: 'span 6', height: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }, children: [], isExpanded: true, isLocked: false }
            ],
            isExpanded: true,
            isLocked: false
        }
    }
];
