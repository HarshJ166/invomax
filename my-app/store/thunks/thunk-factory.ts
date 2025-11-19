import { createAsyncThunk } from "@reduxjs/toolkit";

interface DbServiceMethods<TEntity> {
  getAll: () => Promise<TEntity[]>;
  create: (entity: TEntity | Partial<TEntity>) => Promise<{ success: boolean }>;
  update: (id: string, entity: TEntity | Partial<TEntity>) => Promise<{ success: boolean }>;
  delete: (id: string) => Promise<{ success: boolean }>;
}

interface CreateThunkOptions<TEntity extends { id: string }, TFormData extends Record<string, unknown>> {
  entityName: string;
  dbService: DbServiceMethods<TEntity>;
  setAction: (entities: TEntity[]) => { type: string; payload: TEntity[] };
  addAction: (formData: TFormData) => { type: string; payload: TFormData };
  updateAction: (payload: { id: string; data: TFormData | Partial<TEntity> }) => {
    type: string;
    payload: { id: string; data: TFormData | Partial<TEntity> };
  };
  deleteAction: (id: string) => { type: string; payload: string };
  createEntityFactory?: (formData: TFormData) => TEntity;
  updateEntityFactory?: (
    existing: TEntity,
    formData: TFormData | Partial<TEntity>
  ) => TEntity;
}

export function createCrudThunks<TEntity extends { id: string }, TFormData extends Record<string, unknown>>({
  entityName,
  dbService: dbMethods,
  setAction,
  addAction,
  updateAction,
  deleteAction,
  createEntityFactory,
  updateEntityFactory,
}: CreateThunkOptions<TEntity, TFormData>) {
  const fetchThunk = createAsyncThunk(
    `${entityName}/fetch${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
    async (_, { dispatch, rejectWithValue }) => {
      try {
        const entities = await dbMethods.getAll();
        dispatch(setAction(entities));
        return entities;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to fetch ${entityName}`;
        return rejectWithValue(errorMessage);
      }
    }
  );

  const createThunk = createAsyncThunk(
    `${entityName}/create${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
    async (
      payload: { [key: string]: TFormData },
      { dispatch, rejectWithValue }
    ) => {
      try {
        const formData = Object.values(payload)[0];
        const newEntity: TEntity = createEntityFactory
          ? createEntityFactory(formData)
          : ({
              ...formData,
              id: `${entityName}-${Date.now()}`,
            } as unknown as TEntity);

        const result = await dbMethods.create(newEntity);

        if (!result.success) {
          return rejectWithValue(`Failed to create ${entityName} in database`);
        }

        dispatch(addAction(formData));
        return newEntity;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to create ${entityName}`;
        return rejectWithValue(errorMessage);
      }
    }
  );

  const updateThunk = createAsyncThunk(
    `${entityName}/update${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
    async (
      payload: { id: string } & Record<string, TFormData | Partial<TEntity>>,
      { dispatch, rejectWithValue, getState }
    ) => {
      try {
        const dataKey = Object.keys(payload).find((key) => key !== "id");
        const updateData = dataKey ? payload[dataKey] : payload;

        if (updateEntityFactory) {
          const state = getState() as {
            [key: string]: { [key: string]: TEntity[] };
          };
          const entityKey = Object.keys(state).find((key) =>
            key.includes(entityName)
          );
          if (entityKey) {
            const entities = state[entityKey][entityKey] as TEntity[];
            const existing = entities.find((e) => e.id === payload.id);
            if (existing) {
              const updated = updateEntityFactory(
                existing,
                updateData as TFormData | Partial<TEntity>
              );
              const result = await dbMethods.update(payload.id, updated);
              if (!result.success) {
                return rejectWithValue(
                  `Failed to update ${entityName} in database`
                );
              }
              dispatch(updateAction({ id: payload.id, data: updated }));
              return { id: payload.id, data: updated };
            }
          }
        }

        const updatePayload = updateData as TEntity | Partial<TEntity>;
        const result = await dbMethods.update(payload.id, updatePayload);

        if (!result.success) {
          return rejectWithValue(`Failed to update ${entityName} in database`);
        }

        dispatch(
          updateAction({
            id: payload.id,
            data: updatePayload,
          })
        );
        return { id: payload.id, data: updatePayload };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to update ${entityName}`;
        return rejectWithValue(errorMessage);
      }
    }
  );

  const deleteThunk = createAsyncThunk(
    `${entityName}/delete${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
    async (
      payload: { id: string },
      { dispatch, rejectWithValue }
    ) => {
      try {
        const result = await dbMethods.delete(payload.id);

        if (!result.success) {
          return rejectWithValue(`Failed to delete ${entityName} from database`);
        }

        dispatch(deleteAction(payload.id));
        return payload.id;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to delete ${entityName}`;
        return rejectWithValue(errorMessage);
      }
    }
  );

  return {
    fetch: fetchThunk,
    create: createThunk,
    update: updateThunk,
    delete: deleteThunk,
  };
}

