import type { Visit } from "../types/visit";
import { initialVisits } from "../data/visits";

const VISITS_STORAGE_KEY = "quickrx_visits";

export function getVisits(): Visit[] {
  try {
    const storedVisits = localStorage.getItem(VISITS_STORAGE_KEY);

    if (!storedVisits) {
      return initialVisits;
    }

    return JSON.parse(storedVisits) as Visit[];
  } catch (error) {
    console.error("Failed to load visits:", error);
    return initialVisits;
  }
}

export function saveVisit(visit: Visit): void {
  try {
    const existingVisits = getVisits();

    const updatedVisits = [...existingVisits, visit];

    localStorage.setItem(
      VISITS_STORAGE_KEY,
      JSON.stringify(updatedVisits)
    );
  } catch (error) {
    console.error("Failed to save visit:", error);

    throw new Error("Unable to save visit.", {
      cause: error,
    });
  }
}