'use client';

import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';

interface DeleteBlogButtonProps {
  id: string;
  onDelete: (formData: FormData) => void;
}

export default function DeleteBlogButton({ id, onDelete }: DeleteBlogButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this blog?')) {
      const formData = new FormData(e.currentTarget);
      startTransition(() => {
        onDelete(formData);
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-block">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
        title="Delete Post"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}
