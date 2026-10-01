import type { PrescriptionSettings } from "../types/prescriptionSettings";

const API_URL =
  "http://localhost:5000/api/prescription-settings";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getPrescriptionSettings =
  async (): Promise<PrescriptionSettings> => {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(
        "Failed to load prescription settings.",
      );
    }

    const result: ApiResponse<PrescriptionSettings> =
      await response.json();

    if (!result.success) {
      throw new Error(
        result.message ??
          "Failed to load prescription settings.",
      );
    }

    return result.data;
  };

export const updatePrescriptionSettings =
  async (
    data: PrescriptionSettings,
  ): Promise<PrescriptionSettings> => {
    const response = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const result = await response
        .json()
        .catch(() => null);

      throw new Error(
        result?.message ??
          "Failed to save prescription settings.",
      );
    }

    const result: ApiResponse<PrescriptionSettings> =
      await response.json();

    if (!result.success) {
      throw new Error(
        result.message ??
          "Failed to save prescription settings.",
      );
    }

    return result.data;
  };