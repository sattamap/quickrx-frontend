import type { CreatePatientInput, Patient } from "../types/patient";
import { getStoredPatients, setStoredPatients } from "../utils/patientStorage";
//import { delay } from "./patientApi";

/*
 * Generates the next PAT-xxx code from the highest existing number,
 * so deleting a patient cannot cause a duplicate ID later.
 */
function generatePatientCode(patients: Patient[]): string {
  const highest = patients.reduce((max, patient) => {
    const match = patient.patientId.match(/^PAT-(\d+)$/);

    if (!match) {
      return max;
    }

    return Math.max(max, Number(match[1]));
  }, 0);

  return `PAT-${String(highest + 1).padStart(3, "0")}`;
}

export async function getPatients(): Promise<Patient[]> {
  //await delay();

  // Later: return request<Patient[]>("/patients");
  return getStoredPatients();
}

export async function getPatientById(
  id: string,
): Promise<Patient | undefined> {
  //await delay();

  // Later: return request<Patient>(`/patients/${id}`);
  return getStoredPatients().find((patient) => patient.id === id);
}

export async function createPatient(
  input: CreatePatientInput,
): Promise<Patient> {
 // await delay();

  const patients = getStoredPatients();

  const newPatient: Patient = {
    ...input,
    id: crypto.randomUUID(),
    patientId: input.patientId?.trim() || generatePatientCode(patients),
    createdAt: new Date().toISOString(),
  };

  setStoredPatients([...patients, newPatient]);

  // Later: return request<Patient>("/patients", {
  //   method: "POST",
  //   body: JSON.stringify(input),
  // });
  return newPatient;
}

export async function updatePatient(patient: Patient): Promise<Patient> {
  //await delay();

  const patients = getStoredPatients();

  const exists = patients.some((current) => current.id === patient.id);

  if (!exists) {
    throw new Error("Patient not found.");
  }

  setStoredPatients(
    patients.map((current) => (current.id === patient.id ? patient : current)),
  );

  return patient;
}

export async function deletePatient(id: string): Promise<void> {
  //await delay();

  const patients = getStoredPatients();

  setStoredPatients(patients.filter((patient) => patient.id !== id));
}