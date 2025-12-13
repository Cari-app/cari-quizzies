import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  RemoveFormatting,
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
}

const colorOptions = [
  { value: "inherit", label: "Padrão", color: "currentColor" },
  { value: "#000000", label: "Preto", color: "#000000" },
  { value: "#6B7280", label: "Cinza", color: "#6B7280" },
  { value: "#EF4444", label: "Vermelho", color: "#EF4444" },
  { value: "#F97316", label: "Laranja", color: "#F97316" },
  { value: "#22C55E", label: "Verde", color: "#22C55E" },
  { value: "#3B82F6", label: "Azul", color: "#3B82F6" },
  { value: "#8B5CF6", label: "Roxo", color: "#8B5CF6" },
];

export function RichTextInput({
  value,
  onChange,
  placeholder,
  className,
  minHeight = "40px",
}: RichTextInputProps) {
  const [showToolbar, setShowToolbar] = React.useState(false);
  const [toolbarPosition, setToolbarPosition] = React.useState({ top: 0, left: 0 });
  const [selectedColor, setSelectedColor] = React.useState("inherit");
  const editorRef = React.useRef<HTMLDivElement>(null);
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const execCommand = (command: string, cmdValue?: string) => {
    document.execCommand(command, false, cmdValue);
    editorRef.current?.focus();
    handleInput();
  };

  const cleanHtml = (html: string): string => {
    // Remove empty style attributes
    return html
      .replace(/style=""/g, '')
      .replace(/style=''/g, '')
      .replace(/<div style="">/g, '<div>')
      .replace(/<span style="">/g, '<span>')
      .replace(/<font[^>]*>/gi, '') // Remove font tags
      .replace(/<\/font>/gi, '');
  };

  const handleInput = () => {
    if (editorRef.current) {
      const cleanedHtml = cleanHtml(editorRef.current.innerHTML);
      onChange(cleanedHtml);
    }
  };

  const updateToolbarPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0) {
      setShowToolbar(false);
      return;
    }

    // Position toolbar above the selection using fixed positioning
    const toolbarWidth = 380;
    const left = rect.left + rect.width / 2 - toolbarWidth / 2;
    
    setToolbarPosition({
      top: rect.top - 44,
      left: Math.max(8, Math.min(left, window.innerWidth - toolbarWidth - 8)),
    });
    setShowToolbar(true);
  };

  const handleMouseUp = () => {
    setTimeout(updateToolbarPosition, 10);
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.shiftKey || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      setTimeout(updateToolbarPosition, 10);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't hide toolbar if clicking on toolbar itself
    if (toolbarRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setTimeout(() => {
      setShowToolbar(false);
    }, 150);
  };

  const isFormatActive = (command: string): boolean => {
    return document.queryCommandState(command);
  };

  const ToolbarButton = ({
    command,
    icon: Icon,
    title,
  }: {
    command: string;
    icon: React.ElementType;
    title: string;
  }) => (
    <button
      type="button"
      tabIndex={-1}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => execCommand(command)}
      className={cn(
        "p-1.5 rounded-md hover:bg-foreground/10 transition-colors",
        isFormatActive(command) && "bg-foreground/10 text-primary"
      )}
      title={title}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Floating Toolbar - rendered via Portal */}
      {showToolbar && createPortal(
        <div
          ref={toolbarRef}
          className="fixed z-[9999] flex items-center gap-0.5 px-1.5 py-1 bg-popover border border-border rounded-lg shadow-lg"
          style={{
            top: toolbarPosition.top,
            left: toolbarPosition.left,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Text Size in pixels */}
          <select
            className="h-6 px-1.5 text-xs bg-popover border border-border outline-none cursor-pointer hover:bg-foreground/10 rounded min-w-[70px]"
            defaultValue="16"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const size = e.target.value;
              // Use execCommand with fontSize (1-7) then replace with inline style
              execCommand("fontSize", "7");
              // Find all font elements with size 7 and replace with span
              setTimeout(() => {
                if (editorRef.current) {
                  const fonts = editorRef.current.querySelectorAll('font[size="7"]');
                  fonts.forEach((font) => {
                    const span = document.createElement('span');
                    span.style.fontSize = `${size}px`;
                    span.innerHTML = font.innerHTML;
                    font.parentNode?.replaceChild(span, font);
                  });
                  handleInput();
                }
              }, 0);
            }}
          >
            <option value="12">12px</option>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
            <option value="24">24px</option>
            <option value="28">28px</option>
            <option value="32">32px</option>
            <option value="36">36px</option>
            <option value="42">42px</option>
            <option value="48">48px</option>
            <option value="56">56px</option>
            <option value="64">64px</option>
          </select>

          <div className="w-px h-4 bg-border mx-0.5" />

          <ToolbarButton command="bold" icon={Bold} title="Negrito" />
          <ToolbarButton command="italic" icon={Italic} title="Itálico" />
          <ToolbarButton command="underline" icon={Underline} title="Sublinhado" />
          <ToolbarButton command="strikeThrough" icon={Strikethrough} title="Tachado" />

          <div className="w-px h-4 bg-border mx-0.5" />

          <ToolbarButton command="justifyLeft" icon={AlignLeft} title="Esquerda" />
          <ToolbarButton command="justifyCenter" icon={AlignCenter} title="Centro" />
          <ToolbarButton command="justifyRight" icon={AlignRight} title="Direita" />

          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Color Picker */}
          <div className="relative flex items-center">
            <input
              type="color"
              value={selectedColor === "inherit" ? "#000000" : selectedColor}
              onChange={(e) => {
                const color = e.target.value;
                setSelectedColor(color);
                // Re-select the text before applying color
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  editorRef.current?.focus();
                  document.execCommand("foreColor", false, color);
                  handleInput();
                }
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                // Save current selection before color picker opens
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  (window as any).__savedRange = range.cloneRange();
                }
              }}
              onFocus={() => {
                // Restore selection when color picker receives focus
                const savedRange = (window as any).__savedRange;
                if (savedRange && editorRef.current) {
                  const selection = window.getSelection();
                  if (selection) {
                    selection.removeAllRanges();
                    selection.addRange(savedRange);
                  }
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Cor do texto"
            />
            <div className="p-1.5 rounded-md hover:bg-foreground/10 transition-colors flex flex-col items-center pointer-events-none">
              <Type className="w-3.5 h-3.5" />
              <div
                className="w-3.5 h-1 rounded-full mt-0.5"
                style={{ backgroundColor: selectedColor === "inherit" ? "#000000" : selectedColor }}
              />
            </div>
          </div>

          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("removeFormat")}
            className="p-1.5 rounded-md hover:bg-foreground/10 transition-colors"
            title="Limpar formatação"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </button>
        </div>,
        document.body
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleMouseUp}
        onKeyUp={handleKeyUp}
        onBlur={handleBlur}
        data-placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none"
        )}
        style={{ minHeight }}
        suppressContentEditableWarning
      />
    </div>
  );
}
