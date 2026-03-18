'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { createBlog, updateBlog } from '@/app/actions/blog-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import TipTapEditor from './TipTapEditor';
import ImageUpload from './ImageUpload';
import { Save, ExternalLink } from 'lucide-react';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  shortDescription: z.string().max(160, 'Max 160 characters').optional().or(z.literal('')),
  content: z.string().min(1, 'Content is required'),
  metaTitle: z.string().max(60, 'Max 60 chars').optional().or(z.literal('')),
  metaDescription: z.string().max(160, 'Max 160 chars').optional().or(z.literal('')),
  keywords: z.string().optional().or(z.literal('')),
  canonicalUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  ogTitle: z.string().optional().or(z.literal('')),
  ogDescription: z.string().optional().or(z.literal('')),
  ogImage: z.string().optional().or(z.literal('')),
  featuredImage: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
  status: z.string().optional(),
  publishDate: z.string().optional().or(z.literal('')),
  author: z.string().optional().or(z.literal('')),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogFormProps {
  initialData?: any;
}

// Compact Input Component
const Input = ({ label, id, error, registerFn, ...props }: any) => (
  <div className="flex flex-col gap-0.5 w-full">
    <label htmlFor={id} className="text-xs font-semibold text-gray-700">
      {label}
    </label>
    <input
      id={id}
      {...registerFn}
      {...props}
      className={`h-8 px-2 text-sm border rounded bg-white focus:outline-none focus:ring-1 focus:ring-black ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    />
    {error && <span className="text-[10px] text-red-500 leading-none">{error.message}</span>}
  </div>
);

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<BlogFormValues> = initialData
    ? {
        ...initialData,
        shortDescription: initialData.shortDescription || '',
        metaTitle: initialData.metaTitle || '',
        metaDescription: initialData.metaDescription || '',
        canonicalUrl: initialData.canonicalUrl || '',
        ogTitle: initialData.ogTitle || '',
        ogDescription: initialData.ogDescription || '',
        ogImage: initialData.ogImage || '',
        featuredImage: initialData.featuredImage || '',
        category: initialData.category || '',
        author: initialData.author || '',
        keywords: initialData.keywords?.join(', ') || '',
        tags: initialData.tags?.join(', ') || '',
        publishDate: initialData.publishDate ? new Date(initialData.publishDate).toISOString().split('T')[0] : '',
      }
    : {
        title: '',
        slug: '',
        shortDescription: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        canonicalUrl: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        featuredImage: '',
        category: '',
        tags: '',
        status: 'draft',
        publishDate: new Date().toISOString().split('T')[0],
        author: 'Admin',
      };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues,
  });

  const titleWatch = watch('title');

  // Auto-generate slug from title if it's a new post and slug hasn't been manually touched
  useEffect(() => {
    if (!initialData && titleWatch) {
      const generatedSlug = titleWatch
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [titleWatch, setValue, initialData]);

  const onSubmit = async (data: BlogFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Saving blog...');

    const payload = {
      ...data,
      keywords: data.keywords ? data.keywords.split(',').map((k) => k.trim()) : [],
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
      publishDate: data.publishDate || null,
    };

    let res;
    if (initialData?.id) {
      res = await updateBlog(initialData.id, payload);
    } else {
      res = await createBlog(payload);
    }

    if (res.success) {
      toast.success(initialData ? 'Blog updated successfully' : 'Blog created successfully', {
        id: toastId,
      });
      router.push('/admin/blogs');
    } else {
      toast.error(res.error || 'Something went wrong', { id: toastId });
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-2 rounded-md border border-gray-200 shadow-sm sticky top-16 z-40">
        <h1 className="text-lg font-bold text-gray-900 leading-none">
          {initialData ? 'Edit Blog' : 'Create Blog'}
        </h1>
        <div className="flex gap-2">
          {initialData?.slug && (
            <a
              href={`/blog/${initialData.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Preview
            </a>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Section 1: Basic Info */}
          <section className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex flex-col gap-3">
            <h2 className="text-sm font-bold border-b pb-1">Basic Info</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Title *" id="title" registerFn={register('title')} error={errors.title} />
              <Input label="Slug *" id="slug" registerFn={register('slug')} error={errors.slug} />
            </div>
            
            <div className="flex flex-col gap-0.5">
              <label htmlFor="shortDescription" className="text-xs font-semibold text-gray-700 flex justify-between">
                <span>Short Description (Max 160)</span>
                <span className="text-gray-400 font-normal">{watch('shortDescription')?.length || 0}/160</span>
              </label>
              <textarea
                id="shortDescription"
                {...register('shortDescription')}
                className={`p-2 text-sm border rounded bg-white min-h-[60px] focus:outline-none focus:ring-1 focus:ring-black ${
                  errors.shortDescription ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.shortDescription && <span className="text-[10px] text-red-500">{errors.shortDescription.message}</span>}
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-xs font-semibold text-gray-700">Content *</label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <TipTapEditor value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.content && <span className="text-[10px] text-red-500">{errors.content.message}</span>}
            </div>
          </section>

          {/* Section 2: SEO Fields */}
          <section className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex flex-col gap-3">
            <h2 className="text-sm font-bold border-b pb-1">SEO & Social Meta</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Meta Title (Max 60)" id="metaTitle" registerFn={register('metaTitle')} error={errors.metaTitle} />
              <Input label="Keywords (Comma separated)" id="keywords" registerFn={register('keywords')} error={errors.keywords} />
              <div className="col-span-2">
                <Input label="Canonical URL" id="canonicalUrl" registerFn={register('canonicalUrl')} error={errors.canonicalUrl} />
              </div>
              <div className="col-span-2 flex flex-col gap-0.5">
                <label className="text-xs font-semibold text-gray-700 flex justify-between">
                  <span>Meta Description (Max 160)</span>
                  <span className="text-gray-400 font-normal">{watch('metaDescription')?.length || 0}/160</span>
                </label>
                <textarea
                  {...register('metaDescription')}
                  className="p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black h-16"
                />
              </div>
            </div>

            <h3 className="text-xs font-bold text-gray-600 mt-2">Open Graph (Facebook/Social)</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input label="OG Title" id="ogTitle" registerFn={register('ogTitle')} />
              <Input label="OG Description" id="ogDescription" registerFn={register('ogDescription')} />
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-700">OG Image</span>
                <Controller
                  name="ogImage"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload value={field.value || ''} onChange={field.onChange} label="Upload OG Image" />
                  )}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="flex flex-col gap-4">
          {/* Section 3: Publishing */}
          <section className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex flex-col gap-3">
            <h2 className="text-sm font-bold border-b pb-1">Publishing</h2>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select
                {...register('status')}
                className="h-8 px-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <Input label="Publish Date" id="publishDate" type="date" registerFn={register('publishDate')} />
            <Input label="Author" id="author" registerFn={register('author')} />
          </section>

          {/* Section 4: Categorization */}
          <section className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex flex-col gap-3">
            <h2 className="text-sm font-bold border-b pb-1">Categorization</h2>
            <div className="flex flex-col gap-0.5">
              <label className="text-xs font-semibold text-gray-700">Category</label>
              <select
                {...register('category')}
                className="h-8 px-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Select Category</option>
                <option value="news">News</option>
                <option value="education">Education</option>
                <option value="tips">Tips & Tricks</option>
                <option value="events">Events</option>
              </select>
            </div>
            <Input label="Tags (Comma separated)" id="tags" registerFn={register('tags')} placeholder="e.g. maths, studying" />
          </section>

          {/* Section 5: Featured Media */}
          <section className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex flex-col gap-3">
            <h2 className="text-sm font-bold border-b pb-1">Featured Image</h2>
            <Controller
              name="featuredImage"
              control={control}
              render={({ field }) => (
                <ImageUpload value={field.value || ''} onChange={field.onChange} label="Upload Featured Image" />
              )}
            />
          </section>
        </div>
      </div>
    </form>
  );
}
