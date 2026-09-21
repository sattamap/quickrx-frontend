import type {
  CreatePatientInput,
  Patient,
} from "../types/patient";

const API_URL = "http://localhost:5000/api/patients";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getPatients = async (): Promise<Patient[]> => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch patients.");
  }

  const result: ApiResponse<Patient[]> = await response.json();

  return result.data;
};

export const getPatientById = async (
  id: string,
): Promise<Patient> => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Patient not found.");
    }

    throw new Error("Failed to fetch patient.");
  }

  const result: ApiResponse<Patient> = await response.json();

  return result.data;
};

export const createPatient = async (
  data: CreatePatientInput,
): Promise<Patient> => {
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
      errorResult?.message || "Failed to create patient.",
    );
  }

  const result: ApiResponse<Patient> = await response.json();

  return result.data;
};

export const updatePatient = async (
  id: string,
  data: Partial<CreatePatientInput>,
): Promise<Patient> => {
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
      errorResult?.message || "Failed to update patient.",
    );
  }

  const result: ApiResponse<Patient> = await response.json();

  return result.data;
};

export const deletePatient = async (
  id: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);

    throw new Error(
      errorResult?.message || "Failed to delete patient.",
    );
  }
};