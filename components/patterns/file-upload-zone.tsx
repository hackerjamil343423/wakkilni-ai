"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  className?: string;
}

export function FileUploadZone({
  onUpload,
  accept = "image/*",
  maxSize = 5,
  multiple = false,
  className = "",
}: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const maxSizeBytes = maxSize * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    if (accept && accept !== "*") {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          const mainType = type.split("/")[0];
          return file.type.startsWith(mainType + "/");
        }
        return file.type === type || file.name.endsWith(type.replace("*", ""));
      });

      if (!isAccepted) {
        setError(`File type not accepted. Please upload: ${accept}`);
        return false;
      }
    }

    return true;
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!validateFile(file)) {
        return;
      }

      setSelectedFile(file);
      setUploading(true);
      setProgress(0);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        await onUpload(file);

        clearInterval(progressInterval);
        setProgress(100);

        // Reset after successful upload
        setTimeout(() => {
          setSelectedFile(null);
          setProgress(0);
          setUploading(false);
        }, 1000);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to upload file"
        );
        setUploading(false);
        setProgress(0);
      }
    },
    [onUpload]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${uploading ? "pointer-events-none opacity-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          id="file-upload"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center py-12 px-6 cursor-pointer"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            {accept} (max {maxSize}MB)
          </p>
        </label>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          <FileIcon className="w-8 h-8 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {uploading && (
              <Progress value={progress} className="h-1 mt-2" />
            )}
          </div>
          {!uploading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
