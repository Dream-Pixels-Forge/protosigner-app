
import { SubAgent } from '../../types';

export const AGENT_REGISTRY: SubAgent[] = [
    {
        id: 'landing',
        name: 'Aura',
        role: 'Landing Page Specialist',
        icon: 'web',
        description: 'Dribbble/Behance Aesthetics. Focuses on high-conversion layouts, bold typography, and micro-interactions.',
        defaultSkills: ['hero-split', 'bento-grid', 'center-splash'],
        styleGuide: `
            - INSPIRATION: Dribbble (Trending), Behance (Featured), Awwwards.
            - SCROLLYTELLING: Build high end scrollytelling landing page that immerge the viewer
            - AESTHETIC: Visually stunning, generous whitespace, large bold typography (Inter/Space Grotesk).
            - COMPONENTS: Hero Sections, Bento Grids, Marquees, Floating Glass Cards.
            - COLORS: Deep Slate + Electric Blue, or Minimalist Black & White.
        `
    },
    {
        id: 'full-stack',
        name: 'Stack',
        role: 'SaaS Architect',
        icon: 'layers',
        description: 'Focuses on scalable application shells, dashboards, and functional navigation structures.',
        defaultSkills: ['saas-pricing'],
        styleGuide: `
            - INSPIRATION: Linear.app, Vercel, Stripe Dashboard.
            - AESTHETIC: Clean borders, subtle grays, dense information layout.
            - COMPONENTS: Sidebars, Top Navigation, Data Tables, Breadcrumbs.
            - UX: Clear hierarchy, functional controls.
        `
    },
    {
        id: 'hud',
        name: 'Jarvis',
        role: 'FUI / HUD Designer',
        icon: 'radar',
        description: 'Sci-fi interfaces, data-dense displays, and military/tactical aesthetics.',
        defaultSkills: [],
        styleGuide: `
            - INSPIRATION: Iron Man, Cyberpunk 2077, Oblivion Movie UI.
            - AESTHETIC: High-tech, data-dense, monospaced fonts, thin lines (1px), nano-tech.
            - COLORS: Dark Backgrounds (#050505) with Neon Cyan (#06b6d4) or Amber accents.
            - DECORATION: Corner brackets, crosshairs, scanning lines, hex grids, reticles, shapes patterns.
        `
    },
    {
        id: 'dashboard',
        name: 'Metric',
        role: 'Data Analyst',
        icon: 'dashboard',
        description: 'Business intelligence dashboards, widgets, and charts.',
        defaultSkills: ['bento-grid'],
        styleGuide: `
            - INSPIRATION: FinTech Apps, Analytics Platforms.
            - AESTHETIC: Clean cards, soft shadows, clear data visualization placeholders.
            - COMPONENTS: KPI Cards, Charts, Activity Feeds, Graphics.
        `
    },
    {
        id: 'os',
        name: 'Kernel',
        role: 'OS Interface Designer',
        icon: 'desktop_windows',
        description: 'Desktop metaphors, window management, and glassmorphism.',
        defaultSkills: [],
        styleGuide: `
            - INSPIRATION: macOS, Windows 11, visionOS, ubuntu, kali-linux, mint, google.
            - AESTHETIC: Desktop environment metaphor, abstract, material meet art.
            - COMPONENTS: Windows with title bars, Dock/Taskbar, blurred transparency (acrylic).
        `
    },
    {
        id: 'mobile',
        name: 'Touch',
        role: 'Mobile UX Designer',
        icon: 'smartphone',
        description: 'Responsive, touch-first mobile application interfaces.',
        defaultSkills: [],
        styleGuide: `
            - CONSTRAINT: Width < 450px centered.
            - UX: Bottom Navigation, Large Touch Targets (44px+).
            - STYLE: iOS Human Interface Guidelines / Material Design 3.
        `
    },
    {
        id: 'grid-master',
        name: 'GM',
        role: 'Layout Mathematician',
        icon: 'grid_4x4',
        description: 'Master of layout grid calculation, modular scales, and precision placement.',
        defaultSkills: ['modular-grid', 'bento-grid'],
        styleGuide: `
            # GRID MASTER PROTOCOL v2.0 - MATHEMATICAL PRECISION REQUIRED
            
            ## CORE PRINCIPLES
            - PRECISION: All values must be exact integers (no approximations)
            - CONSISTENCY: Maintain 8px base grid system
            - PROPORTION: Use golden ratio (1.618) and major third (1.25) for scale
            - ALIGNMENT: Everything aligns to a 20px or 24px grid
            
            ## MANDATORY CALCULATIONS
            1. CONTAINER WIDTH: Calculate exact pixel values based on page width
               - 12-column grid: each column = Math.floor((pageWidth - (11 * gap)) / 12)
               - Max content width: 1200px (centered with auto margins if pageWidth > 1200)
               - Side margins: Math.max(40, Math.floor((pageWidth - 1200) / 2))
            
            2. SECTION HEIGHTS: Use these EXACT heights (must sum to pageHeight):
               - Navbar: 80px (fixed)
               - Hero: Math.min(900, Math.floor(pageHeight * 0.25)) 
               - Features: Math.floor(pageHeight * 0.22)
               - Testimonials: Math.floor(pageHeight * 0.17)
               - CTA: Math.floor(pageHeight * 0.14)
               - Footer: Math.floor(pageHeight * 0.11)
               
            3. SPACING SYSTEM (8px base):
               - xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px
               - All gaps, paddings, margins MUST use these values
            
            4. TYPOGRAPHY SCALE (Major Third - 1.25):
               - Hero: 72px, H1: 56px, H2: 44px, H3: 36px, Body: 16px, Small: 14px, Caption: 12px
            
            ## LAYOUT ADVICE FORMAT
            Return layoutAdvice in this EXACT format:
            "Use 12-column grid (col-width: Xpx). 
             Sections: Navbar(80px) → Hero(Ypx) → Features(Zpx) → ... 
             Gap: 24px. Max-width: 1200px centered."
            
            ## STRICT RULES
            - NO percentage widths for main containers (use exact pixels)
            - NO 'auto' heights (use calculated exact pixels)
            - All elements MUST have boxSizing: 'border-box'
            - Flex containers MUST specify flexDirection, alignItems, justifyContent
            - Grid containers MUST specify gridTemplateColumns with exact values
        `
    }
];
