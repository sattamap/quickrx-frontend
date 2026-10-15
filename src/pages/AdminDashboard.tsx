import { useCallback, useEffect, useState } from "react";

import {
  getDoctors,
  updateDoctorApproval,
  updateDoctorActiveStatus,
  type AdminDoctor,
  type DoctorApprovalStatus,
} from "../services/adminApi";

const filters: Array<{
  label: string;
  value: DoctorApprovalStatus | "all";
}> = [
  { label: "All Doctors", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [filter, setFilter] = useState<DoctorApprovalStatus | "all">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [busyDoctorId, setBusyDoctorId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDoctors = useCallback(async () => {
    try {
      setError("");
      const result = await getDoctors(filter === "all" ? undefined : filter);
      setDoctors(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load doctors.");
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let cancelled = false;

    const fetchDoctors = async () => {
      try {
        const result = await getDoctors(filter === "all" ? undefined : filter);

        if (!cancelled) {
          setDoctors(result);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load doctors.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchDoctors();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const handleApproval = async (
    doctor: AdminDoctor,
    approvalStatus: "approved" | "rejected",
  ) => {
    const action = approvalStatus === "approved" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} ${doctor.name}?`)) {
      return;
    }

    setBusyDoctorId(doctor._id);
    setError("");
    setNotice("");

    try {
      await updateDoctorApproval(doctor._id, approvalStatus);
      setNotice(`${doctor.name} was ${approvalStatus}.`);
      await loadDoctors();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update approval.",
      );
    } finally {
      setBusyDoctorId(null);
    }
  };

  const handleActiveStatus = async (doctor: AdminDoctor) => {
    const nextStatus = !doctor.isActive;
    const action = nextStatus ? "activate" : "deactivate";

    if (!window.confirm(`Are you sure you want to ${action} ${doctor.name}?`)) {
      return;
    }

    setBusyDoctorId(doctor._id);
    setError("");
    setNotice("");

    try {
      await updateDoctorActiveStatus(doctor._id, nextStatus);
      setNotice(
        `${doctor.name} was ${nextStatus ? "activated" : "deactivated"}.`,
      );
      await loadDoctors();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update account status.",
      );
    } finally {
      setBusyDoctorId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            QuickRx Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Doctor Management
          </h1>
          <p className="mt-2 text-slate-600">
            Review registrations and manage doctor account access.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Registered Doctors
            </h2>

            <button
              type="button"
              onClick={() => void loadDoctors()}
              disabled={isLoading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === item.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {notice && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
            >
              {notice}
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="py-10 text-center text-slate-500">
              Loading doctors...
            </p>
          ) : doctors.length === 0 ? (
            <p className="py-10 text-center text-slate-500">
              No doctors found for this filter.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Doctor</th>
                    <th className="px-4 py-3 font-semibold">Registered</th>
                    <th className="px-4 py-3 font-semibold">Approval</th>
                    <th className="px-4 py-3 font-semibold">Account</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {doctors.map((doctor) => (
                    <tr key={doctor._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">
                          {doctor.name}
                        </p>
                        <p className="mt-1 text-slate-500">{doctor.email}</p>
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {new Date(doctor.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                          {doctor.approvalStatus}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            doctor.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {doctor.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {doctor.approvalStatus === "pending" && (
                            <>
                              <button
                                type="button"
                                disabled={busyDoctorId === doctor._id}
                                onClick={() =>
                                  void handleApproval(doctor, "approved")
                                }
                                className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                Approve
                              </button>

                              <button
                                type="button"
                                disabled={busyDoctorId === doctor._id}
                                onClick={() =>
                                  void handleApproval(doctor, "rejected")
                                }
                                className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {doctor.approvalStatus === "approved" && (
                            <button
                              type="button"
                              disabled={busyDoctorId === doctor._id}
                              onClick={() => void handleActiveStatus(doctor)}
                              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                            >
                              {doctor.isActive ? "Deactivate" : "Activate"}
                            </button>
                          )}

                          {doctor.approvalStatus === "rejected" && (
                            <button
                              type="button"
                              disabled={busyDoctorId === doctor._id}
                              onClick={() =>
                                void handleApproval(doctor, "approved")
                              }
                              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminDashboard;
