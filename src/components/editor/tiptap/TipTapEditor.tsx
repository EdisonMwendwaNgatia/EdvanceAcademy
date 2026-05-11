"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Undo,
  Redo,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Quote,
  Minus,
  Palette,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface TipTapEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isTitle?: boolean;
}

export default function TipTapEditor({ 
  content, 
  onChange, 
  placeholder = "Write something...",
  isTitle = false 
}: TipTapEditorProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [fontFamily, setFontFamily] = useState("Inter");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-2",
        },
      }),
      TextStyle,
      Color,
      FontFamily.configure({
        types: ["textStyle"],
      }),
    ],
    content: content || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        className: `focus:outline-none p-4 ${
          isTitle 
            ? "text-3xl font-bold title-editor" 
            : "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl content-editor"
        }`,
        placeholder: placeholder,
      },
    },
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when prop changes (e.g., when selecting a new lesson)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkModal(false);
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  const setFont = (font: string) => {
    setFontFamily(font);
    editor.chain().focus().setFontFamily(font).run();
  };

  const fontOptions = [
    "Inter",
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Verdana",
  ];

  const headingOptions = [
    { level: 1 as const, icon: Heading1, label: "Heading 1" },
    { level: 2 as const, icon: Heading2, label: "Heading 2" },
    { level: 3 as const, icon: Heading3, label: "Heading 3" },
    { level: 4 as const, icon: Heading4, label: "Heading 4" },
    { level: 5 as const, icon: Heading5, label: "Heading 5" },
    { level: 6 as const, icon: Heading6, label: "Heading 6" },
  ];

  const colors = [
    "#000000",
    "#E74C3C",
    "#3498DB",
    "#2ECC71",
    "#F39C12",
    "#9B59B6",
    "#1ABC9C",
    "#E67E22",
  ];

  return (
    <div className="bg-white" ref={editorContainerRef}>
      {/* Toolbar - Sticky on scroll */}
      <div 
        ref={toolbarRef}
        className="sticky top-0 border-b bg-gray-50 p-2 z-10 shadow-md"
      >
        <div className="flex flex-wrap gap-1">
          {/* Headings */}
          <div className="relative group">
            <button className="p-2 hover:bg-gray-200 rounded">
              <Heading1 className="w-4 h-4" />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg hidden group-hover:block z-20 min-w-37.5">
              {headingOptions.map((option) => (
                <button
                  key={option.level}
                  onClick={() => editor.chain().focus().toggleHeading({ level: option.level }).run()}
                  className={`flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-gray-100 ${
                    editor.isActive("heading", { level: option.level }) ? "bg-gray-100" : ""
                  }`}
                >
                  <option.icon className="w-4 h-4" />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Text Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive("bold") ? "bg-gray-200" : ""
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive("italic") ? "bg-gray-200" : ""
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive("strike") ? "bg-gray-200" : ""
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive("underline") ? "bg-gray-200" : ""
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive("highlight") ? "bg-yellow-200" : ""
            }`}
            title="Highlight"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 hover:bg-gray-200 rounded"
              title="Text Color"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-2 z-20">
                <div className="grid grid-cols-4 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button
                    onClick={() => {
                      editor.chain().focus().unsetColor().run();
                      setShowColorPicker(false);
                    }}
                    className="col-span-4 text-xs text-gray-600 hover:bg-gray-100 p-1 rounded"
                  >
                    Remove Color
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Font Family */}
          <select
            value={fontFamily}
            onChange={(e) => setFont(e.target.value)}
            className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
            title="Font Family"
          >
            {fontOptions.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Text Alignment */}
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""
            }`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive("bulletList") ? "bg-gray-200" : ""
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive("orderedList") ? "bg-gray-200" : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive("blockquote") ? "bg-gray-200" : ""
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 hover:bg-gray-200 rounded ${
              editor.isActive("codeBlock") ? "bg-gray-200" : ""
            }`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Links & Media */}
          <button
            onClick={() => setShowLinkModal(true)}
            className="p-2 hover:bg-gray-200 rounded"
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            onClick={addImage}
            className="p-2 hover:bg-gray-200 rounded"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            onClick={addHorizontalRule}
            className="p-2 hover:bg-gray-200 rounded"
            title="Horizontal Line"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Undo/Redo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="p-2 hover:bg-gray-200 rounded"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="p-2 hover:bg-gray-200 rounded"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <input
              type="url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Custom CSS */}
      <style>{`
        .title-editor.ProseMirror {
          min-height: 200px !important;
          max-height: 200px !important;
          overflow-y: auto !important;
        }
        
        .title-editor.ProseMirror p {
          margin: 0 !important;
          line-height: 1.3 !important;
        }
        
        .content-editor.ProseMirror {
          min-height: 300px !important;
        }
        
        .ProseMirror {
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(placeholder);
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        ${!isTitle ? `
          .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 0.5rem 0;
          }
          
          .ProseMirror a {
            color: #2563eb;
            text-decoration: underline;
          }
          
          .ProseMirror blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1rem;
            font-style: italic;
            margin: 1rem 0;
          }
          
          .ProseMirror code {
            background-color: #f3f4f6;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-family: monospace;
          }
          
          .ProseMirror pre {
            background-color: #1f2937;
            color: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
          }
          
          .ProseMirror pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
          }
          
          .ProseMirror h1 {
            font-size: 2rem;
            font-weight: bold;
            margin: 1rem 0;
          }
          
          .ProseMirror h2 {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 0.75rem 0;
          }
          
          .ProseMirror h3 {
            font-size: 1.25rem;
            font-weight: bold;
            margin: 0.5rem 0;
          }
          
          .ProseMirror ul, .ProseMirror ol {
            margin: 0.5rem 0;
            padding-left: 1.5rem;
          }
        ` : ''}
      `}</style>
    </div>
  );
}