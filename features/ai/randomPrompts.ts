
import { ExpertMode } from '../../types';

export const RANDOM_PROMPTS: Record<ExpertMode, string[]> = {
    'landing': [
        "Modern SaaS hero section with gradient background transitioning from deep blue to violet, glass-effect cards with subtle shadows, clean typography hierarchy.",
        "Minimalist portfolio layout with bold typography, high contrast black and white, asymmetric image placement, generous negative space.",
        "Vibrant brand landing page with bold colors, thick borders, strong shadows, energetic typography, clear call-to-action buttons.",
        "Clean eco-friendly design with soft green tones, rounded corners, floating card elements, organic shapes, welcoming hero section.",
        "Futuristic tech landing with dark background, glowing accents, thin geometric lines, centered hero layout, prominent action button."
    ],
    'full-stack': [
        "Documentation layout with fixed sidebar navigation, content area with code blocks, top search bar, clean typography, organized sections.",
        "Application dashboard with collapsible sidebar, header with user profile, breadcrumb navigation, main content area with data table and filters.",
        "Project board with horizontal columns, draggable task cards, user avatars, color-coded tags, clean modern aesthetic.",
        "Settings page with vertical tab navigation, form sections with toggles and inputs, clear visual grouping, organized layout."
    ],
    'hud': [
        "Tactical interface with central targeting display, peripheral status bars, corner radar element, monospace readouts, cyan and red accents.",
        "Navigation console with star map visualization, velocity indicators, system diagnostics panel, dark background with amber highlights.",
        "Terminal interface with scrolling data logs, network visualization, progress indicators, green phosphor on black aesthetic.",
        "Medical scan overlay with anatomical wireframe, vital signs display, waveform graphs, clean white and blue color scheme."
    ],
    'dashboard': [
        "Financial dashboard with real-time charts, large balance display, transaction list, quick-action widget, dark theme with status colors.",
        "Analytics panel with growth charts, engagement metrics, content performance cards, demographic visualizations, colorful modern design.",
        "Smart home control with device tiles, temperature controls, camera feed grids, energy usage graphs, intuitive layout.",
        "E-commerce admin with sales metrics, order status timeline, inventory alerts, revenue map, organized card layout."
    ],
    'os': [
        "Desktop interface with translucent menu bar, floating dock with icons, overlapping windows with blur effects, smooth animations.",
        "Retro desktop with teal background, gray windows with title bars, beveled buttons, taskbar with system tray.",
        "Modern spatial interface with floating translucent panels, depth layering, smooth transitions, clean minimalist design."
    ],
    'mobile': [
        "Food app home screen with location selector, horizontal category scroll, restaurant cards with images and ratings, bottom navigation.",
        "Fitness app with circular progress rings, activity list with icons, floating action button, dark theme with accent colors.",
        "Profile card interface with full-screen layout, action buttons, bio section, photo gallery indicators, swipe gestures.",
        "Banking app with card display, transaction timeline, quick-send contacts, balance animation, secure modern design."
    ]
};

export const getRandomPrompt = (mode: ExpertMode): string => {
    const prompts = RANDOM_PROMPTS[mode];
    if (!prompts) return "A beautiful modern UI layout.";
    return prompts[Math.floor(Math.random() * prompts.length)];
};
