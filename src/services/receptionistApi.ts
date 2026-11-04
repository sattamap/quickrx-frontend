
import { apiRequest } from "./apiClient";

export interface CreateReceptionistInput {
  name: string;
  email: string;
  password: string;
}

export interface Receptionist {
  id: string;
  name: string;
  email: string;
  role: "receptionist";
  isActive: boolean;
  createdAt?: string;
}

export const createReceptionist = async (
  data: CreateReceptionistInput,
): Promise<Receptionist> => {
  const receptionist = await apiRequest<Receptionist>(
    "/admin/receptionists",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  if (!receptionist?.id) {
    throw new Error("Receptionist account creation could not be confirmed.");
  }

  return receptionist;
};

// Get all receptionist accounts
export const getReceptionists = async (): Promise<Receptionist[]> => {
  const receptionists = await apiRequest<Receptionist[]>(
    "/admin/receptionists",
  );

  if (!Array.isArray(receptionists)) {
    throw new Error("Could not load receptionist accounts.");
  }

  return receptionists;
};

// Permanently delete a receptionist account
export const deleteReceptionist = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("A valid receptionist ID is required.");
  }

  await apiRequest(
    `/admin/receptionists/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
};
