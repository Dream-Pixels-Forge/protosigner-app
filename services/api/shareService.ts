/**
 * Shareable Links Service
 * Creates time-limited and password-protected share links
 */

export interface ShareLink {
  id: string;
  projectId: string;
  token: string;
  expiresAt?: string;
  passwordHash?: string;
  allowEdit: boolean;
  maxViews?: number;
  viewCount: number;
  createdAt: string;
  createdBy: string;
}

export interface ShareOptions {
  projectId: string;
  expiresInSeconds?: number;
  password?: string;
  allowEdit?: boolean;
  maxViews?: number;
}

const SHARE_LINKS_STORAGE_KEY = 'protosigner_share_links';

/**
 * Generate secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simple hash function for passwords (use bcrypt in production)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a new share link
 */
export async function createShareLink(options: ShareOptions): Promise<ShareLink> {
  const links = await getShareLinks();
  
  const shareLink: ShareLink = {
    id: crypto.randomUUID(),
    projectId: options.projectId,
    token: generateToken(),
    expiresAt: options.expiresInSeconds
      ? new Date(Date.now() + options.expiresInSeconds * 1000).toISOString()
      : undefined,
    passwordHash: options.password ? await hashPassword(options.password) : undefined,
    allowEdit: options.allowEdit || false,
    maxViews: options.maxViews,
    viewCount: 0,
    createdAt: new Date().toISOString(),
    createdBy: 'current-user', // Replace with actual user ID
  };
  
  links.push(shareLink);
  localStorage.setItem(SHARE_LINKS_STORAGE_KEY, JSON.stringify(links));
  
  return shareLink;
}

/**
 * Get share link by token
 */
export async function getShareLinkByToken(token: string): Promise<ShareLink | null> {
  const links = await getShareLinks();
  const link = links.find(l => l.token === token);
  
  if (!link) return null;
  
  // Check if expired
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return null;
  }
  
  // Check if max views reached
  if (link.maxViews && link.viewCount >= link.maxViews) {
    return null;
  }
  
  return link;
}

/**
 * Verify password for share link
 */
export async function verifySharePassword(token: string, password: string): Promise<boolean> {
  const link = await getShareLinkByToken(token);
  if (!link) return false;
  
  if (!link.passwordHash) return true; // No password required
  
  const inputHash = await hashPassword(password);
  return link.passwordHash === inputHash;
}

/**
 * Increment view count
 */
export async function incrementViewCount(token: string): Promise<void> {
  const links = await getShareLinks();
  const index = links.findIndex(l => l.token === token);
  
  if (index !== -1) {
    links[index].viewCount++;
    localStorage.setItem(SHARE_LINKS_STORAGE_KEY, JSON.stringify(links));
  }
}

/**
 * Delete share link
 */
export async function deleteShareLink(token: string): Promise<void> {
  const links = await getShareLinks();
  const filtered = links.filter(l => l.token !== token);
  localStorage.setItem(SHARE_LINKS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Get all share links for a project
 */
export async function getShareLinksForProject(projectId: string): Promise<ShareLink[]> {
  const links = await getShareLinks();
  return links.filter(l => l.projectId === projectId);
}

/**
 * Get all share links
 */
async function getShareLinks(): Promise<ShareLink[]> {
  const stored = localStorage.getItem(SHARE_LINKS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Clean up expired links
 */
export function cleanupExpiredLinks(): void {
  const now = new Date();
  const links = JSON.parse(localStorage.getItem(SHARE_LINKS_STORAGE_KEY) || '[]');
  const valid = links.filter((l: ShareLink) => {
    if (!l.expiresAt) return true;
    return new Date(l.expiresAt) > now;
  });
  localStorage.setItem(SHARE_LINKS_STORAGE_KEY, JSON.stringify(valid));
}

/**
 * Generate share URL
 */
export function generateShareUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}/share/${token}`;
}

/**
 * Parse share token from URL
 */
export function parseShareTokenFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const match = urlObj.pathname.match(/\/share\/([a-f0-9]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
