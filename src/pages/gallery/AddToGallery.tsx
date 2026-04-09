// AddToGallery.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  title: string;
  description: string;
  file: File | null;
  file_type: 'image' | 'video';
}

interface FormErrors {
  title?: string;
  description?: string;
  file?: string;
  file_type?: string;
}

const AddToGallery: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    file: null,
    file_type: 'image',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));

    // Clear preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    // Create preview for images/videos
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Auto-detect file type based on mime
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, file_type: 'image' }));
      } else if (file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, file_type: 'video' }));
      }
    }

    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.title && formData.title.length > 255) {
      newErrors.title = 'Title must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 10000) {
      newErrors.description = 'Description must not exceed 10000 characters';
    }

    if (!formData.file) {
      newErrors.file = 'Please select a file';
    } else if (formData.file_type === 'image') {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedImageTypes.includes(formData.file.type)) {
        newErrors.file = 'Only JPEG, PNG, JPG, or GIF images are allowed';
      } else if (formData.file.size > 20 * 1024 * 1024) {
        newErrors.file = 'Image size must not exceed 20MB';
      }
    } else if (formData.file_type === 'video') {
      const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
      if (!allowedVideoTypes.includes(formData.file.type)) {
        newErrors.file = 'Only MP4, MOV, or AVI videos are allowed';
      } else if (formData.file.size > 20 * 1024 * 1024) {
        newErrors.file = 'Video size must not exceed 20MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warn('Please fix the validation errors.');
      return;
    }

    setLoading(true);
    const payload = new FormData();
    if (formData.title) payload.append('title', formData.title);
    if (formData.description) payload.append('description', formData.description);
    if (formData.file) payload.append('file', formData.file);
    payload.append('file_type', formData.file_type);

    try {
      const response = await axiosInstance.post('/api/galleries', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Gallery item added successfully!');
      setTimeout(() => navigate('/gallery'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add gallery item.';
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrors(backendErrors);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClasses = 'mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base';
  const inputBorderClasses = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  const inputErrorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Add to Gallery
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-gray-500">(optional)</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`${inputBaseClasses} ${errors.title ? inputErrorClasses : inputBorderClasses}`}
              placeholder="Enter title"
              maxLength={255}
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-gray-500">(optional)</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`${inputBaseClasses} ${errors.description ? inputErrorClasses : inputBorderClasses}`}
              placeholder="Enter description"
              maxLength={10000}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            <p className="mt-1 text-xs text-gray-500">Max 10,000 characters.</p>
          </div>

          {/* File Type Selection */}
          <div>
            <label htmlFor="file_type" className="block text-sm font-medium text-gray-700">File Type <span className="text-red-500">*</span></label>
            <select
              id="file_type"
              name="file_type"
              value={formData.file_type}
              onChange={handleChange}
              className={`${inputBaseClasses} ${errors.file_type ? inputErrorClasses : inputBorderClasses}`}
            >
              <option value="image">Image (JPEG, PNG, JPG, GIF)</option>
              <option value="video">Video (MP4, MOV, AVI)</option>
            </select>
            {errors.file_type && <p className="mt-1 text-sm text-red-500">{errors.file_type}</p>}
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">File <span className="text-red-500">*</span></label>
            <input
              type="file"
              id="file"
              name="file"
              accept={formData.file_type === 'image' ? 'image/jpeg,image/png,image/jpg,image/gif' : 'video/mp4,video/quicktime,video/x-msvideo'}
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Max file size: 20MB. {formData.file_type === 'image' ? 'Allowed types: JPG, PNG, GIF.' : 'Allowed types: MP4, MOV, AVI.'}
            </p>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              {formData.file_type === 'image' ? (
                <img src={previewUrl} alt="Preview" className="max-h-64 max-w-full rounded object-contain" />
              ) : (
                <video src={previewUrl} controls className="max-h-64 max-w-full rounded" />
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/whole-gallery')}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition shadow-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-semibold flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add to Gallery'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToGallery;