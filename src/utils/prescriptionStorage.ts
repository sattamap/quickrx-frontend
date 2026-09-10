import type { Prescription } from "../types/prescription";

const PRESCRIPTIONS_STORAGE_KEY = "quickrx_prescriptions";

export function getPrescriptions(): Prescription[] {
  try {
    const storedPrescriptions = localStorage.getItem(
      PRESCRIPTIONS_STORAGE_KEY
    );

    if (!storedPrescriptions) {
      return [];
    }

    return JSON.parse(storedPrescriptions) as Prescription[];
  } catch (error) {
    console.error("Failed to load prescriptions:", error);
    return [];
  }
}

export function getPrescriptionByVisitId(
  visitId: string
): Prescription | undefined {
  const prescriptions = getPrescriptions();

  return prescriptions.find(
    (prescription) => prescription.visitId === visitId
  );
}

export function savePrescription(
  prescription: Prescription
): void {
  try {
    const existingPrescriptions = getPrescriptions();

    const updatedPrescriptions = [
      ...existingPrescriptions,
      prescription,
    ];

    localStorage.setItem(
      PRESCRIPTIONS_STORAGE_KEY,
      JSON.stringify(updatedPrescriptions)
    );
  } catch (error) {
    console.error("Failed to save prescription:", error);

    throw new Error("Unable to save prescription.", {
      cause: error,
    });
  }
}