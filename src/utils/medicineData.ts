import medicineData from "../assets/medicine.json";

export interface Medicine {
  id: number;
  generic: string;
  name: string;
  company: string;
  strength: string;
  price: number | null;
}

const medicines = medicineData as Medicine[];

export function searchMedicines(query: string, limit = 20): Medicine[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored: { medicine: Medicine; score: number }[] = [];

  for (const med of medicines) {
    const nameLower = med.name.toLowerCase();
    const genericLower = med.generic.toLowerCase();

    let score = -1;
    if (nameLower === q) score = 0;
    else if (nameLower.startsWith(q)) score = 1;
    else if (nameLower.includes(q)) score = 2;
    else if (genericLower === q) score = 3;
    else if (genericLower.startsWith(q)) score = 4;
    else if (genericLower.includes(q)) score = 5;

    if (score !== -1) {
      scored.push({ medicine: med, score });
    }
  }

  scored.sort(
    (a, b) =>
      a.score - b.score || a.medicine.name.localeCompare(b.medicine.name),
  );

  return scored.slice(0, limit).map((s) => s.medicine);
}

export default medicines;
