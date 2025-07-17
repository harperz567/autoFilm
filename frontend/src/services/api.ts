import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  StoryboardScene,
  ConversionRequest,
  ConversionResponse,
  ExportRequest,
  ExportResponse,
  ApiResponse,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post(
      '/auth/login',
      credentials
    );
    
    if (response.data.success && response.data.data) {
      this.setToken(response.data.data.token);
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post(
      '/auth/register',
      userData
    );
    
    if (response.data.success && response.data.data) {
      this.setToken(response.data.data.token);
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/profile');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get profile');
  }

  // Project endpoints
  async getProjects(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Project>> {
    const response: AxiosResponse<PaginatedResponse<Project>> = await this.api.get(
      `/projects?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await this.api.get(`/projects/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get project');
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await this.api.post(
      '/projects',
      projectData
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to create project');
  }

  async updateProject(id: string, projectData: UpdateProjectRequest): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await this.api.put(
      `/projects/${id}`,
      projectData
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update project');
  }

  async deleteProject(id: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/projects/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete project');
    }
  }

  // Storyboard endpoints
  async convertScript(conversionData: ConversionRequest): Promise<ConversionResponse> {
    const response: AxiosResponse<ApiResponse<ConversionResponse>> = await this.api.post(
      `/projects/${conversionData.projectId}/convert`,
      conversionData
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to convert script');
  }

  async getStoryboard(projectId: string): Promise<StoryboardScene[]> {
    const response: AxiosResponse<ApiResponse<StoryboardScene[]>> = await this.api.get(
      `/projects/${projectId}/storyboard`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to get storyboard');
  }

  async updateStoryboard(projectId: string, storyboard: StoryboardScene[]): Promise<StoryboardScene[]> {
    const response: AxiosResponse<ApiResponse<StoryboardScene[]>> = await this.api.put(
      `/projects/${projectId}/storyboard`,
      { storyboard }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update storyboard');
  }

  // File upload endpoints
  async uploadFile(file: File, projectId?: string): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('projectId', projectId);
    }

    const response: AxiosResponse<ApiResponse<{ url: string; filename: string }>> = await this.api.post(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to upload file');
  }

  // Export endpoints
  async exportProject(exportData: ExportRequest): Promise<ExportResponse> {
    const response: AxiosResponse<ApiResponse<ExportResponse>> = await this.api.post(
      `/projects/${exportData.projectId}/export`,
      exportData
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to export project');
  }

  // Cache endpoints (for future Redis implementation)
  async clearCache(projectId?: string): Promise<void> {
    const endpoint = projectId ? `/cache/project/${projectId}` : '/cache/clear';
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(endpoint);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to clear cache');
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response: AxiosResponse<{ status: string; timestamp: string }> = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;