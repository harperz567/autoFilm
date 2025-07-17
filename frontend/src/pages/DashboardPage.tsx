import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Calendar, MoreVertical, Trash2, Edit, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Layout, PageContainer } from '../components/layout';
import { Button, Card, Alert, Modal, Input, Textarea } from '../components/ui';
import { Project, CreateProjectRequest } from '../types';
import apiService from '../services/api';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { projects, setProjects, updateProject, removeProject, uiState, setLoading, setError, setSuccess } = useApp();
  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Create project form state
  const [createForm, setCreateForm] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    scriptContent: '',
  });
  const [createErrors, setCreateErrors] = useState<Partial<CreateProjectRequest>>({});

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects();
      setProjects(response.data);
    } catch (error) {
      setError({
        code: 'LOAD_PROJECTS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to load projects',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const validateCreateForm = (): boolean => {
    const errors: Partial<CreateProjectRequest> = {};

    if (!createForm.name.trim()) {
      errors.name = 'Project name is required';
    } else if (createForm.name.length < 3) {
      errors.name = 'Project name must be at least 3 characters';
    }

    if (createForm.description && createForm.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCreateForm()) return;

    try {
      setLoading(true);
      const newProject = await apiService.createProject(createForm);
      setProjects([...projects, newProject]);
      setSuccess('Project created successfully!');
      setIsCreateModalOpen(false);
      setCreateForm({ name: '', description: '', scriptContent: '' });
      setCreateErrors({});
    } catch (error) {
      setError({
        code: 'CREATE_PROJECT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create project',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      await apiService.deleteProject(selectedProject.id);
      removeProject(selectedProject.id);
      setSuccess('Project deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      setError({
        code: 'DELETE_PROJECT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to delete project',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = (project: Project) => {
    navigate(`/editor/${project.id}`);
  };

  const handleExportProject = async (project: Project) => {
    try {
      setLoading(true);
      const exportResponse = await apiService.exportProject({
        projectId: project.id,
        format: 'pdf',
      });
      
      // Create download link
      const link = document.createElement('a');
      link.href = exportResponse.downloadUrl;
      link.download = exportResponse.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Project exported successfully!');
    } catch (error) {
      setError({
        code: 'EXPORT_PROJECT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to export project',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSceneCount = (project: Project) => {
    return project.storyboardData?.length || 0;
  };

  return (
    <Layout requireAuth>
      <PageContainer
        title={`Welcome back, ${user?.username}!`}
        subtitle="Manage your script-to-storyboard projects"
      >
        {/* Error/Success Messages */}
        {uiState.error && (
          <Alert
            type="error"
            message={uiState.error.message}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}
        
        {uiState.success && (
          <Alert
            type="success"
            message={uiState.success}
            onClose={() => setSuccess(null)}
            className="mb-6"
          />
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              Your Projects ({projects.length})
            </h2>
            <p className="text-sm text-secondary-600">
              Create and manage your storyboard projects
            </p>
          </div>
          
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>

        {/* Projects Grid */}
        {uiState.isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No projects yet
            </h3>
            <p className="text-secondary-600 mb-6">
              Get started by creating your first project
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Project</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="relative hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 truncate">
                    {project.name}
                  </h3>
                  
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDropdownOpen(
                        dropdownOpen === project.id ? null : project.id
                      )}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    
                    {dropdownOpen === project.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <button
                          onClick={() => {
                            handleEditProject(project);
                            setDropdownOpen(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleExportProject(project);
                            setDropdownOpen(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setIsDeleteModalOpen(true);
                            setDropdownOpen(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                  {project.description || 'No description provided'}
                </p>

                <div className="flex items-center text-sm text-secondary-500 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Updated {formatDate(project.updatedAt)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-secondary-600">
                    {getSceneCount(project)} scenes
                  </div>
                  
                  <Link
                    to={`/editor/${project.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Open Project →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Project Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Project"
          size="md"
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            <Input
              label="Project Name"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              error={createErrors.name}
              placeholder="Enter project name"
              required
            />

            <Textarea
              label="Description (Optional)"
              value={createForm.description || ''}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              error={createErrors.description}
              placeholder="Brief description of your project"
              rows={3}
            />

            <Textarea
              label="Initial Script (Optional)"
              value={createForm.scriptContent || ''}
              onChange={(e) => setCreateForm({ ...createForm, scriptContent: e.target.value })}
              placeholder="Paste your script here or leave empty to add later"
              rows={6}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={uiState.isLoading}>
                Create Project
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Project"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-secondary-700">
              Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteProject}
                isLoading={uiState.isLoading}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </Modal>
      </PageContainer>
    </Layout>
  );
};