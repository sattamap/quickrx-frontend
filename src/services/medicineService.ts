import { searchMedicines as searchLocalMedicines } from "../utils/medicineData";
import type { Medicine } from "../utils/medicineData";

export type { Medicine };

/*
 * Medicine search is the one call that stays synchronous-friendly today
 * (it reads a bundled JSON file), but it will become a network request:
 *
 *   GET /api/medicines/search?q=napa&limit=20
 *
 * Keeping it async now means the autocomplete component already handles
 * out-of-order responses and loading state correctly.
 */
export async function searchMedicines(
  query: string,
  limit = 20,
): Promise<Medicine[]> {
  // Later: return request<Medicine[]>(
  //   `/medicines/search?q=${encodeURIComponent(query)}&limit=${limit}`,
  // );
  return searchLocalMedicines(query, limit);
}