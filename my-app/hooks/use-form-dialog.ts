import { useState, useCallback } from "react";

interface UseFormDialogOptions<TFormData> {
  initialData: TFormData;
  onSubmit: (data: TFormData) => void | Promise<void>;
  onClose?: () => void;
}

export function useFormDialog<TFormData extends Record<string, unknown>>({
  initialData,
  onSubmit,
  onClose,
}: UseFormDialogOptions<TFormData>) {
  const [formData, setFormData] = useState<TFormData>(initialData);
  const [isOpen, setIsOpen] = useState(false);

  const handleFieldChange = useCallback(
    <K extends keyof TFormData>(field: K, value: TFormData[K]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(formData);
    },
    [formData, onSubmit]
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        setFormData(initialData);
        onClose?.();
      }
    },
    [initialData, onClose]
  );

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  const openDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setFormData(initialData);
    onClose?.();
  }, [initialData, onClose]);

  return {
    formData,
    setFormData,
    isOpen,
    handleFieldChange,
    handleSubmit,
    handleOpenChange,
    resetForm,
    openDialog,
    closeDialog,
  };
}

