import type { Patient } from "../types/patient";
import { initialPatients } from "../data/patients";

const PATIENTS_STORAGE_KEY = "quickrx_patients";

export function getStoredPatients(): Patient[] {
  try {
    const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);

    if (!stored) {
      return initialPatients;
    }

    return JSON.parse(stored) as Patient[];
  } catch (error) {
    console.error("Failed to load patients:", error);
    return initialPatients;
  }
}

export function setStoredPatients(patients: Patient[]): void {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch (error) {
    console.error("Failed to save patients:", error);

    throw new Error("Unable to save patients.", { cause: error });
  }
}