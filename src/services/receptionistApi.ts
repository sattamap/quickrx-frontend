
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
}

export const createReceptionist = async (
  data: CreateReceptionistInput
): Promise<Receptionist> => {
  const receptionist = await apiRequest<Receptionist>(
    "/admin/receptionists",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (!receptionist?.id) {
    throw new Error("Receptionist account creation could not be confirmed.");
  }

  return receptionist;
};
