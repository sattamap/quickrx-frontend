
import { apiRequest } from "./apiClient";

export type DoctorApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

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
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : "";

  return apiRequest<AdminDoctor[]>(
    `/admin/doctors${query}`,
  );
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
