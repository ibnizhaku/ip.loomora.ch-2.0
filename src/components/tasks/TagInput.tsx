import { useState, KeyboardEvent } from "react";
import { X, Tag, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Tag eingeben und Enter drücken...",
  className,
  readOnly = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  if (readOnly) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />
              {tag}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Keine Tags</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Existing tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1 pl-2"
            >
              <Tag className="h-3 w-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter, Komma oder + drücken um Tag hinzuzufügen
      </p>
    </div>
  );
}

