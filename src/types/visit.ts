export interface VisualAcuity {
  unaided: string;
  aided: string;
}

export interface Refraction {
  sph: string;
  cyl: string;
  axis: string;
  visualAcuity: string;
}

export interface EyeExamination {
  visualAcuity: {
    right: VisualAcuity;
    left: VisualAcuity;
  };

  refraction: {
    right: Refraction;
    left: Refraction;
  };

  iop: {
    right: string;
    left: string;
  };

  anteriorSegment: {
    right: string;
    left: string;
  };

  fundus: {
    right: string;
    left: string;
  };
}

export interface Visit {
  id: string;
  patientId: string;
  ageAtVisit: number;
  visitDate: string;
  chiefComplaint: string;
  examination: EyeExamination;
  diagnosis: string;
  clinicalNotes: string;
  createdAt: string;
}

export type CreateVisitInput = Omit<
  Visit,
  "id" | "createdAt"
>;