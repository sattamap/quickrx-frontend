
import type { CreatePatientInput, Patient } from "../types/patient";
import * as patientApi from "./patientApi";

export async function getPatients(): Promise<Patient[]> {
  return patientApi.getPatients();
}

export async function getPatientById(id: string): Promise<Patient> {
  return patientApi.getPatientById(id);
}

export async function createPatient(
  input: CreatePatientInput,
): Promise<Patient> {
  return patientApi.createPatient(input);
}

export async function updatePatient(
  id: string,
  input: Partial<CreatePatientInput>,
): Promise<Patient> {
  return patientApi.updatePatient(id, input);
}

export async function deletePatient(id: string): Promise<void> {
  return patientApi.deletePatient(id);
}
