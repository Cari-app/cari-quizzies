import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RichTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

type FormatStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  align?: "left" | "center" | "right";
  fontSize?: "normal" | "small" | "large";
  color?: string;
};

const colorOptions = [
  { value: "inherit", label: "Padrão", color: "currentColor" },
  { value: "#000000", label: "Preto", color: "#000000" },
  { value: "#6B7280", label: "Cinza", color: "#6B7280" },
  { value: "#EF4444", label: "Vermelho", color: "#EF4444" },
  { value: "#F97316", label: "Laranja", color: "#F97316" },
  { value: "#EAB308", label: "Amarelo", color: "#EAB308" },
  { value: "#22C55E", label: "Verde", color: "#22C55E" },
  { value: "#3B82F6", label: "Azul", color: "#3B82F6" },
  { value: "#8B5CF6", label: "Roxo", color: "#8B5CF6" },
  { value: "#EC4899", label: "Rosa", color: "#EC4899" },
];

export function RichTextInput({
  value,
  onChange,
  placeholder,
  className,
  minHeight = "60px",
}: RichTextInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [format, setFormat] = React.useState<FormatStyle>({});
  const editorRef = React.useRef<HTMLDivElement>(null);

  // Parse existing HTML to extract format (simplified)
  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Small delay to allow button clicks
    setTimeout(() => {
      if (!editorRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
      }
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
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => execCommand(command)}
      className={cn(
        "p-1.5 rounded hover:bg-muted transition-colors",
        isFormatActive(command) && "bg-muted text-primary"
      )}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div
      className={cn(
        "relative rounded-md border border-input bg-background transition-all",
        isFocused && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        className
      )}
    >
      {/* Toolbar */}
      {isFocused && (
        <div className="flex items-center gap-0.5 p-1.5 border-b border-border bg-muted/30 rounded-t-md">
          {/* Font Size */}
          <Select
            defaultValue="normal"
            onValueChange={(v) => {
              const sizes: Record<string, string> = {
                small: "2",
                normal: "3",
                large: "5",
              };
              execCommand("fontSize", sizes[v]);
            }}
          >
            <SelectTrigger className="h-7 w-20 text-xs border-0 bg-transparent">
              <Type className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Normal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-px h-5 bg-border mx-1" />

          <ToolbarButton command="bold" icon={Bold} title="Negrito" />
          <ToolbarButton command="italic" icon={Italic} title="Itálico" />
          <ToolbarButton command="underline" icon={Underline} title="Sublinhado" />
          <ToolbarButton command="strikeThrough" icon={Strikethrough} title="Tachado" />

          <div className="w-px h-5 bg-border mx-1" />

          <ToolbarButton command="justifyLeft" icon={AlignLeft} title="Alinhar à esquerda" />
          <ToolbarButton command="justifyCenter" icon={AlignCenter} title="Centralizar" />
          <ToolbarButton command="justifyRight" icon={AlignRight} title="Alinhar à direita" />

          <div className="w-px h-5 bg-border mx-1" />

          {/* Color Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-muted transition-colors flex items-center gap-1"
                title="Cor do texto"
              >
                <span className="w-4 h-4 flex items-center justify-center font-bold text-sm">A</span>
                <div
                  className="w-4 h-1 rounded-sm"
                  style={{ backgroundColor: format.color || "currentColor" }}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="grid grid-cols-5 gap-1">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      execCommand("foreColor", opt.value);
                      setFormat((f) => ({ ...f, color: opt.value }));
                    }}
                    className={cn(
                      "w-6 h-6 rounded-md border border-border hover:scale-110 transition-transform",
                      format.color === opt.value && "ring-2 ring-primary"
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCommand("removeFormat")}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            title="Remover formatação"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-placeholder={placeholder}
        className={cn(
          "px-3 py-2 text-sm outline-none min-h-[40px]",
          !value && "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        )}
        style={{ minHeight }}
        suppressContentEditableWarning
      />
    </div>
  );
}
