'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useRef, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, Loader2 } from 'lucide-react';
import { uploadBlogImage } from '@/lib/supabase-storage';
import { toast } from 'sonner';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TipTapEditor({ value, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true }),
    ],
    immediatelyRender: false,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[150px] p-2 focus:outline-none focus:ring-1 focus:ring-black rounded-b-md text-sm',
      },
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!editor) return null;

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image')) {
      toast.error('Please select a valid image file');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading rich text image...');

    const { url, error } = await uploadBlogImage(file);

    if (error) {
      toast.error(error, { id: toastId });
    } else if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      toast.success('Image inserted!', { id: toastId });
    }

    setIsUploading(false);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border border-gray-300 rounded-md bg-white">
      <div className="flex flex-wrap items-center gap-1 p-1 border-b border-gray-200 bg-gray-50 rounded-t-md">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <div className="w-[1px] h-4 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={toggleLink}
          className={`p-1 rounded ${editor.isActive('link') ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-200'}`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          title="Upload Image"
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        </button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={addImage}
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
