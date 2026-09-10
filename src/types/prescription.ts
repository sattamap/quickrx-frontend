export interface PrescriptionMedicine {
  id: string;
  name: string;
  strength: string;
  form: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface SpectacleEyePrescription {
  sph: string;
  cyl: string;
  axis: string;
  visualAcuity: string;
}

export interface SpectaclePrescription {
  right: SpectacleEyePrescription;
  left: SpectacleEyePrescription;
  nearAddition: string;
  pd: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  visitId: string;
  prescriptionDate: string;

  medicines: PrescriptionMedicine[];

  spectaclePrescription: SpectaclePrescription;

  advice: string;
  followUp: string;

  createdAt: string;
}

export type CreatePrescriptionInput = Omit<
  Prescription,
  "id" | "createdAt"
>;