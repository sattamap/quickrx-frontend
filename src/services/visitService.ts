import type { CreateVisitInput, Visit } from "../types/visit";
import { getVisits as getStoredVisits, saveVisit } from "../utils/visitStorage";
//import { delay } from "./patientApi";

export async function getVisits(): Promise<Visit[]> {
  //await delay();

  // Later: return request<Visit[]>("/visits");
  return getStoredVisits();
}

export async function getVisitsByPatientId(
  patientId: string,
): Promise<Visit[]> {
 // await delay();

  // Later: return request<Visit[]>(`/patients/${patientId}/visits`);
  return getStoredVisits()
    .filter((visit) => visit.patientId === patientId)
    .sort(
      (a, b) =>
        new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(),
    );
}

export async function getVisitById(id: string): Promise<Visit | undefined> {
 // await delay();

  // Later: return request<Visit>(`/visits/${id}`);
  return getStoredVisits().find((visit) => visit.id === id);
}

/*
 * Looks up a visit and confirms it belongs to the given patient.
 * Several pages need exactly this pair, so it lives here rather than
 * being re-derived in each component.
 */
export async function getVisitForPatient(
  patientId: string,
  visitId: string,
): Promise<Visit | undefined> {
 // await delay();

  return getStoredVisits().find(
    (visit) => visit.id === visitId && visit.patientId === patientId,
  );
}

export async function createVisit(input: CreateVisitInput): Promise<Visit> {
 // await delay();

  const newVisit: Visit = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  saveVisit(newVisit);

  // Later: return request<Visit>("/visits", {
  //   method: "POST",
  //   body: JSON.stringify(input),
  // });
  return newVisit;
}