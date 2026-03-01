import React, { useState, useEffect } from 'react';
import { Upload, X, Trash2, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getBackofficeSessionToken } from '../../lib/backofficeSession';

interface MediaFile {
  key: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ value, onChange, label = 'Billede' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'external'>('library');

  const getAuthHeaders = (): Record<string, string> => {
    const token = getBackofficeSessionToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const resolveErrorMessage = (payload: any): string => {
    const apiError = payload?.error;
    if (apiError && typeof apiError === 'object') {
      const title = typeof apiError.title === 'string' ? apiError.title : '';
      const detail = typeof apiError.detail === 'string' ? apiError.detail : '';
      const action = typeof apiError.action === 'string' ? apiError.action : '';
      return [title, detail, action].filter(Boolean).join(' ');
    }
    if (typeof apiError === 'string') return apiError;
    if (typeof payload?.message === 'string') return payload.message;
    return 'Handlingen kunne ikke gennemfoeres. Proev igen.';
  };

  const loadMediaFiles = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/media', { headers: getAuthHeaders() });

      if (response.ok) {
        const data = await response.json();
        setMediaFiles(data.files || []);
      } else {
        const error = await response.json().catch(() => null);
        setErrorMessage(resolveErrorMessage(error));
      }
    } catch (error) {
      console.error('Error loading media files:', error);
      setErrorMessage('Mediebiblioteket kunne ikke indlaeses. Proev igen om lidt.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      loadMediaFiles();
    }
  }, [isModalOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/media', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        await loadMediaFiles();
        onChange(data.file?.url || '');
        setIsModalOpen(false);
        e.target.value = '';
      } else {
        const error = await response.json();
        setErrorMessage(resolveErrorMessage(error));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Upload fejlede. Tjek din forbindelse og proev igen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (file: MediaFile) => {
    if (!confirm('Er du sikker på at du vil slette dette billede?')) return;

    try {
      setErrorMessage('');
      const response = await fetch(`/api/media?key=${encodeURIComponent(file.key)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        await loadMediaFiles();
        if (value === file.url) {
          onChange('');
        }
      } else {
        const error = await response.json().catch(() => null);
        setErrorMessage(resolveErrorMessage(error));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setErrorMessage('Sletning fejlede. Proev igen.');
    }
  };

  const handleSelectFile = (url: string) => {
    onChange(url);
    setIsModalOpen(false);
  };

  const handleExternalUrl = () => {
    if (externalUrl) {
      onChange(externalUrl);
      setExternalUrl('');
      setIsModalOpen(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Vælg et billede eller indtast URL"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <ImageIcon size={16} />
          Vælg
        </button>
      </div>

      {value && (
        <div className="mt-2">
          <img src={value} alt="Preview" className="h-20 w-auto rounded border border-gray-300" />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Vælg Billede</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('library')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'library'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Bibliotek
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'upload'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => setActiveTab('external')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'external'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Ekstern URL
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {errorMessage && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {activeTab === 'library' && (
                <div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="animate-spin text-gray-400" size={32} />
                    </div>
                  ) : mediaFiles.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Ingen billeder endnu</p>
                      <p className="text-sm mt-2">Upload et billede for at komme i gang</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaFiles.map((file) => (
                        <div
                          key={file.key}
                          className="relative group border border-gray-200 rounded-lg overflow-hidden hover:border-red-500 transition-colors"
                        >
                          <button
                            onClick={() => handleSelectFile(file.url)}
                            className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden"
                          >
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </button>
                          <div className="p-2 bg-white">
                            <p className="text-xs text-gray-600 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteFile(file)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Slet"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'upload' && (
                <div className="max-w-md mx-auto">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">
                      Træk og slip eller vælg et billede
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer">
                      {isUploading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Uploader...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Vælg Billede
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-4">
                      Understoettede formater: JPG, PNG, WebP og GIF. Maks 4 MB.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'external' && (
                <div className="max-w-md mx-auto">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Billede URL
                      </label>
                      <input
                        type="url"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    {externalUrl && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">Forhåndsvisning:</p>
                        <img
                          src={externalUrl}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <button
                      onClick={handleExternalUrl}
                      disabled={!externalUrl}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Brug Ekstern URL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPicker;
