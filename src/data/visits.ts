import type { Visit } from "../types/visit";

export const initialVisits: Visit[] = [
  {
    id: "visit-1",
    patientId: "patient-1",
    visitDate: "2026-09-07",
    chiefComplaint: "Blurred vision for distance",

    examination: {
      visualAcuity: {
        right: {
          unaided: "6/18",
          aided: "6/6",
        },
        left: {
          unaided: "6/12",
          aided: "6/6",
        },
      },

      refraction: {
        right: {
          sph: "-1.50",
          cyl: "-0.50",
          axis: "180",
          visualAcuity: "6/6",
        },
        left: {
          sph: "-1.25",
          cyl: "-0.25",
          axis: "170",
          visualAcuity: "6/6",
        },
      },

      iop: {
        right: "15",
        left: "16",
      },

      anteriorSegment: {
        right: "Normal",
        left: "Normal",
      },

      fundus: {
        right: "Normal",
        left: "Normal",
      },
    },

    diagnosis: "Myopia with astigmatism",

    clinicalNotes:
      "Patient reports difficulty seeing distant objects. No other significant ocular complaints.",

    createdAt: "2026-09-07",
  },

  {
    id: "visit-2",
    patientId: "patient-2",
    visitDate: "2026-08-10",
    chiefComplaint: "Routine eye examination",

    examination: {
      visualAcuity: {
        right: {
          unaided: "6/6",
          aided: "6/6",
        },
        left: {
          unaided: "6/6",
          aided: "6/6",
        },
      },

      refraction: {
        right: {
          sph: "Plano",
          cyl: "0.00",
          axis: "0",
          visualAcuity: "6/6",
        },
        left: {
          sph: "Plano",
          cyl: "0.00",
          axis: "0",
          visualAcuity: "6/6",
        },
      },

      iop: {
        right: "14",
        left: "15",
      },

      anteriorSegment: {
        right: "Normal",
        left: "Normal",
      },

      fundus: {
        right: "Normal",
        left: "Normal",
      },
    },

    diagnosis: "Normal ocular examination",

    clinicalNotes:
      "Routine examination. No significant ocular abnormality detected.",

    createdAt: "2026-08-10",
  },
];