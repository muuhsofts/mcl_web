import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Updated interface
interface FormData {
  category: string;
  description: string;
  news_img: File | null;
  pdf_file: File | null;
  read_more_url_lnk: string; // New field
}

interface FormErrors {
  category?: string;
  description?: string;
  news_img?: string;
  pdf_file?: string;
  read_more_url_lnk?: string; // New error
}

const AddNews: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    news_img: null,
    pdf_file: null,
    read_more_url_lnk: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.category && formData.category.length > 255) {
      newErrors.category = 'Category must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 10000) {
      newErrors.description = 'Description must not exceed 10000 characters';
    }

    if (formData.news_img) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.news_img.type)) {
        newErrors.news_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.news_img.size > 2 * 1024 * 1024) {
        newErrors.news_img = 'Image size must not exceed 2MB';
      }
    }

    if (formData.pdf_file) {
      if (formData.pdf_file.type !== 'application/pdf') {
        newErrors.pdf_file = 'Only PDF files are allowed';
      } else if (formData.pdf_file.size > 2 * 1024 * 1024) {
        newErrors.pdf_file = 'PDF size must not exceed 2MB';
      }
    }

    if (formData.read_more_url_lnk) {
      const urlPattern = new RegExp(
        '^(https?:\\/\\/)' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$','i' // fragment locator
      );
      if (!urlPattern.test(formData.read_more_url_lnk)) {
        newErrors.read_more_url_lnk = 'Please enter a valid URL (e.g., https://example.com)';
      }
      if (formData.read_more_url_lnk.length > 500) {
        newErrors.read_more_url_lnk = 'URL must not exceed 500 characters';
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
    if (formData.category) payload.append('category', formData.category);
    if (formData.description) payload.append('description', formData.description);
    if (formData.news_img) payload.append('news_img', formData.news_img);
    if (formData.pdf_file) payload.append('pdf_file', formData.pdf_file);
    if (formData.read_more_url_lnk) payload.append('read_more_url_lnk', formData.read_more_url_lnk);

    try {
      const response = await axiosInstance.post('/api/news', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'News record added successfully!');
      setTimeout(() => navigate('/news'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add news record.';
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
          Add News
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category <span className="text-gray-500">(optional)</span></label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`${inputBaseClasses} ${errors.category ? inputErrorClasses : inputBorderClasses}`}
              placeholder="Enter category"
              maxLength={255}
            />
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-gray-500">(optional)</span></label>
            <ReactQuill
              value={formData.description}
              onChange={handleDescriptionChange}
              className="mt-1"
              theme="snow"
              placeholder="Enter description with text, images, or videos"
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ['bold', 'italic', 'underline'],
                  ['link', 'image', 'video'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['clean'],
                ],
              }}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            <p className="mt-1 text-xs text-gray-500">Use the editor to add rich text, links, images, or embed videos.</p>
          </div>

          {/* News Image */}
          <div>
            <label htmlFor="news_img" className="block text-sm font-medium text-gray-700">News Image <span className="text-gray-500">(optional)</span></label>
            <input
              type="file"
              id="news_img"
              name="news_img"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.news_img && <p className="mt-1 text-sm text-red-500">{errors.news_img}</p>}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>

          {/* PDF File */}
          <div>
            <label htmlFor="pdf_file" className="block text-sm font-medium text-gray-700">PDF File <span className="text-gray-500">(optional)</span></label>
            <input
              type="file"
              id="pdf_file"
              name="pdf_file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.pdf_file && <p className="mt-1 text-sm text-red-500">{errors.pdf_file}</p>}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed type: PDF.</p>
          </div>

          {/* Read More URL */}
          <div>
            <label htmlFor="read_more_url_lnk" className="block text-sm font-medium text-gray-700">Read More URL <span className="text-gray-500">(optional)</span></label>
            <input
              type="url"
              id="read_more_url_lnk"
              name="read_more_url_lnk"
              value={formData.read_more_url_lnk}
              onChange={handleChange}
              className={`${inputBaseClasses} ${errors.read_more_url_lnk ? inputErrorClasses : inputBorderClasses}`}
              placeholder="https://example.com/article"
            />
            {errors.read_more_url_lnk && <p className="mt-1 text-sm text-red-500">{errors.read_more_url_lnk}</p>}
            <p className="mt-1 text-xs text-gray-500">External link for "Read More". Must be a valid URL.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/news')}
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
                'Add News'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNews;