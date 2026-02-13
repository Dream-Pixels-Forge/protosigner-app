
import { ExpertMode } from '../../types';

export const RANDOM_PROMPTS: Record<ExpertMode, string[]> = {
    'landing': [
        "A dark-mode SaaS landing page for an AI crypto trading bot. Use neon purple and blue gradients, glassmorphism cards, and a 'bento grid' layout for features. Inspired by Linear.app and Dribbble dark mode trends.",
        "A minimalist architecture firm portfolio. High contrast black and white, massive typography (120px+ headlines), overlapping images, and plenty of negative space. Behance 'Featured' style.",
        "A vibrant Neo-Brutalist landing page for a Gen-Z fashion brand. Use clashing colors (Acid Green and Hot Pink), thick black borders, hard shadows, and marquee scrolling text.",
        "A clean, eco-friendly landing page for a solar energy startup. Soft greens, earthy tones, rounded corners, and a split-screen hero section with a floating card effect.",
        "A futuristic 'Space Tourism' booking site. Deep space blue background, star field patterns, thin white lines, and a centered hero section with a glowing 'Launch' button."
    ],
    'full-stack': [
        "A developer documentation site layout. Fixed left sidebar navigation, right-side table of contents, clean typography, code block styling, and a top navbar with search.",
        "A CRM application shell. Collapsible sidebar, top header with user profile, breadcrumbs, and a main content area with a data table and filter bar.",
        "A project management board layout (Kanban style). Horizontal scrolling columns, drag-and-drop card styling, user avatars, and tag pills. Vercel dashboard aesthetic.",
        "A settings configuration page. Vertical tabs on the left, form inputs (switches, text fields) on the right, grouped into distinct sections with dividers."
    ],
    'hud': [
        "A tactical mech cockpit display. Central targeting reticle, peripheral health bars, ammo counters, and a radar in the bottom corner. Cyan and red color scheme. Monospace fonts.",
        "A spaceship navigation terminal. Star map visualization placeholder, warp speed velocity bars, system status diagnostics (shield integrity, fuel). Dark background, orange FUI elements.",
        "A cyberpunk hacker terminal. Cascading text logs, network node graph visualization, upload progress bars, and 'Access Denied' warning modals. Green on black CRT aesthetic.",
        "A medical bio-scan overlay. Human anatomy wireframe placeholder, vital signs (heart rate wave), DNA sequence analysis. Clean white and blue medical UI."
    ],
    'dashboard': [
        "A fintech crypto dashboard. Real-time price charts, portfolio balance in large font, recent transaction list, and a quick-buy widget. Dark mode with green/red indicators.",
        "A social media analytics dashboard. Follower growth line charts, engagement heatmaps, top post cards, and demographic pie charts. Clean, colorful, Dribbble style.",
        "A smart home control panel. Grid of tiles for lights (with sliders), temperature dial, security camera feed placeholders, and energy usage graph.",
        "An e-commerce admin overview. Total sales counters, order status badges, inventory alerts, and a revenue map visualization."
    ],
    'os': [
        "A macOS-inspired desktop interface. Top menu bar with clock, bottom floating dock with icons, and two floating windows (Finder and Calculator style) with blurred backgrounds.",
        "A retro Windows 95 style desktop. Teal background, gray windows with blue title bars, bevelled buttons, and a bottom 'Start' taskbar.",
        "A futuristic spatial computing OS. Floating translucent panes, eye-tracking cursor indicators, and 3D-effect depth layering."
    ],
    'mobile': [
        "A food delivery app home screen. Top address selector, horizontal scroll categories, restaurant cards with hero images and rating badges, bottom navigation bar.",
        "A fitness tracking app. Circular progress rings for daily goals, list of recent workouts, and a floating action button for 'New Activity'. Dark mode.",
        "A dating app profile view. Full-screen card stack, overlay buttons for 'Like/Nope', bio section, and photo gallery indicators.",
        "A mobile banking wallet. Credit card visualizer with tilt effect, transaction list, and quick transfer contacts."
    ]
};

export const getRandomPrompt = (mode: ExpertMode): string => {
    const prompts = RANDOM_PROMPTS[mode];
    if (!prompts) return "A beautiful modern UI layout.";
    return prompts[Math.floor(Math.random() * prompts.length)];
};
