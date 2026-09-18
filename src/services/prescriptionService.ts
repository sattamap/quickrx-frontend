import type {
  CreatePrescriptionInput,
  Prescription,
} from "../types/prescription";
import {
  getPrescriptionByVisitId as getStoredPrescriptionByVisitId,
  getPrescriptions as getStoredPrescriptions,
  savePrescription,
  updatePrescription as updateStoredPrescription,
} from "../utils/prescriptionStorage";
import { delay } from "./api";

export async function getPrescriptions(): Promise<Prescription[]> {
  await delay();

  // Later: return request<Prescription[]>("/prescriptions");
  return getStoredPrescriptions();
}

export async function getPrescriptionByVisitId(
  visitId: string,
): Promise<Prescription | undefined> {
  await delay();

  // Later: return request<Prescription>(`/visits/${visitId}/prescription`);
  return getStoredPrescriptionByVisitId(visitId);
}

export async function createPrescription(
  input: CreatePrescriptionInput,
): Promise<Prescription> {
  await delay();

  const newPrescription: Prescription = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  savePrescription(newPrescription);

  // Later: return request<Prescription>("/prescriptions", {
  //   method: "POST",
  //   body: JSON.stringify(input),
  // });
  return newPrescription;
}

export async function updatePrescription(
  prescription: Prescription,
): Promise<Prescription> {
  await delay();

  updateStoredPrescription(prescription);

  // Later: return request<Prescription>(`/prescriptions/${prescription.id}`, {
  //   method: "PUT",
  //   body: JSON.stringify(prescription),
  // });
  return prescription;
}

/*
 * Convenience wrapper — the builder page does not care whether this is
 * a create or an update, only that the prescription ends up saved.
 */
export async function savePrescriptionRecord(
  prescription: Prescription,
  isExisting: boolean,
): Promise<Prescription> {
  if (isExisting) {
    return updatePrescription(prescription);
  }

  return createPrescription(prescription);
}