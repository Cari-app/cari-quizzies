import * as React from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle, FontSize } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Type,
  RemoveFormatting,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  ChevronDown,
  Undo,
  Redo,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RichTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  showBorder?: boolean;
}

const fontSizes = [
  { value: "12px", label: "12" },
  { value: "14px", label: "14" },
  { value: "16px", label: "16" },
  { value: "18px", label: "18" },
  { value: "20px", label: "20" },
  { value: "24px", label: "24" },
  { value: "28px", label: "28" },
  { value: "32px", label: "32" },
  { value: "36px", label: "36" },
  { value: "42px", label: "42" },
  { value: "48px", label: "48" },
  { value: "56px", label: "56" },
  { value: "64px", label: "64" },
  { value: "72px", label: "72" },
];

const colorPresets = [
  "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6", "#FFFFFF",
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E", "#10B981",
  "#14B8A6", "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#D946EF", "#EC4899", "#F43F5E",
];

const highlightColors = [
  "#FEF08A", "#FDE047", "#FACC15",
  "#BBF7D0", "#86EFAC", "#4ADE80",
  "#BFDBFE", "#93C5FD", "#60A5FA",
  "#FECACA", "#FCA5A5", "#F87171",
  "#E9D5FF", "#D8B4FE", "#C084FC",
  "#FED7AA", "#FDBA74", "#FB923C",
];

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  disabled,
  title,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-1.5 rounded-md transition-all duration-150 ease-out",
      "hover:bg-accent hover:text-accent-foreground",
      "active:scale-95",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      isActive && "bg-accent text-accent-foreground"
    )}
    title={title}
  >
    {children}
  </button>
);

interface ColorPickerProps {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  icon: React.ReactNode;
  title: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  value,
  onChange,
  icon,
  title,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "p-1.5 rounded-md transition-all duration-150 ease-out",
            "hover:bg-accent hover:text-accent-foreground",
            "flex flex-col items-center gap-0.5"
          )}
          title={title}
        >
          {icon}
          <div
            className="w-4 h-1 rounded-full"
            style={{ backgroundColor: value || "#000000" }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 bg-popover" align="start" sideOffset={8}>
        <div className="grid grid-cols-7 gap-1.5">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onChange(color);
                setOpen(false);
              }}
              className={cn(
                "w-6 h-6 rounded-md border border-border transition-all",
                "hover:scale-110 hover:shadow-md",
                value === color && "ring-2 ring-primary ring-offset-1"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Custom:</span>
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-none"
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface FontSizeSelectorProps {
  editor: Editor;
}

const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({ editor }) => {
  const [open, setOpen] = React.useState(false);
  
  const getCurrentFontSize = () => {
    const attrs = editor.getAttributes("textStyle");
    return attrs.fontSize || "16px";
  };

  const setFontSize = (size: string) => {
    editor.chain().focus().setFontSize(size).run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "h-7 px-2 rounded-md transition-all duration-150 ease-out",
            "hover:bg-accent hover:text-accent-foreground",
            "flex items-center gap-1 text-xs font-medium min-w-[60px]"
          )}
        >
          {getCurrentFontSize().replace("px", "")}px
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-24 p-1 bg-popover" align="start" sideOffset={8}>
        <div className="flex flex-col max-h-64 overflow-y-auto">
          {fontSizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => setFontSize(size.value)}
              className={cn(
                "px-3 py-1.5 text-sm text-left rounded-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                getCurrentFontSize() === size.value && "bg-accent"
              )}
            >
              {size.label}px
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface LinkEditorProps {
  editor: Editor;
  onClose: () => void;
}

const LinkEditor: React.FC<LinkEditorProps> = ({ editor, onClose }) => {
  const [url, setUrl] = React.useState("");
  const isActive = editor.isActive("link");
  const currentUrl = editor.getAttributes("link").href || "";

  React.useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 bg-popover border border-border rounded-lg shadow-lg">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="flex-1 px-3 py-1.5 text-sm rounded-md border border-input bg-background min-w-[200px]"
        autoFocus
      />
      <button
        type="submit"
        className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Aplicar
      </button>
      {isActive && (
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().unsetLink().run();
            onClose();
          }}
          className="px-2 py-1.5 text-sm border border-input rounded-md hover:bg-accent"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
};

interface FloatingToolbarProps {
  editor: Editor;
  position: { top: number; left: number };
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ editor, position }) => {
  const [showLinkEditor, setShowLinkEditor] = React.useState(false);
  
  const currentColor = editor.getAttributes("textStyle").color || "#000000";
  const currentHighlight = editor.getAttributes("highlight").color || "#FEF08A";

  if (showLinkEditor) {
    return createPortal(
      <div
        className="fixed z-[9999] animate-in fade-in-0 zoom-in-95"
        style={{ top: position.top, left: position.left }}
        onMouseDown={(e) => e.preventDefault()}
      >
        <LinkEditor editor={editor} onClose={() => setShowLinkEditor(false)} />
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      className="fixed z-[9999] flex items-center gap-0.5 px-2 py-1.5 bg-popover border border-border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Desfazer (Ctrl+Z)"
      >
        <Undo className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Refazer (Ctrl+Y)"
      >
        <Redo className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Font Size */}
      <FontSizeSelector editor={editor} />

      <div className="w-px h-5 bg-border mx-1" />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Negrito (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Itálico (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Sublinhado (Ctrl+U)"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Tachado"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Sub/Superscript */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={editor.isActive("subscript")}
        title="Subscrito"
      >
        <SubscriptIcon className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive("superscript")}
        title="Sobrescrito"
      >
        <SuperscriptIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Alinhar à esquerda"
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Centralizar"
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Alinhar à direita"
      >
        <AlignRight className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Colors */}
      <ColorPicker
        colors={colorPresets}
        value={currentColor}
        onChange={(color) => editor.chain().focus().setColor(color).run()}
        icon={<Type className="w-3.5 h-3.5" />}
        title="Cor do texto"
      />
      <ColorPicker
        colors={highlightColors}
        value={currentHighlight}
        onChange={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
        icon={<Highlighter className="w-3.5 h-3.5" />}
        title="Cor de destaque"
      />

      <div className="w-px h-5 bg-border mx-1" />

      {/* Link */}
      <ToolbarButton
        onClick={() => setShowLinkEditor(true)}
        isActive={editor.isActive("link")}
        title="Inserir link"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </ToolbarButton>

      {/* Clear formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Limpar formatação"
      >
        <RemoveFormatting className="w-3.5 h-3.5" />
      </ToolbarButton>
    </div>,
    document.body
  );
};

export function RichTextInput({
  value,
  onChange,
  placeholder,
  className,
  minHeight = "40px",
  showBorder = true,
}: RichTextInputProps) {
  const [showToolbar, setShowToolbar] = React.useState(false);
  const [toolbarPosition, setToolbarPosition] = React.useState({ top: 0, left: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["paragraph"],
      }),
      TextStyle,
      FontSize,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "",
        emptyEditorClass: "is-editor-empty",
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleanedHtml = html === "<p></p>" ? "" : html;
      onChange(cleanedHtml);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setShowToolbar(false);
        return;
      }

      // Get selection coordinates
      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      
      const toolbarWidth = 520;
      const left = (start.left + end.left) / 2 - toolbarWidth / 2;
      
      setToolbarPosition({
        top: start.top - 50,
        left: Math.max(8, Math.min(left, window.innerWidth - toolbarWidth - 8)),
      });
      setShowToolbar(true);
    },
    onBlur: () => {
      // Delay hiding to allow clicking toolbar buttons
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setShowToolbar(false);
        }
      }, 200);
    },
    editorProps: {
      attributes: {
        class: cn(
          "outline-none min-h-full prose prose-sm max-w-none",
          "[&_p]:my-0 [&_p]:leading-normal"
        ),
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync external value changes
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "w-full rounded-md bg-background px-3 py-2 text-sm animate-pulse",
          showBorder && "border border-input"
        )}
        style={{ minHeight }}
      />
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Floating Toolbar */}
      {showToolbar && <FloatingToolbar editor={editor} position={toolbarPosition} />}

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={cn(
          "w-full rounded-md bg-background px-3 py-2 text-sm",
          "ring-offset-background transition-colors",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          showBorder && "border border-input",
          "[&_.is-editor-empty:first-child::before]:text-muted-foreground",
          "[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_.is-editor-empty:first-child::before]:float-left",
          "[&_.is-editor-empty:first-child::before]:h-0",
          "[&_.is-editor-empty:first-child::before]:pointer-events-none"
        )}
        style={{ minHeight }}
      />
    </div>
  );
}

export { useEditor } from "@tiptap/react";
