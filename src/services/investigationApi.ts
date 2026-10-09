import { apiRequest } from "./apiClient";

/**
 * Investigation eye.
 *
 * OD = Right eye
 * OS = Left eye
 * OU = Both eyes
 * NA = Not applicable
 */
export type InvestigationEye =
  | "OD"
  | "OS"
  | "OU"
  | "NA";

/**
 * Investigation status.
 */
export type InvestigationStatus =
  | "ordered"
  | "completed"
  | "reviewed"
  | "cancelled";

/**
 * Investigation record returned by the backend.
 *
 * MongoDB returns the document ID as `_id`.
 */
export interface Investigation {
  _id: string;
  patientId: string;
  orderedVisitId: string;
  resultVisitId?: string;

  testName: string;
  eye: InvestigationEye;

  orderedDate: string;
  testDate?: string;

  result: string;
  notes: string;

  status: InvestigationStatus;

  reviewedAt?: string;

  createdAt: string;
  updatedAt: string;
}

/**
 * Create investigation payload.
 */
export interface CreateInvestigationInput {
  patientId: string;
  orderedVisitId: string;

  resultVisitId?: string;

  testName: string;
  eye: InvestigationEye;

  orderedDate: string;
  testDate?: string;

  result?: string;
  notes?: string;

  status?: InvestigationStatus;

  reviewedAt?: string;
}

/**
 * Update investigation payload.
 */
export interface UpdateInvestigationInput {
  patientId?: string;
  orderedVisitId?: string;

  resultVisitId?: string;

  testName?: string;
  eye?: InvestigationEye;

  orderedDate?: string;
  testDate?: string;

  result?: string;
  notes?: string;

  status?: InvestigationStatus;

  reviewedAt?: string;
}

/**
 * Add investigation result payload.
 */
export interface AddInvestigationResultInput {
  result: string;
  testDate: string;
  resultVisitId: string;
  notes?: string;
}

/**
 * Create a new investigation.
 *
 * POST /api/investigations
 */
export const createInvestigation = async (
  data: CreateInvestigationInput,
): Promise<Investigation> => {
  return apiRequest<Investigation>(
    "/investigations",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};

/**
 * Get all investigations for a patient.
 *
 * GET /api/investigations/patient/:patientId
 */
export const getPatientInvestigations = async (
  patientId: string,
): Promise<Investigation[]> => {
  return apiRequest<Investigation[]>(
    `/investigations/patient/${patientId}`,
    {
      method: "GET",
    },
  );
};

/**
 * Get pending investigations for a patient.
 *
 * GET /api/investigations/patient/:patientId/pending
 */
export const getPendingInvestigations = async (
  patientId: string,
): Promise<Investigation[]> => {
  return apiRequest<Investigation[]>(
    `/investigations/patient/${patientId}/pending`,
    {
      method: "GET",
    },
  );
};

/**
 * Get one investigation.
 *
 * GET /api/investigations/:id
 */
export const getInvestigation = async (
  investigationId: string,
): Promise<Investigation> => {
  return apiRequest<Investigation>(
    `/investigations/${investigationId}`,
    {
      method: "GET",
    },
  );
};

/**
 * Update an investigation.
 *
 * PATCH /api/investigations/:id
 */
export const updateInvestigation = async (
  investigationId: string,
  data: UpdateInvestigationInput,
): Promise<Investigation> => {
  return apiRequest<Investigation>(
    `/investigations/${investigationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
};

/**
 * Add a result to an investigation.
 *
 * PATCH /api/investigations/:id/result
 */
export const addInvestigationResult = async (
  investigationId: string,
  data: AddInvestigationResultInput,
): Promise<Investigation> => {
  return apiRequest<Investigation>(
    `/investigations/${investigationId}/result`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
};

/**
 * Mark an investigation as reviewed.
 *
 * PATCH /api/investigations/:id/review
 */
export const reviewInvestigation = async (
  investigationId: string,
): Promise<Investigation> => {
  return apiRequest<Investigation>(
    `/investigations/${investigationId}/review`,
    {
      method: "PATCH",
    },
  );
};

/**
 * Cancel an investigation.
 *
 * PATCH /api/investigations/:id/cancel
 */
export const cancelInvestigation = async (
  investigationId: string,
): Promise<Investigation> => {
  return apiRequest<Investigation>(
    `/investigations/${investigationId}/cancel`,
    {
      method: "PATCH",
    },
  );
};