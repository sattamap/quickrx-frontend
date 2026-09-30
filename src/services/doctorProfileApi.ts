import type { DoctorProfile } from "../types/doctorProfile";

const API_URL = "http://localhost:5000/api/doctor-profile";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getDoctorProfile =
  async (): Promise<DoctorProfile | null> => {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load doctor profile.");
    }

    const result: ApiResponse<DoctorProfile | null> =
      await response.json();

    if (!result.success) {
      throw new Error(
        result.message ?? "Failed to load doctor profile.",
      );
    }

    return result.data;
  };

export const updateDoctorProfile = async (
  data: DoctorProfile,
): Promise<DoctorProfile> => {
  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message ?? "Failed to save doctor profile.",
    );
  }

  const result: ApiResponse<DoctorProfile> =
    await response.json();

  if (!result.success) {
    throw new Error(
      result.message ?? "Failed to save doctor profile.",
    );
  }

  return result.data;
};