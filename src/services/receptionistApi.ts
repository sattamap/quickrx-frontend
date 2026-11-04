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
  const receptionist = await apiRequest<Receptionist>("/admin/receptionists", {
    method: "POST",
    body: JSON.stringify(data),
  });

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

export const updateReceptionistStatus = async (
  id: string,
  isActive: boolean,
): Promise<Receptionist> => {
  if (!id) {
    throw new Error("A valid receptionist ID is required.");
  }

  const updatedReceptionist = await apiRequest<Receptionist>(
    `/admin/receptionists/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    },
  );

  if (!updatedReceptionist?.id || updatedReceptionist.isActive !== isActive) {
    throw new Error("Could not confirm the receptionist status update.");
  }

  return updatedReceptionist;
};
