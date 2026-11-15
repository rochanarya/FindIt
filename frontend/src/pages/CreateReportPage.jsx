import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, PlusCircle, AlertCircle, Sparkles, Image as ImageIcon, MapPin, Calendar, Tag } from 'lucide-react';
import { itemService } from '../services/itemService';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';

const itemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  itemType: z.enum(['LOST', 'FOUND']),
  categoryId: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  itemDate: z.string().min(1, 'Date is required'),
  color: z.string().optional(),
  brand: z.string().optional(),
  identifyingFeatures: z.string().optional(),
});

export const CreateReportPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') === 'FOUND' ? 'FOUND' : 'LOST';

  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      itemType: defaultType,
      itemDate: new Date().toISOString().split('T')[0],
      categoryId: '',
    },
  });

  const selectedType = watch('itemType');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setValue('categoryId', res.data[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, [setValue]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }

    const updatedFiles = [...imageFiles, ...files];
    setImageFiles(updatedFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);

    const updatedPreviews = [...previews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setPreviews(updatedPreviews);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('itemType', data.itemType);
      formData.append('categoryId', data.categoryId);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('itemDate', data.itemDate);
      if (data.color) formData.append('color', data.color);
      if (data.brand) formData.append('brand', data.brand);
      if (data.identifyingFeatures) formData.append('identifyingFeatures', data.identifyingFeatures);

      // Append image files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await itemService.createItem(formData);
      if (res.success && res.data) {
        toast.success(`Successfully reported ${data.itemType.toLowerCase()} item!`);
        navigate(`/items/${res.data.id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit report';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 sm:px-10 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              New Report
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Report a Lost or Found Belonging
          </h1>
          <p className="mt-1 text-blue-100 text-xs sm:text-sm max-w-xl">
            Provide detailed information. FindIt's smart matching engine will compare your report with existing records across campus.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-10 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Report Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Report Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('itemType', 'LOST')}
                className={`p-4 rounded-2xl border-2 text-center transition ${
                  selectedType === 'LOST'
                    ? 'border-rose-600 bg-rose-50/50 text-rose-700 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="block font-extrabold text-base">I Lost an Item</span>
                <span className="text-[11px] text-slate-500">I am looking for my missing belonging</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('itemType', 'FOUND')}
                className={`p-4 rounded-2xl border-2 text-center transition ${
                  selectedType === 'FOUND'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span className="block font-extrabold text-base">I Found an Item</span>
                <span className="text-[11px] text-slate-500">I want to return it to the rightful owner</span>
              </button>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Item Title *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Dell XPS 15 Laptop (Silver)"
                className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                {...register('categoryId')}
                className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-xs text-rose-600">{errors.categoryId.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="Describe where you lost/found it, size, materials, model, sticker decals, scratches, contents..."
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
          </div>

          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campus Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  {...register('location')}
                  placeholder="e.g. Main Library 2nd floor, Cafeteria, Science Lab 102"
                  className="w-full text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              {errors.location && <p className="mt-1 text-xs text-rose-600">{errors.location.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date {selectedType === 'LOST' ? 'Lost' : 'Found'} *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="date"
                  {...register('itemDate')}
                  className="w-full text-sm pl-10 pr-3 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
                />
              </div>
              {errors.itemDate && <p className="mt-1 text-xs text-rose-600">{errors.itemDate.message}</p>}
            </div>
          </div>

          {/* Color & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Color (Optional)
              </label>
              <input
                type="text"
                {...register('color')}
                placeholder="e.g. Matte Black, Navy Blue, Silver"
                className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Brand / Manufacturer (Optional)
              </label>
              <input
                type="text"
                {...register('brand')}
                placeholder="e.g. Apple, Dell, Nike, Casio, Jansport"
                className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Identifying Features */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Identifying Characteristics (Optional)
            </label>
            <input
              type="text"
              {...register('identifyingFeatures')}
              placeholder="e.g. Sticker with GitHub logo on cover, small dent on bottom left corner"
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Image Uploads (Up to 5) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Upload Item Photos (Up to 5 images)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-blue-400 transition cursor-pointer relative bg-slate-50/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={imageFiles.length >= 5}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-blue-600" />
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                </div>
                <p className="text-[11px] text-slate-400">PNG, JPG, JPEG, WEBP up to 10MB each</p>
              </div>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {previews.map((src, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Submitting Report...' : `Publish ${selectedType === 'LOST' ? 'Lost' : 'Found'} Report`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportPage;

