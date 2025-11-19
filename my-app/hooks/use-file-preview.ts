import { useState, useCallback } from "react";

interface UseFilePreviewOptions {
  onFileChange?: (file: File | null, preview: string) => void;
}

export function useFilePreview({ onFileChange }: UseFilePreviewOptions = {}) {
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = useCallback(
    (newFile: File | null) => {
      if (newFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewUrl = e.target?.result as string;
          setPreview(previewUrl);
          setFile(newFile);
          onFileChange?.(newFile, previewUrl);
        };
        reader.readAsDataURL(newFile);
      } else {
        setPreview("");
        setFile(null);
        onFileChange?.(null, "");
      }
    },
    [onFileChange]
  );

  const removeFile = useCallback(() => {
    setPreview("");
    setFile(null);
    onFileChange?.(null, "");
  }, [onFileChange]);

  return {
    preview,
    file,
    handleFileChange,
    removeFile,
  };
}

