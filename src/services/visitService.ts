
import type { CreateVisitInput, Visit } from "../types/visit";
import * as visitApi from "./visitApi";

export async function getVisits(): Promise<Visit[]> {
  return visitApi.getVisits();
}

export async function getVisitsByPatientId(
  patientId: string,
): Promise<Visit[]> {
  return visitApi.getVisitsByPatientId(patientId);
}

export async function getVisitById(
  id: string,
): Promise<Visit> {
  return visitApi.getVisitById(id);
}

export async function getVisitForPatient(
  patientId: string,
  visitId: string,
): Promise<Visit | undefined> {
  const visits = await visitApi.getVisitsByPatientId(patientId);

  return visits.find((visit) => visit.id === visitId);
}

export async function createVisit(
  input: CreateVisitInput,
): Promise<Visit> {
  return visitApi.createVisit(input);
}
