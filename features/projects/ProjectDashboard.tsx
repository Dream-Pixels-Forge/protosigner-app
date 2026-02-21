import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProjects, createProject, deleteProject } from '@/services/api/projectService';
import type { Project } from '@/services/api/types';

interface ProjectDashboardProps {
  onOpenProject: (projectId: string) => void;
  onCreateNewProject: () => void;
}

export function ProjectDashboard({ onOpenProject, onCreateNewProject }: ProjectDashboardProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const userProjects = await getProjects(user?.id);
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !user) return;

    setIsCreating(true);
    try {
      const project = await createProject({
        userId: user.id,
        name: newProjectName.trim(),
        width: 1440,
        height: 900,
      });
      setProjects(prev => [project, ...prev]);
      setNewProjectName('');
      onCreateNewProject();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="h-full overflow-y-auto bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-slate-400 text-sm">Manage your design projects</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'alphabetical')}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recent</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
            
            {/* View Toggle */}
            <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                <span className="material-icons text-sm">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
              >
                <span className="material-icons text-sm">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Create Project Form */}
        <form onSubmit={handleCreateProject} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="New project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isCreating || !newProjectName.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>

        {/* Projects Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-icons text-6xl text-gray-700 mb-4">folder_open</span>
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to get started</p>
            <button
              onClick={onCreateNewProject}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Project
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => onOpenProject(project.id)}
                onDelete={(e) => handleDeleteProject(project.id, e)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map(project => (
              <ProjectListItem
                key={project.id}
                project={project}
                onClick={() => onOpenProject(project.id)}
                onDelete={(e) => handleDeleteProject(project.id, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-500/10"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-800 relative overflow-hidden">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-icons text-4xl text-gray-700">design_services</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
            <span className="material-icons text-sm">edit</span>
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400"
          >
            <span className="material-icons text-sm">delete</span>
          </button>
        </div>
      </div>
      
      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-medium mb-1 truncate">{project.name}</h3>
        <p className="text-gray-500 text-xs mb-3 line-clamp-2">
          {project.description || 'No description'}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
          <span>{project.elements?.length || 0} elements</span>
        </div>
      </div>
    </div>
  );
}

interface ProjectListItemProps {
  project: Project;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ProjectListItem({ project, onClick, onDelete }: ProjectListItemProps) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-blue-500/50 transition-all cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="w-24 h-16 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-icons text-2xl text-gray-700">design_services</span>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{project.name}</h3>
        <p className="text-gray-500 text-sm truncate">
          {project.description || 'No description'}
        </p>
      </div>
      
      {/* Meta */}
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <span>{project.elements?.length || 0} elements</span>
        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
        <button
          onClick={onDelete}
          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
        >
          <span className="material-icons text-sm">delete</span>
        </button>
      </div>
    </div>
  );
}
