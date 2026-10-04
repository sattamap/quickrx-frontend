import { apiRequest } from "./apiClient";

import type {
  Visit,
  CreateVisitInput,
} from "../types/visit";

const API_URL = "/visits";

/**
 * Get all visits belonging to the authenticated user.
 */
export const getVisits = async (): Promise<Visit[]> => {
  return apiRequest<Visit[]>(API_URL);
};

/**
 * Get all visits for a specific patient.
 */
export const getVisitsByPatientId = async (
  patientId: string,
): Promise<Visit[]> => {
  return apiRequest<Visit[]>(
    `${API_URL}/patient/${patientId}`,
  );
};

/**
 * Get a single visit.
 */
export const getVisitById = async (
  id: string,
): Promise<Visit> => {
  return apiRequest<Visit>(
    `${API_URL}/${id}`,
  );
};

/**
 * Create a new visit.
 */
export const createVisit = async (
  data: CreateVisitInput,
): Promise<Visit> => {
  return apiRequest<Visit>(
    API_URL,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};

/**
 * Update an existing visit.
 */
export const updateVisit = async (
  id: string,
  data: Partial<CreateVisitInput>,
): Promise<Visit> => {
  return apiRequest<Visit>(
    `${API_URL}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
};

/**
 * Delete a visit.
 */
export const deleteVisit = async (
  id: string,
): Promise<void> => {
  await apiRequest<void>(
    `${API_URL}/${id}`,
    {
      method: "DELETE",
    },
  );
};