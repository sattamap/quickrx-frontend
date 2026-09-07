export interface Patient {
  id: string;
  patientId: string;
  name: string;

  age: number;
  dateOfBirth?: string;

  gender: "male" | "female" | "other";
  phone: string;
  address: string;
  allergies: string;
  notes: string;
  createdAt: string;
}