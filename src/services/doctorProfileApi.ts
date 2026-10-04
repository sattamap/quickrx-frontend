import { apiRequest } from "./apiClient";
import type { DoctorProfile } from "../types/doctorProfile";

const API_URL = "/doctor-profile";

export const getDoctorProfile = async (): Promise<DoctorProfile> => {
  return apiRequest<DoctorProfile>(API_URL);
};

export const updateDoctorProfile = async (
  data: DoctorProfile,
): Promise<DoctorProfile> => {
  return apiRequest<DoctorProfile>(API_URL, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};