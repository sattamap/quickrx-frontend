import { apiRequest } from "./apiClient";

import type { Patient, CreatePatientInput } from "../types/patient";

const API_URL = "/patients";

/**
 * Get all patients belonging to the authenticated user.
 */
export const getPatients = async (): Promise<Patient[]> => {
  return apiRequest<Patient[]>(API_URL);
};

/**
 * Get one patient.
 */
export const getPatientById = async (id: string): Promise<Patient> => {
  return apiRequest<Patient>(`${API_URL}/${id}`);
};

/**
 * Create a patient.
 */
export const createPatient = async (
  data: CreatePatientInput,
): Promise<Patient> => {
  return apiRequest<Patient>(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Update a patient.
 */
export const updatePatient = async (
  id: string,
  data: Partial<CreatePatientInput>,
): Promise<Patient> => {
  return apiRequest<Patient>(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * Delete a patient.
 */
export const deletePatient = async (id: string): Promise<void> => {
  await apiRequest<void>(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};

/**
 * Delete multiple patients and their related medical records.
 */
export interface BulkDeletePatientsResult {
  deletedCount: number;
  deletedIds: string[];
}

export const bulkDeletePatients = async (
  patientIds: string[],
): Promise<BulkDeletePatientsResult> => {
  if (patientIds.length === 0) {
    throw new Error("Please select at least one patient.");
  }

  return apiRequest<BulkDeletePatientsResult>(`${API_URL}/bulk-delete`, {
    method: "POST",
    body: JSON.stringify({ patientIds }),
  });
};
