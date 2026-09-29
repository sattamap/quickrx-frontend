import type {
  CreatePrescriptionInput,
  Prescription,
} from "../types/prescription.ts";

const API_URL = "http://localhost:5000/api/prescriptions";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getPrescriptions = async (): Promise<Prescription[]> => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch prescriptions.");
  }

  const result: ApiResponse<Prescription[]> = await response.json();

  return result.data;
};

export const getPrescriptionById = async (
  id: string,
): Promise<Prescription> => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Prescription not found.");
    }

    throw new Error("Failed to fetch prescription.");
  }

  const result: ApiResponse<Prescription> = await response.json();

  return result.data;
};

export const getPrescriptionByVisitId = async (
  visitId: string,
): Promise<Prescription | null> => {
  const response = await fetch(`${API_URL}/visit/${visitId}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      "Failed to fetch prescription for this visit.",
    );
  }

  const result: ApiResponse<Prescription> = await response.json();

  return result.data;
};

export const getPrescriptionsByPatientId = async (
  patientId: string,
): Promise<Prescription[]> => {
  const response = await fetch(
    `${API_URL}/patient/${patientId}`,
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch patient prescriptions.",
    );
  }

  const result: ApiResponse<Prescription[]> =
    await response.json();

  return result.data;
};

export const createPrescription = async (
  data: CreatePrescriptionInput,
): Promise<Prescription> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorResult = await response
      .json()
      .catch(() => null);

    throw new Error(
      errorResult?.message ||
        "Failed to create prescription.",
    );
  }

  const result: ApiResponse<Prescription> =
    await response.json();

  return result.data;
};

export const updatePrescription = async (
  id: string,
  data: Partial<CreatePrescriptionInput>,
): Promise<Prescription> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorResult = await response
      .json()
      .catch(() => null);

    throw new Error(
      errorResult?.message ||
        "Failed to update prescription.",
    );
  }

  const result: ApiResponse<Prescription> =
    await response.json();

  return result.data;
};

export const deletePrescription = async (
  id: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorResult = await response
      .json()
      .catch(() => null);

    throw new Error(
      errorResult?.message ||
        "Failed to delete prescription.",
    );
  }
};