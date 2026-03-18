import { checkAuth, logoutAdmin } from '@/app/actions/admin-auth';
import { getBlogs, deleteBlog } from '@/app/actions/blog-actions';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, FileText, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { revalidatePath } from 'next/cache';
import DeleteBlogButton from '@/components/admin/blogs/DeleteBlogButton';
import ToggleStatusButton from '@/components/admin/blogs/ToggleStatusButton';

export default async function AdminBlogsPage() {
  const isAuth = await checkAuth();

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <main className="flex-1 flex items-center justify-center p-4">
          <AdminLoginForm />
        </main>
      </div>
    );
  }

  const blogs = await getBlogs();

  const handleDelete = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    if (id) {
      await deleteBlog(id);
      revalidatePath('/admin/blogs');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm font-medium text-gray-800 hover:text-black flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
            </Link>
            <span className="text-sm font-medium text-gray-500 border-l border-gray-200 pl-4 flex items-center gap-1">
              <FileText className="w-4 h-4" /> Blog Management
            </span>
          </div>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-none">Blogs</h1>
            <p className="mt-1 text-xs text-gray-600">Total: {blogs.length} posts</p>
          </div>
          <Link
            href="/admin/blogs/create"
            className="flex items-center gap-1.5 bg-black text-white py-1.5 px-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Blog
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="py-2 px-3 font-semibold">Title</th>
                <th className="py-2 px-3 font-semibold w-24">Status</th>
                <th className="py-2 px-3 font-semibold w-32 hidden md:table-cell">Publish Date</th>
                <th className="py-2 px-3 font-semibold w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.map((blog: any) => (
                <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2 px-3 align-middle">
                    <div className="font-medium text-gray-900 truncate max-w-[200px] md:max-w-md" title={blog.title}>
                      {blog.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">/{blog.slug}</div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <ToggleStatusButton id={blog.id} currentStatus={blog.status} />
                  </td>
                  <td className="py-2 px-3 align-middle hidden md:table-cell text-xs text-gray-600">
                    {blog.publishDate ? format(new Date(blog.publishDate), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="py-2 px-3 align-middle text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Post"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/blogs/${blog.id}/edit`}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                        title="Edit Post"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <DeleteBlogButton id={blog.id} onDelete={handleDelete} />
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">
                    No blogs found. Create your first blog post!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
