import { apiRequest } from "./apiClient";

export type DoctorApprovalStatus = "pending" | "approved" | "rejected";

export interface AdminDoctor {
  _id: string;
  name: string;
  email: string;
  approvalStatus: DoctorApprovalStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getDoctors = async (
  status?: DoctorApprovalStatus,
): Promise<AdminDoctor[]> => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  return apiRequest<AdminDoctor[]>(`/admin/doctors${query}`);
};

export const updateDoctorApproval = async (
  id: string,
  approvalStatus: "approved" | "rejected",
): Promise<AdminDoctor> => {
  return apiRequest<AdminDoctor>(
    `/admin/doctors/${encodeURIComponent(id)}/approval`,
    {
      method: "PATCH",
      body: JSON.stringify({ approvalStatus }),
    },
  );
};

export const updateDoctorActiveStatus = async (
  id: string,
  isActive: boolean,
): Promise<AdminDoctor> => {
  return apiRequest<AdminDoctor>(
    `/admin/doctors/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    },
  );
};
//Add synchronization API functions

export interface SyncJobResult {
  collections: number | null;
  documents: number | null;
  preparedDatabase: string | null;
}

export interface SyncJobStatus {
  id: string;
  status: "pending" | "running" | "succeeded" | "failed";
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  result?: SyncJobResult | null;
  errorMessage?: string | null;
}

interface SyncJobResponse {
  success: boolean;
  job: SyncJobStatus | null;
}

export async function createSyncJob(): Promise<{
  success: boolean;
  job: Pick<SyncJobStatus, "id" | "status" | "createdAt">;
}> {
  return apiRequest("/admin/sync-jobs", {
    method: "POST",
  });
}

export async function getLatestSyncJob(): Promise<SyncJobResponse> {
  return apiRequest("/admin/sync-jobs/latest", {
    method: "GET",
  });
}
