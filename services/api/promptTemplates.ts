/**
 * Prompt Templates for common UI patterns
 */
export interface PromptTemplate {
  id: string;
  name: string;
  category: 'layout' | 'component' | 'page' | 'utility';
  description: string;
  prompt: string;
  tags: string[];
  examples?: string[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Layout Templates
  {
    id: 'hero-section',
    name: 'Hero Section',
    category: 'layout',
    description: 'Eye-catching hero section with headline and CTA',
    prompt: 'Create a modern hero section with a bold headline, supporting subheadline, primary CTA button, secondary CTA button, and a hero image or illustration on the right side. Use a gradient background.',
    tags: ['hero', 'landing', 'header', 'cta'],
  },
  {
    id: 'feature-grid',
    name: 'Feature Grid',
    category: 'layout',
    description: 'Grid of feature cards with icons',
    prompt: 'Create a 3-column feature grid section. Each card should have an icon at the top, a title, description text, and a learn more link. Add hover effects and use a subtle card background.',
    tags: ['features', 'grid', 'cards'],
  },
  {
    id: 'pricing-section',
    name: 'Pricing Section',
    category: 'layout',
    description: 'Pricing tiers with feature comparison',
    prompt: 'Create a pricing section with 3 tiers (Free, Pro, Team). Each tier card shows the price, billing period, feature list with checkmarks, and a CTA button. Highlight the middle tier as "Most Popular".',
    tags: ['pricing', 'tiers', 'comparison'],
  },
  {
    id: 'testimonial-grid',
    name: 'Testimonials',
    category: 'layout',
    description: 'Customer testimonials with avatars',
    prompt: 'Create a testimonial section with a 2x2 grid of testimonial cards. Each card has a quote, customer avatar, name, role, and company. Add star ratings and use a subtle quote icon decoration.',
    tags: ['testimonials', 'reviews', 'social-proof'],
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    category: 'layout',
    description: 'Contact form with validation',
    prompt: 'Create a contact form section with fields for name, email, subject dropdown, and message textarea. Include a submit button, success message area, and contact information sidebar.',
    tags: ['contact', 'form', 'input'],
  },
  
  // Component Templates
  {
    id: 'navbar',
    name: 'Navigation Bar',
    category: 'component',
    description: 'Responsive navigation with logo and links',
    prompt: 'Create a modern navigation bar with a logo on the left, navigation links in the center, and CTA buttons on the right. Add a mobile hamburger menu. Use glass morphism effect.',
    tags: ['nav', 'header', 'menu', 'responsive'],
  },
  {
    id: 'card',
    name: 'Content Card',
    category: 'component',
    description: 'Versatile content card component',
    prompt: 'Create a content card with an image header, title, description text, tags/chips, author info with avatar, and action buttons (like, share, bookmark). Add hover lift effect.',
    tags: ['card', 'content', 'media'],
  },
  {
    id: 'modal',
    name: 'Modal Dialog',
    category: 'component',
    description: 'Reusable modal dialog',
    prompt: 'Create a modal dialog with a backdrop, centered content area, close button (X), header with title, body content, and footer with primary and secondary action buttons. Add smooth fade-in animation.',
    tags: ['modal', 'dialog', 'popup'],
  },
  {
    id: 'data-table',
    name: 'Data Table',
    category: 'component',
    description: 'Sortable data table with pagination',
    prompt: 'Create a data table with sortable column headers, row hover effects, checkbox selection, action menu per row, and pagination controls at the bottom. Include search and filter options above the table.',
    tags: ['table', 'data', 'grid'],
  },
  
  // Page Templates
  {
    id: 'landing-page',
    name: 'Landing Page',
    category: 'page',
    description: 'Complete landing page structure',
    prompt: 'Create a complete landing page with: sticky navbar, hero section, logo cloud, features grid, how-it-works section, testimonials, pricing table, FAQ accordion, CTA section, and footer with links.',
    tags: ['landing', 'page', 'complete'],
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'page',
    description: 'Admin dashboard layout',
    prompt: 'Create an admin dashboard with a sidebar navigation, top bar with search and user menu, and a main content area showing: stats cards, a chart area, recent activity table, and quick action buttons.',
    tags: ['dashboard', 'admin', 'analytics'],
  },
  {
    id: 'auth-page',
    name: 'Auth Page',
    category: 'page',
    description: 'Login/Register page',
    prompt: 'Create an authentication page with a split layout: left side has branding and testimonial, right side has a tabbed form for login and registration with social login options (Google, GitHub).',
    tags: ['auth', 'login', 'register'],
  },
  
  // Utility Templates
  {
    id: 'empty-state',
    name: 'Empty State',
    category: 'utility',
    description: 'Empty state with illustration and CTA',
    prompt: 'Create an empty state component with an illustration, headline, description text, and a primary action button. Use a subtle background pattern.',
    tags: ['empty', 'state', 'placeholder'],
  },
  {
    id: 'loading-spinner',
    name: 'Loading States',
    category: 'utility',
    description: 'Various loading indicators',
    prompt: 'Create a set of loading states: a centered spinner, skeleton loaders for cards, progress bar, and a loading overlay with backdrop blur.',
    tags: ['loading', 'spinner', 'skeleton'],
  },
  {
    id: 'error-boundary',
    name: 'Error State',
    category: 'utility',
    description: 'Error boundary with recovery options',
    prompt: 'Create an error state component with an error icon, error message, technical details (collapsible), retry button, and contact support link.',
    tags: ['error', 'boundary', 'fallback'],
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(t => t.category === category);
}

/**
 * Search templates by keyword
 */
export function searchTemplates(query: string): PromptTemplate[] {
  const lowerQuery = query.toLowerCase();
  return PROMPT_TEMPLATES.filter(
    t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(t => t.id === id);
}

/**
 * Get smart suggestions based on current context
 */
export function getSmartSuggestions(context: {
  elementType?: string;
  currentElements?: any[];
  userIntent?: string;
}): string[] {
  const suggestions: string[] = [];
  
  if (!context.elementType && (!context.currentElements || context.currentElements.length === 0)) {
    // Empty canvas - suggest starting points
    suggestions.push(
      'Create a hero section with headline and CTA',
      'Build a landing page with all sections',
      'Design a dashboard layout',
    );
  } else if (context.elementType === 'button') {
    suggestions.push(
      'Add a form with this button',
      'Create a card component',
      'Build a modal dialog',
    );
  } else if (context.elementType === 'text') {
    suggestions.push(
      'Add surrounding container',
      'Create a heading hierarchy',
      'Build a content section',
    );
  }
  
  return suggestions;
}
