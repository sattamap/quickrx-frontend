
import type {
  CreatePrescriptionInput,
  Prescription,
} from "../types/prescription";
import * as prescriptionApi from "./prescriptionApi";

export async function getPrescriptions(): Promise<Prescription[]> {
  return prescriptionApi.getPrescriptions();
}

export async function getPrescriptionByVisitId(
  visitId: string,
): Promise<Prescription | undefined> {
  const prescription =
    await prescriptionApi.getPrescriptionByVisitId(visitId);

  return prescription ?? undefined;
}

export async function createPrescription(
  input: CreatePrescriptionInput,
): Promise<Prescription> {
  return prescriptionApi.createPrescription(input);
}

export async function updatePrescription(
  prescription: Prescription,
): Promise<Prescription> {
  return prescriptionApi.updatePrescription(
    prescription.id,
    prescription,
  );
}

/**
 * Save a prescription by creating or updating it.
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
