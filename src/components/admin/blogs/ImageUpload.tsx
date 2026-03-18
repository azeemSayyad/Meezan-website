'use client';

import { useState } from 'react';
import { uploadBlogImage, deleteBlogImage } from '@/lib/supabase-storage';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Upload Image' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading image...');
    
    const { url, error } = await uploadBlogImage(file);
    
    if (error) {
      toast.error(error, { id: toastId });
    } else if (url) {
      onChange(url);
      toast.success('Image uploaded successfully', { id: toastId });
    }
    
    setIsUploading(false);
  };

  const handleRemove = async () => {
    if (!value) return;
    
    const toastId = toast.loading('Removing image...');
    onChange(''); // Optimistic UI clear
    
    const { error } = await deleteBlogImage(value);
    if (error) {
      toast.error('Failed to remove from storage, but removed from form', { id: toastId });
    } else {
      toast.success('Image removed', { id: toastId });
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {value ? (
        <div className="relative rounded-md overflow-hidden border border-gray-200 group bg-gray-50 flex items-center justify-center h-32 w-full max-w-[200px]">
          <Image src={value} alt="Uploaded preview" fill className="object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove Image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full max-w-[200px] h-32 border-2 border-dashed border-gray-300 hover:border-black rounded-md cursor-pointer bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center gap-1 text-gray-500">
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">{isUploading ? 'Uploading...' : label}</span>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
