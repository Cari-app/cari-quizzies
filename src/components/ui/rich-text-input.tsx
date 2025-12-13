import * as React from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontSize, Color } from "@tiptap/extension-text-style";
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
  Check,
} from "lucide-react";

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

// Toolbar Button Component
const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }
>(({ onClick, isActive, disabled, title, children }, ref) => (
  <button
    ref={ref}
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
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
));
ToolbarButton.displayName = "ToolbarButton";

// Color Picker Dropdown - uses portal to avoid clipping
const ColorPickerDropdown: React.FC<{
  colors: string[];
  currentColor: string;
  applyColor: (color: string) => void;
  icon: React.ReactNode;
  title: string;
  editor: Editor;
}> = ({ colors, currentColor, applyColor, icon, title, editor }) => {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const savedSelectionRef = React.useRef<{ from: number; to: number } | null>(null);
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0 });

  // Save selection when opening dropdown
  const handleOpen = () => {
    const { from, to } = editor.state.selection;
    savedSelectionRef.current = { from, to };
    
    // Calculate position based on button
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.max(8, rect.left - 80), // Center the dropdown
      });
    }
    setOpen(true);
  };

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
        savedSelectionRef.current = null;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleColorSelect = (color: string) => {
    // Restore selection and apply color in one operation
    if (savedSelectionRef.current) {
      const { from, to } = savedSelectionRef.current;
      // First restore selection, then apply color
      editor.commands.setTextSelection({ from, to });
      // Now apply color with focus
      applyColor(color);
    }
    setOpen(false);
    savedSelectionRef.current = null;
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) {
            setOpen(false);
            savedSelectionRef.current = null;
          } else {
            handleOpen();
          }
        }}
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
          style={{ backgroundColor: currentColor || "#000000" }}
        />
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed p-3 bg-popover border border-border rounded-lg shadow-xl z-[10001] min-w-[200px]"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-7 gap-1.5">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleColorSelect(color);
                }}
                className={cn(
                  "w-6 h-6 rounded-md border border-border transition-all",
                  "hover:scale-110 hover:shadow-md",
                  currentColor === color && "ring-2 ring-primary ring-offset-1"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground text-xs">Custom:</span>
              <input
                type="color"
                value={currentColor || "#000000"}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => {
                  handleColorSelect(e.target.value);
                }}
                className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
              />
            </label>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// Font Size Dropdown
const FontSizeDropdown: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const getCurrentFontSize = () => {
    const attrs = editor.getAttributes("textStyle");
    return attrs.fontSize || "16px";
  };

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSizeSelect = (size: string) => {
    editor.chain().focus().setFontSize(size).run();
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          "h-7 px-2 rounded-md transition-all duration-150 ease-out",
          "hover:bg-accent hover:text-accent-foreground",
          "flex items-center gap-1 text-xs font-medium min-w-[55px]"
        )}
      >
        {getCurrentFontSize().replace("px", "")}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 p-1 bg-popover border border-border rounded-lg shadow-xl z-[10000] max-h-64 overflow-y-auto min-w-[70px]"
          onMouseDown={(e) => e.preventDefault()}
        >
          {fontSizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSizeSelect(size.value);
              }}
              className={cn(
                "w-full px-3 py-1.5 text-sm text-left rounded-sm transition-colors flex items-center justify-between",
                "hover:bg-accent hover:text-accent-foreground",
                getCurrentFontSize() === size.value && "bg-accent"
              )}
            >
              <span>{size.label}px</span>
              {getCurrentFontSize() === size.value && (
                <Check className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Link Editor
const LinkEditor: React.FC<{
  editor: Editor;
  onClose: () => void;
}> = ({ editor, onClose }) => {
  const [url, setUrl] = React.useState("");
  const isActive = editor.isActive("link");
  const currentUrl = editor.getAttributes("link").href || "";
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setUrl(currentUrl);
    setTimeout(() => inputRef.current?.focus(), 50);
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
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-2 bg-popover border border-border rounded-lg shadow-xl"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        className="flex-1 px-3 py-1.5 text-sm rounded-md border border-input bg-background min-w-[200px]"
      />
      <button
        type="submit"
        className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        OK
      </button>
      {isActive && (
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().unsetLink().run();
            onClose();
          }}
          className="p-1.5 text-sm border border-input rounded-md hover:bg-accent"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
};

// Floating Toolbar
const FloatingToolbar: React.FC<{
  editor: Editor;
  position: { top: number; left: number };
}> = ({ editor, position }) => {
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
      className="fixed z-[9999] flex items-center gap-0.5 px-2 py-1.5 bg-popover border border-border rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95"
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
      <FontSizeDropdown editor={editor} />

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

      {/* Text Color */}
      <ColorPickerDropdown
        colors={colorPresets}
        currentColor={currentColor}
        applyColor={(color) => {
          editor.chain().focus().setColor(color).run();
        }}
        icon={<Type className="w-3.5 h-3.5" />}
        title="Cor do texto"
        editor={editor}
      />

      {/* Highlight Color */}
      <ColorPickerDropdown
        colors={highlightColors}
        currentColor={currentHighlight}
        applyColor={(color) => {
          editor.chain().focus().toggleHighlight({ color }).run();
        }}
        icon={<Highlighter className="w-3.5 h-3.5" />}
        title="Destaque"
        editor={editor}
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

// Main RichTextInput Component
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
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      const { from, to } = editor.state.selection;
      if (from === to) {
        // No selection, hide after a delay
        hideTimeoutRef.current = setTimeout(() => {
          setShowToolbar(false);
        }, 100);
        return;
      }

      // Calculate position
      const { view } = editor;
      try {
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        const toolbarWidth = 520;
        const left = (start.left + end.left) / 2 - toolbarWidth / 2;

        setToolbarPosition({
          top: Math.max(8, start.top - 50),
          left: Math.max(8, Math.min(left, window.innerWidth - toolbarWidth - 8)),
        });
        setShowToolbar(true);
      } catch {
        // Position calculation failed, hide toolbar
        setShowToolbar(false);
      }
    },
    onBlur: ({ event }) => {
      // Check if we're clicking inside a toolbar dropdown
      const relatedTarget = event?.relatedTarget as HTMLElement | null;
      if (relatedTarget?.closest('[class*="z-[10000]"]') || 
          relatedTarget?.closest('[class*="z-[9999]"]')) {
        return;
      }

      // Delay hiding to allow toolbar interactions
      hideTimeoutRef.current = setTimeout(() => {
        setShowToolbar(false);
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

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Sync external value changes
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(value || "");
      // Try to restore selection
      try {
        const docLength = editor.state.doc.content.size;
        const safeFrom = Math.min(from, docLength);
        const safeTo = Math.min(to, docLength);
        editor.commands.setTextSelection({ from: safeFrom, to: safeTo });
      } catch {
        // Ignore selection errors
      }
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

      {/* Editor Content */}
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
