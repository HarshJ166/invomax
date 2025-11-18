import { dbService } from "./db-service";

export const getDatabasePath = async (): Promise<string> => {
  try {
    const path = await dbService.getPath();
    return path;
  } catch (error) {
    console.error("Failed to get database path:", error);
    return "";
  }
};

