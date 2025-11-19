import { useState, useCallback, useMemo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { AsyncThunk } from "@reduxjs/toolkit";

interface CrudThunks<TEntity extends { id: string }> {
  fetch: AsyncThunk<TEntity[], unknown, Record<string, unknown>>;
  create: AsyncThunk<TEntity, unknown, Record<string, unknown>>;
  update: AsyncThunk<unknown, unknown, Record<string, unknown>>;
  delete: AsyncThunk<string, { id: string }, Record<string, unknown>>;
}

interface UseCrudPageOptions<TEntity extends { id: string }, TFormData> {
  initialFormData: TFormData;
  thunks: CrudThunks<TEntity>;
  createPayloadKey?: string;
  updatePayloadKey?: string;
  getEntityName?: (entity: TEntity) => string;
  onSuccess?: () => void;
}

export function useCrudPage<
  TEntity extends { id: string },
  TFormData = Record<string, unknown>
>({
  initialFormData,
  thunks,
  createPayloadKey = "data",
  updatePayloadKey = "data",
  getEntityName,
  onSuccess,
}: UseCrudPageOptions<TEntity, TFormData>) {
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<TEntity | null>(null);

  const handleRefresh = useCallback(async () => {
    await dispatch(thunks.fetch(undefined));
  }, [dispatch, thunks]);

  const handleCreate = useCallback(() => {
    setFormData(initialFormData);
    setEditingId(null);
    setDialogOpen(true);
  }, [initialFormData]);

  const handleEdit = useCallback(
    (entity: TEntity) => {
      const formDataFromEntity = { ...entity } as unknown as TFormData;
      setFormData(formDataFromEntity);
      setEditingId(entity.id);
      setDialogOpen(true);
    },
    []
  );

  const handleDelete = useCallback(
    async (entity: TEntity) => {
      const entityName = getEntityName ? getEntityName(entity) : "this item";
      if (confirm(`Are you sure you want to delete "${entityName}"?`)) {
        await dispatch(thunks.delete({ id: entity.id }));
      }
    },
    [dispatch, thunks, getEntityName]
  );

  const handleInfo = useCallback((entity: TEntity) => {
    setSelectedEntity(entity);
    setDetailsDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (data: TFormData) => {
      try {
        if (editingId) {
          await dispatch(
            thunks.update({
              id: editingId,
              [updatePayloadKey]: data,
            } as { id: string } & Record<string, TFormData | Partial<TEntity>>)
          );
        } else {
          await dispatch(
            thunks.create({
              [createPayloadKey]: data,
            } as Record<string, TFormData>)
          );
        }
        setDialogOpen(false);
        setFormData(initialFormData);
        setEditingId(null);
        onSuccess?.();
      } catch (error) {
        console.error("Error saving:", error);
        alert("Failed to save. Please try again.");
      }
    },
    [editingId, dispatch, thunks, createPayloadKey, updatePayloadKey, initialFormData, onSuccess]
  );

  const handleDialogClose = useCallback(
    (open: boolean) => {
      if (!open) {
        setFormData(initialFormData);
        setEditingId(null);
      }
      setDialogOpen(open);
    },
    [initialFormData]
  );

  const dialogTitle = useMemo(
    () => (editingId ? "Edit" : "Add"),
    [editingId]
  );

  const submitLabel = useMemo(
    () => (editingId ? "Update" : "Save"),
    [editingId]
  );

  return {
    dialogOpen,
    setDialogOpen,
    detailsDialogOpen,
    setDetailsDialogOpen,
    formData,
    setFormData,
    editingId,
    selectedEntity,
    handleRefresh,
    handleCreate,
    handleEdit,
    handleDelete,
    handleInfo,
    handleSubmit,
    handleDialogClose,
    dialogTitle,
    submitLabel,
  };
}

