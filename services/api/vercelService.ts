/**
 * Vercel Deployment Service
 * Handles OAuth flow and deployment management
 */

export interface VercelUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface VercelProject {
  id: string;
  name: string;
  framework: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  productionUrl?: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  url: string;
  state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  createdAt: string;
  ready?: number;
  error?: string;
}

const VERCEL_OAUTH_URL = 'https://vercel.com/oauth';
const VERCEL_API_URL = 'https://api.vercel.com';

/**
 * Initiate Vercel OAuth flow
 */
export function initiateVercelOAuth(): void {
  const clientId = process.env.VERCEL_CLIENT_ID;
  const redirectUri = window.location.origin + '/api/vercel/callback';
  
  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
  });
  
  window.location.href = `${VERCEL_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch('/api/vercel/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Get current Vercel user
 */
export async function getVercelUser(accessToken: string): Promise<VercelUser> {
  const response = await fetch(`${VERCEL_API_URL}/v2/user`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to get Vercel user');
  }
  
  const data = await response.json();
  return data.user;
}

/**
 * Get user's Vercel projects
 */
export async function getVercelProjects(accessToken: string): Promise<VercelProject[]> {
  const response = await fetch(`${VERCEL_API_URL}/v9/projects`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to get Vercel projects');
  }
  
  const data = await response.json();
  return data.projects;
}

/**
 * Create deployment
 */
export async function createDeployment(
  accessToken: string,
  projectId: string,
  files: Array<{ file: string; data: string }>
): Promise<Deployment> {
  const response = await fetch(`${VERCEL_API_URL}/v13/deployments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId,
      files,
      name: `protosigner-export-${Date.now()}`,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create deployment');
  }
  
  return response.json();
}

/**
 * Get deployment status
 */
export async function getDeployment(
  accessToken: string,
  deploymentId: string
): Promise<Deployment> {
  const response = await fetch(
    `${VERCEL_API_URL}/v13/deployments/${deploymentId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to get deployment status');
  }
  
  return response.json();
}

/**
 * Poll deployment until ready or error
 */
export async function waitForDeployment(
  accessToken: string,
  deploymentId: string,
  timeoutMs: number = 300000
): Promise<Deployment> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const deployment = await getDeployment(accessToken, deploymentId);
    
    if (deployment.state === 'READY') {
      return deployment;
    }
    
    if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
      throw new Error(deployment.error || `Deployment ${deployment.state}`);
    }
    
    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  throw new Error('Deployment timeout');
}

/**
 * Disconnect Vercel account
 */
export function disconnectVercel(): void {
  localStorage.removeItem('vercel_token');
  localStorage.removeItem('vercel_user');
}

/**
 * Check if Vercel is connected
 */
export function isVercelConnected(): boolean {
  const token = localStorage.getItem('vercel_token');
  return !!token;
}

/**
 * Get stored Vercel token
 */
export function getVercelToken(): string | null {
  return localStorage.getItem('vercel_token');
}

/**
 * Store Vercel token
 */
export function storeVercelToken(token: string, user: VercelUser): void {
  localStorage.setItem('vercel_token', token);
  localStorage.setItem('vercel_user', JSON.stringify(user));
}

/**
 * Get stored Vercel user
 */
export function getVercelUserFromStorage(): VercelUser | null {
  const stored = localStorage.getItem('vercel_user');
  return stored ? JSON.parse(stored) : null;
}
