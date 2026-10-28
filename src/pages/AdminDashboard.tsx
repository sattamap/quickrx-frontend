import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCallback, useEffect, useState } from "react";

import {
  getDoctors,
  updateDoctorApproval,
  updateDoctorActiveStatus,
  createSyncJob,
  getLatestSyncJob,
  type AdminDoctor,
  type DoctorApprovalStatus,
  type SyncJobStatus,
} from "../services/adminApi";

import {
  createReceptionist,
  type CreateReceptionistInput,
} from "../services/receptionistApi";

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
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<AdminDoctor[]>([]);
  const [filter, setFilter] = useState<DoctorApprovalStatus | "all">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [busyDoctorId, setBusyDoctorId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [receptionistForm, setReceptionistForm] =
    useState<CreateReceptionistInput>({
      name: "",
      email: "",
      password: "",
    });

  const [isCreatingReceptionist, setIsCreatingReceptionist] = useState(false);
  const [syncJob, setSyncJob] = useState<SyncJobStatus | null>(null);
  const [isSyncLoading, setIsSyncLoading] = useState(false);
  const [isCreatingSyncJob, setIsCreatingSyncJob] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [syncNotice, setSyncNotice] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

  const handleCreateReceptionist = async () => {
    setError("");
    setNotice("");

    setIsCreatingReceptionist(true);

    try {
      const receptionist = await createReceptionist({
        name: receptionistForm.name.trim(),
        email: receptionistForm.email.trim(),
        password: receptionistForm.password,
      });

      setNotice(`Receptionist account created for ${receptionist.name}.`);

      setReceptionistForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create receptionist account.",
      );
    } finally {
      setIsCreatingReceptionist(false);
    }
  };

  const loadLatestSyncJob = useCallback(async () => {
    setIsSyncLoading(true);
    setSyncError("");

    try {
      const response = await getLatestSyncJob();
      setSyncJob(response.job);
    } catch (err) {
      setSyncError(
        err instanceof Error
          ? err.message
          : "Could not load synchronization status.",
      );
    } finally {
      setIsSyncLoading(false);
    }
  }, []);

  const handleCreateSyncJob = async () => {
    const confirmed = window.confirm(
      "Create a synchronization job to prepare an Atlas backup in a separate local staging database? This will not replace quickrx_archive.",
    );

    if (!confirmed) return;

    setIsCreatingSyncJob(true);
    setSyncError("");
    setSyncNotice("");

    try {
      const response = await createSyncJob();

      if (!response?.job?.id) {
        throw new Error("The API did not return a valid synchronization job.");
      }

      setSyncJob({
        ...response.job,
        result: null,
        errorMessage: null,
      });

      setSyncNotice("Synchronization job created.");
    } catch (err) {
      setSyncError(
        err instanceof Error
          ? err.message
          : "Could not create synchronization job.",
      );
    } finally {
      setIsCreatingSyncJob(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              QuickRx Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Doctor Management
            </h1>

            <p className="mt-2 text-slate-600">
              Review registrations and manage doctor account access.
            </p>

            {user && (
              <p className="mt-2 text-sm text-slate-500">
                Signed in as {user.name}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Logout
          </button>
        </header>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Create Receptionist Account
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create login credentials for an authorized receptionist.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreateReceptionist();
            }}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="receptionist-name"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <input
                id="receptionist-name"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                value={receptionistForm.name}
                onChange={(event) =>
                  setReceptionistForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                disabled={isCreatingReceptionist}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Receptionist's name"
              />
            </div>

            <div>
              <label
                htmlFor="receptionist-email"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="receptionist-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={receptionistForm.email}
                onChange={(event) =>
                  setReceptionistForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                disabled={isCreatingReceptionist}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="receptionist@example.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="receptionist-password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Temporary password
              </label>
              <input
                id="receptionist-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
                value={receptionistForm.password}
                onChange={(event) =>
                  setReceptionistForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                disabled={isCreatingReceptionist}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="At least 12 characters"
              />
              <p className="mt-1 text-xs text-slate-500">
                Use a unique password and share it securely with the
                receptionist.
              </p>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={
                  isCreatingReceptionist ||
                  !receptionistForm.name.trim() ||
                  !receptionistForm.email.trim() ||
                  receptionistForm.password.length < 12
                }
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreatingReceptionist
                  ? "Creating account..."
                  : "Create Receptionist"}
              </button>
            </div>
          </form>
        </section>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Database Synchronization
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Prepare an Atlas backup in a separate local staging database.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void loadLatestSyncJob()}
                disabled={isSyncLoading || isCreatingSyncJob}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Refresh Status
              </button>

              <button
                type="button"
                onClick={() => void handleCreateSyncJob()}
                disabled={
                  isCreatingSyncJob ||
                  syncJob?.status === "pending" ||
                  syncJob?.status === "running"
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreatingSyncJob ? "Creating Job..." : "Prepare Staging"}
              </button>
            </div>
          </div>

          {syncError && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {syncError}
            </p>
          )}

          {syncNotice && (
            <p
              role="status"
              className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
            >
              {syncNotice}
            </p>
          )}

          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">
              Latest job status
            </p>

            {syncJob ? (
              <>
                <p className="mt-2 text-sm text-slate-600">
                  Status:{" "}
                  <span className="font-semibold capitalize">
                    {syncJob.status}
                  </span>
                </p>
                <p className="mt-1 break-all text-xs text-slate-500">
                  Job ID: {syncJob.id}
                </p>

                {syncJob.result && (
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p>Collections: {syncJob.result.collections ?? "—"}</p>
                    <p>Documents: {syncJob.result.documents ?? "—"}</p>
                    <p>
                      Prepared database:{" "}
                      {syncJob.result.preparedDatabase ?? "—"}
                    </p>
                  </div>
                )}

                {syncJob.errorMessage && (
                  <p className="mt-3 text-sm text-red-700">
                    {syncJob.errorMessage}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No synchronization job found.
              </p>
            )}
          </div>
        </section>

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
