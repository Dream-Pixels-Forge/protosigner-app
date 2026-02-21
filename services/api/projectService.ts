import type { Project } from './types';

const PROJECTS_STORAGE_KEY = 'protosigner_projects';

/**
 * Get all projects for current user
 */
export async function getProjects(userId?: string): Promise<Project[]> {
  // In production: fetch from API/database
  const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
  const allProjects: Project[] = stored ? JSON.parse(stored) : [];
  
  if (userId) {
    return allProjects.filter(p => p.userId === userId && !p.isDeleted);
  }
  
  return allProjects.filter(p => !p.isDeleted);
}

/**
 * Get single project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find(p => p.id === projectId) || null;
}

/**
 * Create new project
 */
export async function createProject(data: {
  userId: string;
  name: string;
  description?: string;
  width?: number;
  height?: number;
}): Promise<Project> {
  const projects = await getProjects();
  
  const newProject: Project = {
    id: crypto.randomUUID(),
    userId: data.userId,
    name: data.name,
    description: data.description || '',
    thumbnail: undefined,
    elements: [],
    settings: {
      width: data.width || 1440,
      height: data.height || 900,
      backgroundColor: '#030303',
      gridEnabled: true,
      gridColor: 'rgba(255,255,255,0.05)',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
  };
  
  projects.push(newProject);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  
  return newProject;
}

/**
 * Update existing project
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<Project> {
  const projects = await getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  
  if (index === -1) {
    throw new Error('Project not found');
  }
  
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  return projects[index];
}

/**
 * Soft delete project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const projects = await getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  
  if (index === -1) {
    throw new Error('Project not found');
  }
  
  projects[index].isDeleted = true;
  projects[index].updatedAt = new Date().toISOString();
  
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

/**
 * Permanently delete project (hard delete)
 */
export async function permanentlyDeleteProject(projectId: string): Promise<void> {
  const projects = await getProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Update project elements (canvas data)
 */
export async function updateProjectElements(
  projectId: string,
  elements: any[]
): Promise<Project> {
  return updateProject(projectId, { elements });
}

/**
 * Update project thumbnail
 */
export async function updateProjectThumbnail(
  projectId: string,
  thumbnailDataUrl: string
): Promise<Project> {
  return updateProject(projectId, { thumbnail: thumbnailDataUrl });
}
