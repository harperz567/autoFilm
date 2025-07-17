import React, { useState, useEffect, useCallback  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  Save, 
  Upload, 
  FileText, 
  Zap, 
  Download, 
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Camera,
  Users,
  MapPin
} from 'lucide-react';
import { Layout, PageContainer } from '../components/layout';
import { Button, Card, Alert, Textarea, Modal, ProgressBar } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { Project, StoryboardScene, ConversionRequest, FileUpload, ShotType, CameraAngle, TimeOfDay } from '../types';
import apiService from '../services/api';

export const EditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { 
    currentProject, 
    setCurrentProject, 
    updateProject, 
    uiState, 
    setLoading, 
    setError, 
    setSuccess,
    uploadProgress,
    setUploadProgress
  } = useApp();

  const [scriptContent, setScriptContent] = useState('');
  const [storyboard, setStoryboard] = useState<StoryboardScene[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [fileUpload, setFileUpload] = useState<FileUpload | null>(null);
  const [conversionOptions, setConversionOptions] = useState({
    shotStyle: 'cinematic' as 'cinematic' | 'documentary' | 'commercial',
    pacing: 'medium' as 'slow' | 'medium' | 'fast',
    complexity: 'standard' as 'simple' | 'standard' | 'complex',
  });

  // Load project data
  useEffect(() => {
    if (projectId) {
      loadProject();
    } else {
      // New project mode
      setScriptContent('');
      setStoryboard([]);
      setCurrentProject(null);
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const project = await apiService.getProject(projectId);
      setCurrentProject(project);
      setScriptContent(project.scriptContent || '');
      
      if (project.storyboardData) {
        setStoryboard(project.storyboardData);
      }
    } catch (error) {
      setError({
        code: 'LOAD_PROJECT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to load project',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject) return;

    try {
      setLoading(true);
      const updatedProject = await apiService.updateProject(currentProject.id, {
        scriptContent,
      });
      updateProject(updatedProject);
      setSuccess('Project saved successfully!');
    } catch (error) {
      setError({
        code: 'SAVE_PROJECT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to save project',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvertScript = async () => {
    if (!currentProject || !scriptContent.trim()) {
      setError({
        code: 'CONVERT_ERROR',
        message: 'Please enter a script before converting',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      setIsConverting(true);
      const conversionRequest: ConversionRequest = {
        projectId: currentProject.id,
        scriptContent,
        options: conversionOptions,
      };

      const response = await apiService.convertScript(conversionRequest);
      setStoryboard(response.storyboard);
      setSuccess(`Generated ${response.storyboard.length} scenes in ${response.processingTime}ms`);
    } catch (error) {
      setError({
        code: 'CONVERT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to convert script',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const upload: FileUpload = {
      file,
      progress: 0,
      status: 'uploading',
    };

    setFileUpload(upload);
    setUploadProgress(0);

    try {
      const response = await apiService.uploadFile(file, currentProject?.id);
      
      // Simulate file processing for demo
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setScriptContent(content);
        setUploadProgress(100);
        setFileUpload({ ...upload, status: 'success', progress: 100 });
        setSuccess('File uploaded and content loaded successfully!');
      };
      reader.readAsText(file);
    } catch (error) {
      setFileUpload({ ...upload, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' });
      setError({
        code: 'UPLOAD_ERROR',
        message: error instanceof Error ? error.message : 'Failed to upload file',
        timestamp: new Date().toISOString(),
      });
    }
  }, [currentProject, setUploadProgress, setSuccess, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleExport = async (format: 'pdf' | 'excel' | 'word') => {
    if (!currentProject) return;

    try {
      setLoading(true);
      const response = await apiService.exportProject({
        projectId: currentProject.id,
        format,
        options: {
          includeImages: true,
          includeNotes: true,
        },
      });

      // Create download link
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`Exported as ${format.toUpperCase()} successfully!`);
      setIsExportModalOpen(false);
    } catch (error) {
      setError({
        code: 'EXPORT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to export project',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const getShotTypeLabel = (shotType: ShotType): string => {
    const labels: Record<ShotType, string> = {
      [ShotType.EXTREME_WIDE]: 'Extreme Wide Shot',
      [ShotType.WIDE]: 'Wide Shot',
      [ShotType.MEDIUM_WIDE]: 'Medium Wide Shot',
      [ShotType.MEDIUM]: 'Medium Shot',
      [ShotType.MEDIUM_CLOSE]: 'Medium Close-up',
      [ShotType.CLOSE_UP]: 'Close-up',
      [ShotType.EXTREME_CLOSE_UP]: 'Extreme Close-up',
      [ShotType.INSERT]: 'Insert Shot',
      [ShotType.CUTAWAY]: 'Cutaway',
      [ShotType.OVER_SHOULDER]: 'Over-the-Shoulder',
      [ShotType.TWO_SHOT]: 'Two Shot',
      [ShotType.MASTER_SHOT]: 'Master Shot',
    };
    return labels[shotType] || shotType;
  };

  const getCameraAngleLabel = (angle: CameraAngle): string => {
    const labels: Record<CameraAngle, string> = {
      [CameraAngle.EYE_LEVEL]: 'Eye Level',
      [CameraAngle.HIGH_ANGLE]: 'High Angle',
      [CameraAngle.LOW_ANGLE]: 'Low Angle',
      [CameraAngle.BIRD_EYE]: 'Bird\'s Eye View',
      [CameraAngle.WORM_EYE]: 'Worm\'s Eye View',
      [CameraAngle.DUTCH_ANGLE]: 'Dutch Angle',
      [CameraAngle.OVER_SHOULDER]: 'Over-the-Shoulder',
      [CameraAngle.POINT_OF_VIEW]: 'Point of View',
    };
    return labels[angle] || angle;
  };

  const getTimeOfDayLabel = (timeOfDay: TimeOfDay): string => {
    const labels: Record<TimeOfDay, string> = {
      [TimeOfDay.DAWN]: 'Dawn',
      [TimeOfDay.MORNING]: 'Morning',
      [TimeOfDay.DAY]: 'Day',
      [TimeOfDay.AFTERNOON]: 'Afternoon',
      [TimeOfDay.EVENING]: 'Evening',
      [TimeOfDay.NIGHT]: 'Night',
      [TimeOfDay.LATE_NIGHT]: 'Late Night',
    };
    return labels[timeOfDay] || timeOfDay;
  };

  return (
    <Layout requireAuth>
      <PageContainer
        title={currentProject ? `Editing: ${currentProject.name}` : 'New Project'}
        subtitle="Transform your script into a professional storyboard"
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

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 mb-6">
          {currentProject && (
            <Button
              onClick={handleSaveProject}
              isLoading={uiState.isLoading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Project</span>
            </Button>
          )}
          
          <Button
            onClick={handleConvertScript}
            isLoading={isConverting}
            disabled={!scriptContent.trim()}
            className="flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Generate Storyboard</span>
          </Button>
          
          <Button
            onClick={() => setIsExportModalOpen(true)}
            variant="secondary"
            disabled={storyboard.length === 0}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Script Input Panel */}
          <Card className="h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">Script</h3>
              <div className="flex items-center space-x-2">
                <div 
                  {...getRootProps()}
                  className={`
                    p-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${isDragActive 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-secondary-300 hover:border-secondary-400'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-5 h-5 text-secondary-600" />
                </div>
              </div>
            </div>

            {fileUpload && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-secondary-600">
                    {fileUpload.file.name}
                  </span>
                  <span className="text-sm text-secondary-500">
                    {fileUpload.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : fileUpload.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-600" />
                    )}
                  </span>
                </div>
                {fileUpload.status === 'uploading' && (
                  <ProgressBar value={uploadProgress} showValue />
                )}
                {fileUpload.error && (
                  <p className="text-sm text-red-600 mt-1">{fileUpload.error}</p>
                )}
              </div>
            )}

            <Textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              placeholder="Paste your script here or drag and drop a file above..."
              className="min-h-96 font-mono text-sm"
            />

            <div className="mt-4 text-sm text-secondary-600">
              <p>Supported formats: .txt, .docx, .pdf</p>
              <p>Characters: {scriptContent.length}</p>
            </div>
          </Card>

          {/* Storyboard Output Panel */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                Storyboard ({storyboard.length} scenes)
              </h3>
              {storyboard.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Button>
              )}
            </div>

            {isConverting ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-secondary-600">
                  Converting script to storyboard...
                </p>
              </div>
            ) : storyboard.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-secondary-900 mb-2">
                  No storyboard generated yet
                </h4>
                <p className="text-secondary-600">
                  Add your script and click "Generate Storyboard" to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {storyboard.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="border border-secondary-200 rounded-lg p-4 bg-secondary-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary-600 text-white px-2 py-1 rounded text-sm font-medium">
                          Scene {scene.sceneNumber}
                        </span>
                        <span className="text-sm text-secondary-600">
                          {scene.duration}s
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-secondary-500">
                        <Camera className="w-4 h-4" />
                        <span>{getShotTypeLabel(scene.shotType)}</span>
                      </div>
                    </div>

                    <p className="text-secondary-900 mb-3">{scene.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center space-x-1 text-secondary-600 mb-1">
                          <Camera className="w-3 h-3" />
                          <span>Camera Angle</span>
                        </div>
                        <p className="text-secondary-900">
                          {getCameraAngleLabel(scene.cameraAngle)}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-1 text-secondary-600 mb-1">
                          <Clock className="w-3 h-3" />
                          <span>Time of Day</span>
                        </div>
                        <p className="text-secondary-900">
                          {getTimeOfDayLabel(scene.timeOfDay)}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-1 text-secondary-600 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>Location</span>
                        </div>
                        <p className="text-secondary-900">{scene.location}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-1 text-secondary-600 mb-1">
                          <Users className="w-3 h-3" />
                          <span>Characters</span>
                        </div>
                        <p className="text-secondary-900">
                          {scene.characters.join(', ') || 'None'}
                        </p>
                      </div>
                    </div>

                    {scene.dialogue && (
                      <div className="mt-3 p-3 bg-white rounded border-l-4 border-primary-600">
                        <p className="text-sm text-secondary-700 italic">
                          "{scene.dialogue}"
                        </p>
                      </div>
                    )}

                    {scene.notes && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <p className="text-sm text-secondary-700">{scene.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Export Modal */}
        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title="Export Storyboard"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-secondary-700">
              Choose a format to export your storyboard:
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => handleExport('pdf')}
                variant="secondary"
                className="w-full justify-start"
                isLoading={uiState.isLoading}
              >
                Export as PDF
              </Button>
              
              <Button
                onClick={() => handleExport('excel')}
                variant="secondary"
                className="w-full justify-start"
                isLoading={uiState.isLoading}
              >
                Export as Excel
              </Button>
              
              <Button
                onClick={() => handleExport('word')}
                variant="secondary"
                className="w-full justify-start"
                isLoading={uiState.isLoading}
              >
                Export as Word Document
              </Button>
            </div>
          </div>
        </Modal>
      </PageContainer>
    </Layout>
  );
};