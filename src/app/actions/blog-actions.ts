'use server';

import prisma from '@/lib/prisma';
import { checkAuth } from './admin-auth';
import { revalidatePath } from 'next/cache';

export async function createBlog(data: any) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) return { success: false, error: 'Unauthorized' };

    const blog = await prisma.blog.create({
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription || null,
        content: data.content,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        keywords: data.keywords || [],
        canonicalUrl: data.canonicalUrl || null,
        ogTitle: data.ogTitle || null,
        ogDescription: data.ogDescription || null,
        ogImage: data.ogImage || null,
        featuredImage: data.featuredImage || null,
        category: data.category || null,
        tags: data.tags || [],
        status: data.status || 'draft',
        publishDate: data.publishDate ? new Date(data.publishDate) : null,
        author: data.author || null,
      },
    });

    revalidatePath('/admin/blogs');
    return { success: true, data: blog };
  } catch (error: any) {
    console.error('Error creating blog:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return { success: false, error: 'A blog with this slug already exists.' };
    }
    return { success: false, error: 'Failed to create blog post.' };
  }
}

export async function updateBlog(id: string, data: any) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) return { success: false, error: 'Unauthorized' };

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription || null,
        content: data.content,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        keywords: data.keywords || [],
        canonicalUrl: data.canonicalUrl || null,
        ogTitle: data.ogTitle || null,
        ogDescription: data.ogDescription || null,
        ogImage: data.ogImage || null,
        featuredImage: data.featuredImage || null,
        category: data.category || null,
        tags: data.tags || [],
        status: data.status || 'draft',
        publishDate: data.publishDate ? new Date(data.publishDate) : null,
        author: data.author || null,
      },
    });

    revalidatePath('/admin/blogs');
    revalidatePath(`/admin/blogs/${id}/edit`);
    return { success: true, data: blog };
  } catch (error: any) {
    console.error('Error updating blog:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return { success: false, error: 'A blog with this slug already exists.' };
    }
    return { success: false, error: 'Failed to update blog post.' };
  }
}

export async function deleteBlog(id: string) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) return { success: false, error: 'Unauthorized' };

    await prisma.blog.delete({
      where: { id },
    });

    revalidatePath('/admin/blogs');
    return { success: true };
  } catch (error) {
    console.error('Error deleting blog:', error);
    return { success: false, error: 'Failed to delete blog' };
  }
}

export async function getBlogs() {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) {
        return [];
    }

    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return blogs;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export async function getBlogById(id: string) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) return null;

    const blog = await prisma.blog.findUnique({
      where: { id },
    });
    return blog;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

// Public Methods (No auth check required)

export async function getPublishedBlogs() {
  try {
    const blogs = await prisma.blog.findMany({
      where: { status: 'published' },
      orderBy: { publishDate: 'desc' },
    });
    return blogs;
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    return [];
  }
}

export async function toggleBlogStatus(id: string, newStatus: string) {
  try {
    const isAuth = await checkAuth();
    if (!isAuth) throw new Error('Unauthorized');

    await prisma.blog.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error toggling blog status:', error);
    return { error: error.message };
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: slug, status: 'published' },
    });
    return blog;
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    return null;
  }
}

