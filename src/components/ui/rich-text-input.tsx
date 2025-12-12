import * as React from "react";
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

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const updateToolbarPosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) {
      setShowToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    if (rect.width === 0) {
      setShowToolbar(false);
      return;
    }

    // Position toolbar above the selection
    const top = rect.top - containerRect.top - 44;
    const left = rect.left - containerRect.left + rect.width / 2 - 120;

    setToolbarPosition({
      top: Math.max(-44, top),
      left: Math.max(0, Math.min(left, containerRect.width - 240)),
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
      {/* Floating Toolbar */}
      {showToolbar && (
        <div
          ref={toolbarRef}
          className="absolute z-50 flex items-center gap-0.5 px-1.5 py-1 bg-popover border border-border rounded-lg shadow-lg"
          style={{
            top: toolbarPosition.top,
            left: toolbarPosition.left,
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Font Size */}
          <select
            className="h-6 px-1.5 text-xs bg-transparent border-0 outline-none cursor-pointer hover:bg-foreground/10 rounded"
            defaultValue="3"
            onChange={(e) => execCommand("fontSize", e.target.value)}
          >
            <option value="2">Pequeno</option>
            <option value="3">Normal</option>
            <option value="5">Grande</option>
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
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                tabIndex={-1}
                className="p-1.5 rounded-md hover:bg-foreground/10 transition-colors flex flex-col items-center"
                title="Cor do texto"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Type className="w-3.5 h-3.5" />
                <div
                  className="w-3.5 h-0.5 rounded-full mt-0.5"
                  style={{ backgroundColor: selectedColor === "inherit" ? "currentColor" : selectedColor }}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 bg-popover border border-border" align="center" sideOffset={8}>
              <div className="grid grid-cols-4 gap-1.5">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      execCommand("foreColor", opt.value);
                      setSelectedColor(opt.value);
                    }}
                    className={cn(
                      "w-6 h-6 rounded-md border border-border/50 hover:scale-110 transition-transform",
                      selectedColor === opt.value && "ring-2 ring-primary ring-offset-1"
                    )}
                    style={{ backgroundColor: opt.color }}
                    title={opt.label}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

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
        </div>
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
