import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  category: string;
  total_viewers: string; // Keep as string - NO CONVERSION
  logo_img_file: File | null;
}

type FormErrors = {
  [K in keyof FormData]?: string;
};

const AddSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    total_viewers: '',
    logo_img_file: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // STORE EXACTLY AS TYPED - NO TRIMMING, NO MODIFICATION
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, logo_img_file: file }));
    if (errors.logo_img_file) {
      setErrors((prev) => ({ ...prev, logo_img_file: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    // ONLY CHECK IF NOT EMPTY - NO FORMAT VALIDATION
    if (!formData.total_viewers) {
      newErrors.total_viewers = 'Total viewers is required';
    }
    
    if (formData.logo_img_file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(formData.logo_img_file.type)) {
        newErrors.logo_img_file = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.logo_img_file.size > 2 * 1024 * 1024) {
        newErrors.logo_img_file = 'Image size must not exceed 2MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('category', formData.category.trim());
      // SAVE EXACTLY AS TYPED - NO CONVERSION, NO MODIFICATION
      payload.append('total_viewers', formData.total_viewers);
      
      if (formData.logo_img_file) {
        payload.append('logo_img_file', formData.logo_img_file);
      }

      const response = await axiosInstance.post('/api/subscriptions', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success(response.data.message || 'Subscription created successfully');
      setTimeout(() => navigate('/subscriptions'), 2000);
    } catch (error: unknown) {
      let errorMessage = 'Failed to create subscription';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        const backendErrors = error.response.data?.errors;
        if (backendErrors) setErrors(backendErrors);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Create New Subscription
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter category name"
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="total_viewers" className="block text-sm font-medium text-gray-700">
              Total Viewers <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="total_viewers"
              name="total_viewers"
              value={formData.total_viewers}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter viewers (e.g., 100, 200K, 3747M-3-33)"
            />
            {errors.total_viewers && (
              <p className="mt-1 text-sm text-red-500">{errors.total_viewers}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter viewers count EXACTLY as needed - no conversion will be applied
            </p>
          </div>

          <div>
            <label htmlFor="logo_img_file" className="block text-sm font-medium text-gray-700">
              Logo (optional)
            </label>
            <input
              type="file"
              id="logo_img_file"
              name="logo_img_file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {errors.logo_img_file && (
              <p className="mt-1 text-sm text-red-500">{errors.logo_img_file}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Max size: 2MB. Allowed formats: JPEG, PNG, JPG, GIF
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/subscriptions')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {loading ? 'Creating...' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubscription;