import { createClient } from '@supabase/supabase-js';

// Ensure you have these env variables set in your .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * Uploads an image to Supabase Storage 'blog-images' bucket
 * Returns the public URL of the uploaded image
 */
export async function uploadBlogImage(file: File): Promise<{ url?: string; error?: string }> {
  if (!supabase) {
    return { error: 'Supabase configuration is missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file.' };
  }
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase!.storage
      .from('blog-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return { error: uploadError.message };
    }

    const { data } = supabase!.storage.from('blog-images').getPublicUrl(filePath);

    return { url: data.publicUrl };
  } catch (error: any) {
    console.error('Storage Exception:', error);
    return { error: error.message || 'Unknown error occurred during upload' };
  }
}

/**
 * Deletes an image from the 'blog-images' bucket
 */
export async function deleteBlogImage(url: string): Promise<{ success?: boolean; error?: string }> {
  if (!supabase) {
    return { error: 'Supabase configuration missing' };
  }

  try {
    const pathParts = url.split('/blog-images/');
    if (pathParts.length < 2) return { success: true }; // Not a supabase url we can easily parse
    
    const filePath = pathParts[1];
    
    const { error } = await supabase!.storage.from('blog-images').remove([filePath]);
    if (error) {
      return { error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete image' };
  }
}
