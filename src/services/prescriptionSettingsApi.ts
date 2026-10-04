import { apiRequest } from "./apiClient";
import type { PrescriptionSettings } from "../types/prescriptionSettings";

const API_URL = "/prescription-settings";

export const getPrescriptionSettings =
  async (): Promise<PrescriptionSettings> => {
    return apiRequest<PrescriptionSettings>(API_URL);
  };

export const updatePrescriptionSettings = async (
  data: PrescriptionSettings,
): Promise<PrescriptionSettings> => {
  return apiRequest<PrescriptionSettings>(API_URL, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};