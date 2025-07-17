// User related types
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Project related types
export interface Project {
  id: string;
  name: string;
  description?: string;
  scriptContent: string;
  storyboardData?: StoryboardScene[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  scriptContent?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  scriptContent?: string;
}

// Storyboard related types
export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  description: string;
  shotType: ShotType;
  cameraAngle: CameraAngle;
  duration: number;
  notes?: string;
  characters: string[];
  location: string;
  timeOfDay: TimeOfDay;
  movement?: string;
  dialogue?: string;
}

export enum ShotType {
  EXTREME_WIDE = 'extreme_wide',
  WIDE = 'wide',
  MEDIUM_WIDE = 'medium_wide',
  MEDIUM = 'medium',
  MEDIUM_CLOSE = 'medium_close',
  CLOSE_UP = 'close_up',
  EXTREME_CLOSE_UP = 'extreme_close_up',
  INSERT = 'insert',
  CUTAWAY = 'cutaway',
  OVER_SHOULDER = 'over_shoulder',
  TWO_SHOT = 'two_shot',
  MASTER_SHOT = 'master_shot'
}

export enum CameraAngle {
  EYE_LEVEL = 'eye_level',
  HIGH_ANGLE = 'high_angle',
  LOW_ANGLE = 'low_angle',
  BIRD_EYE = 'bird_eye',
  WORM_EYE = 'worm_eye',
  DUTCH_ANGLE = 'dutch_angle',
  OVER_SHOULDER = 'over_shoulder',
  POINT_OF_VIEW = 'point_of_view'
}

export enum TimeOfDay {
  DAWN = 'dawn',
  MORNING = 'morning',
  DAY = 'day',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
  LATE_NIGHT = 'late_night'
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Conversion types
export interface ConversionRequest {
  projectId: string;
  scriptContent: string;
  options?: {
    shotStyle?: 'cinematic' | 'documentary' | 'commercial';
    pacing?: 'slow' | 'medium' | 'fast';
    complexity?: 'simple' | 'standard' | 'complex';
  };
}

export interface ConversionResponse {
  success: boolean;
  storyboard: StoryboardScene[];
  processingTime: number;
  metadata?: {
    totalScenes: number;
    estimatedDuration: number;
    shotBreakdown: Record<ShotType, number>;
  };
}

// Export types
export interface ExportRequest {
  projectId: string;
  format: 'pdf' | 'excel' | 'word';
  options?: {
    includeImages?: boolean;
    includeNotes?: boolean;
    template?: string;
  };
}

export interface ExportResponse {
  success: boolean;
  downloadUrl: string;
  filename: string;
  fileSize: number;
}

// Cache types (for future Redis implementation)
export interface CacheEntry<T> {
  key: string;
  value: T;
  ttl: number;
  createdAt: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// UI State types
export interface UIState {
  isLoading: boolean;
  error?: AppError;
  success?: string;
}

// Form types
export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

// Navigation types
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  isActive?: boolean;
  requiresAuth?: boolean;
}