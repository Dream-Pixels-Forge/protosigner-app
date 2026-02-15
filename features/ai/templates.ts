
import { UIElement } from '../../types';

export interface TemplateElement {
    type: UIElement['type'];
    name: string;
    props?: Record<string, any>;
    style?: UIElement['style'];
    children?: TemplateElement[];
}

export interface LayoutTemplate {
    id: string;
    name: string;
    icon: string;
    description: string;
    structure: TemplateElement;
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
    {
        id: 'hero-split',
        name: 'Split Hero',
        icon: 'vertical_split',
        description: 'High-conversion left text / right image layout.',
        structure: {
            type: 'section',
            name: 'Hero Split',
            style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                minHeight: 600, // Enforce height
                padding: 60,
                gap: 60, // Increased gap
                backgroundColor: 'transparent',
                boxSizing: 'border-box'
            },
            children: [
                {
                    type: 'container',
                    name: 'Text Content',
                    style: { 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 24, 
                        flex: 1, 
                        alignItems: 'flex-start',
                        minWidth: 300, // Prevent squash
                        zIndex: 10
                    },
                    children: [
                        { type: 'text', name: 'Badge', props: { text: 'NEW FEATURE' }, style: { fontSize: 12, padding: 10, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)', width: 'fit-content', flexShrink: 0 } },
                        { type: 'text', name: 'Headline', props: { text: 'Headline Text' }, style: { fontSize: 56, fontWeight: 800, lineHeight: 1.1, width: '100%', wordBreak: 'break-word' } },
                        { type: 'text', name: 'Subtext', props: { text: 'Subtitle text goes here. Make it compelling and descriptive.' }, style: { fontSize: 18, opacity: 0.8, lineHeight: 1.6, width: '100%', maxWidth: 600 } },
                        { type: 'container', name: 'Buttons', style: { display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }, children: [
                            { type: 'button', name: 'Primary', props: { label: 'Get Started' }, style: { padding: 20, borderRadius: 8, backgroundColor: '#ffffff', color: '#000000', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' } },
                            { type: 'button', name: 'Secondary', props: { label: 'Learn More' }, style: { padding: 20, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, whiteSpace: 'nowrap' } }
                        ]}
                    ]
                },
                {
                    type: 'container',
                    name: 'Visual',
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
                    children: []
                }
            ]
        }
    },
    {
        id: 'bento-grid',
        name: 'Bento Grid',
        icon: 'grid_view',
        description: 'Modern, grid-based feature layout.',
        structure: {
            type: 'section',
            name: 'Bento Grid',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Responsive grid
                gridAutoRows: 'minmax(280px, auto)',
                gap: 24,
                width: '100%',
                padding: 60,
                boxSizing: 'border-box'
            },
            children: [
                { type: 'container', name: 'Feature Large', style: { gridColumn: 'span 2', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 300 }, children: [] },
                { type: 'container', name: 'Feature Small', style: { gridColumn: 'span 1', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 300 }, children: [] },
                { type: 'container', name: 'Feature Small', style: { gridColumn: 'span 1', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 300 }, children: [] },
                { type: 'container', name: 'Feature Wide', style: { gridColumn: 'span 2', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 300 }, children: [] }
            ]
        }
    },
    {
        id: 'saas-pricing',
        name: 'Pricing',
        icon: 'attach_money',
        description: 'Three column pricing table.',
        structure: {
            type: 'section',
            name: 'Pricing',
            style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48, padding: 50, width: '100%', boxSizing: 'border-box' },
            children: [
                { type: 'text', name: 'Title', props: { text: 'Simple Pricing' }, style: { fontSize: 48, fontWeight: 800, textAlign: 'center' } },
                { 
                    type: 'container', 
                    name: 'Cards Row', 
                    style: { display: 'flex', gap: 32, width: '100%', maxWidth: 1100, justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap' },
                    children: [
                        { type: 'container', name: 'Basic', style: { flex: 1, minWidth: 300, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 40, display: 'flex', flexDirection: 'column', gap: 20 }, children: [] },
                        { type: 'container', name: 'Pro', style: { flex: 1, minWidth: 300, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24, border: '1px solid rgba(59, 130, 246, 0.5)', padding: 40, display: 'flex', flexDirection: 'column', gap: 20, transform: 'scale(1.05)', zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }, children: [] },
                        { type: 'container', name: 'Enterprise', style: { flex: 1, minWidth: 300, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: 40, display: 'flex', flexDirection: 'column', gap: 20 }, children: [] }
                    ]
                }
            ]
        }
    },
    {
        id: 'center-splash',
        name: 'Center Splash',
        icon: 'crop_free',
        description: 'Centered hero with background image.',
        structure: {
            type: 'section',
            name: 'Center Splash',
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
            ]
        }
    }
];
