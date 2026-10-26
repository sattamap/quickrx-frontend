export interface PrescriptionSettings {
  defaultAdvice: string;
  defaultFollowUp: string;

  showDoctorPhone: boolean;
  showDoctorEmail: boolean;
  showRegistrationNumber: boolean;
  showClinicAddress: boolean;

  showPatientId: boolean;
  showDiagnosis: boolean;
  showSpectaclePrescription: boolean;
  showSignature: boolean;

    // Prescription footer
  showChamberFooter: boolean;
  footerHeading: string;
  visitingHours: string;
  serialBookingPhone: string;
  weeklyClosingDay: string;
}