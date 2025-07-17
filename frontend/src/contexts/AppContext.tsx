import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, UIState, AppError } from '../types';

interface AppContextType {
  // UI State
  uiState: UIState;
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  setSuccess: (message: string | null) => void;
  clearMessages: () => void;
  
  // Current project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  
  // Projects list
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  updateProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  
  // Cache functionality (placeholder for future Redis implementation)
  cacheEnabled: boolean;
  setCacheEnabled: (enabled: boolean) => void;
  clearCache: () => void;
  
  // Theme and preferences
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // File upload state
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // UI State
  const [uiState, setUiState] = useState<UIState>({
    isLoading: false,
    error: undefined,
    success: undefined,
  });

  // Current project
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Projects list
  const [projects, setProjects] = useState<Project[]>([]);

  // Cache settings
  const [cacheEnabled, setCacheEnabled] = useState<boolean>(true);

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    return savedTheme || 'light';
  });

  // File upload progress
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // UI State helpers
  const setLoading = (loading: boolean) => {
  setUiState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: AppError | null) => {
    setUiState(prev => ({ 
      ...prev, 
      error: error || undefined, 
      success: undefined 
    }));
  };
  const setSuccess = (message: string | null) => {
    setUiState(prev => ({ 
      ...prev, 
      success: message || undefined, 
      error: undefined 
    }));
  };

  const clearMessages = () => {
    setUiState(prev => ({ ...prev, error: undefined, success: undefined }));
  };

  // Project management helpers
  const updateProject = (updatedProject: Project) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    
    if (currentProject?.id === updatedProject.id) {
      setCurrentProject(updatedProject);
    }
  };

  const removeProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  // Cache management (placeholder for future Redis implementation)
  const clearCache = () => {
    if (typeof window !== 'undefined') {
      // Clear localStorage cache
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  // Theme management
  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update document class for Tailwind dark mode
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme on mount
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const value: AppContextType = {
    // UI State
    uiState,
    setLoading,
    setError,
    setSuccess,
    clearMessages,
    
    // Current project
    currentProject,
    setCurrentProject,
    
    // Projects
    projects,
    setProjects,
    updateProject,
    removeProject,
    
    // Cache
    cacheEnabled,
    setCacheEnabled,
    clearCache,
    
    // Theme
    theme,
    setTheme: handleSetTheme,
    
    // File upload
    uploadProgress,
    setUploadProgress,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;