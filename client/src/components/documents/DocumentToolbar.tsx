/**
 * Document Toolbar — formatting controls for TipTap editor.
 *
 * Bold, italic, headings, lists, tables, link, undo/redo.
 * Active state shown with terra tint. lucide-react icons.
 */
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered,
  Table, Link2,
  Undo2, Redo2,
} from 'lucide-react';

interface DocumentToolbarProps {
  editor: Editor;
}

export default function DocumentToolbar({ editor }: DocumentToolbarProps) {
  const btn = (
    active: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    title: string,
    disabled = false,
  ) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex items-center justify-center w-7 h-7 rounded
        border-0 cursor-pointer transition-colors
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
        ${active
          ? 'bg-[rgba(212,74,120,0.12)] text-[#D44A78]'
          : 'bg-transparent text-[#3D3B37] hover:bg-[#F5F5F5] dark:text-[#C8C4BC] dark:hover:bg-[#2A2C2E]'
        }
      `}
    >
      {icon}
    </button>
  );

  const divider = <div className="w-px h-4 bg-[#EBE7DF] dark:bg-[#3A3C3E] mx-1" />;
  const iconSize = 15;

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-[#EBE7DF] dark:border-[#3A3C3E] bg-white dark:bg-[#1A1C1E]">
      {/* Text formatting */}
      {btn(
        editor.isActive('bold'),
        () => editor.chain().focus().toggleBold().run(),
        <Bold size={iconSize} />,
        'Bold (⌘B)',
      )}
      {btn(
        editor.isActive('italic'),
        () => editor.chain().focus().toggleItalic().run(),
        <Italic size={iconSize} />,
        'Italic (⌘I)',
      )}
      {btn(
        editor.isActive('strike'),
        () => editor.chain().focus().toggleStrike().run(),
        <Strikethrough size={iconSize} />,
        'Strikethrough',
      )}

      {divider}

      {/* Headings */}
      {btn(
        editor.isActive('heading', { level: 1 }),
        () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        <Heading1 size={iconSize} />,
        'Heading 1',
      )}
      {btn(
        editor.isActive('heading', { level: 2 }),
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        <Heading2 size={iconSize} />,
        'Heading 2',
      )}
      {btn(
        editor.isActive('heading', { level: 3 }),
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        <Heading3 size={iconSize} />,
        'Heading 3',
      )}

      {divider}

      {/* Lists */}
      {btn(
        editor.isActive('bulletList'),
        () => editor.chain().focus().toggleBulletList().run(),
        <List size={iconSize} />,
        'Bullet list',
      )}
      {btn(
        editor.isActive('orderedList'),
        () => editor.chain().focus().toggleOrderedList().run(),
        <ListOrdered size={iconSize} />,
        'Numbered list',
      )}

      {divider}

      {/* Table */}
      {btn(
        editor.isActive('table'),
        () => {
          if (editor.isActive('table')) {
            editor.chain().focus().deleteTable().run();
          } else {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          }
        },
        <Table size={iconSize} />,
        editor.isActive('table') ? 'Delete table' : 'Insert table',
      )}

      {/* Link */}
      {btn(
        editor.isActive('link'),
        () => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          } else {
            const url = window.prompt('URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }
        },
        <Link2 size={iconSize} />,
        editor.isActive('link') ? 'Remove link' : 'Add link',
      )}

      {divider}

      {/* Undo / Redo */}
      {btn(
        false,
        () => editor.chain().focus().undo().run(),
        <Undo2 size={iconSize} />,
        'Undo (⌘Z)',
        !editor.can().undo(),
      )}
      {btn(
        false,
        () => editor.chain().focus().redo().run(),
        <Redo2 size={iconSize} />,
        'Redo (⌘⇧Z)',
        !editor.can().redo(),
      )}
    </div>
  );
}
