"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (file: File) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleUpload() {
    if (!selectedFile) return;
    onUpload(selectedFile);
    setSelectedFile(null);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
        )}
      >
        <Upload className="text-muted-foreground mx-auto mb-3 size-8" />
        <p className="text-sm font-medium">Drop file here or click to upload</p>
        <p className="text-muted-foreground mt-1 text-xs">
          PDF, DOCX, XLSX, Images up to 10MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {selectedFile && (
        <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
          <FileText className="text-primary size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selectedFile.name}</p>
            <p className="text-muted-foreground text-xs">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => setSelectedFile(null)}
          >
            <X className="size-3.5" />
          </Button>
          <Button size="sm" onClick={handleUpload}>
            Upload
          </Button>
        </div>
      )}
    </div>
  );
}
