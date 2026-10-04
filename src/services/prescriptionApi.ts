import { apiRequest } from "./apiClient";

import type {
  Prescription,
  CreatePrescriptionInput,
} from "../types/prescription";

const API_URL = "/prescriptions";

/**
 * Get all prescriptions belonging to the
 * authenticated user.
 */
export const getPrescriptions =
  async (): Promise<Prescription[]> => {
    return apiRequest<Prescription[]>(
      API_URL,
    );
  };

/**
 * Get a prescription by ID.
 */
export const getPrescriptionById = async (
  id: string,
): Promise<Prescription> => {
  return apiRequest<Prescription>(
    `${API_URL}/${id}`,
  );
};

/**
 * Get the prescription belonging to a visit.
 *
 * The backend returns 404 when the visit does
 * not currently have a prescription.
 */
export const getPrescriptionByVisitId =
  async (
    visitId: string,
  ): Promise<Prescription | null> => {
    try {
      return await apiRequest<Prescription>(
        `${API_URL}/visit/${visitId}`,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("not found")
      ) {
        return null;
      }

      throw error;
    }
  };

/**
 * Get all prescriptions for a patient.
 */
export const getPrescriptionsByPatientId =
  async (
    patientId: string,
  ): Promise<Prescription[]> => {
    return apiRequest<Prescription[]>(
      `${API_URL}/patient/${patientId}`,
    );
  };

/**
 * Create a prescription.
 */
export const createPrescription = async (
  data: CreatePrescriptionInput,
): Promise<Prescription> => {
  return apiRequest<Prescription>(
    API_URL,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};

/**
 * Update a prescription.
 */
export const updatePrescription = async (
  id: string,
  data: Partial<CreatePrescriptionInput>,
): Promise<Prescription> => {
  return apiRequest<Prescription>(
    `${API_URL}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
};

/**
 * Delete a prescription.
 */
export const deletePrescription = async (
  id: string,
): Promise<void> => {
  await apiRequest<void>(
    `${API_URL}/${id}`,
    {
      method: "DELETE",
    },
  );
};