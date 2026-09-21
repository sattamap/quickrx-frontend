import type {
  CreateVisitInput,
  Visit,
} from "../types/visit.ts";

const API_URL = "http://localhost:5000/api/visits";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getVisits = async (): Promise<Visit[]> => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch visits.");
  }

  const result: ApiResponse<Visit[]> = await response.json();

  return result.data;
};

export const getVisitsByPatientId = async (
  patientId: string,
): Promise<Visit[]> => {
  const response = await fetch(
    `${API_URL}/patient/${patientId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch patient visits.");
  }

  const result: ApiResponse<Visit[]> = await response.json();

  return result.data;
};

export const getVisitById = async (
  id: string,
): Promise<Visit> => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Visit not found.");
    }

    throw new Error("Failed to fetch visit.");
  }

  const result: ApiResponse<Visit> = await response.json();

  return result.data;
};

export const createVisit = async (
  data: CreateVisitInput,
): Promise<Visit> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);

    throw new Error(
      errorResult?.message || "Failed to create visit.",
    );
  }

  const result: ApiResponse<Visit> = await response.json();

  return result.data;
};

export const updateVisit = async (
  id: string,
  data: Partial<CreateVisitInput>,
): Promise<Visit> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);

    throw new Error(
      errorResult?.message || "Failed to update visit.",
    );
  }

  const result: ApiResponse<Visit> = await response.json();

  return result.data;
};

export const deleteVisit = async (
  id: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);

    throw new Error(
      errorResult?.message || "Failed to delete visit.",
    );
  }
};