
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getPatients } from "../services/patientApi";
import { getVisits } from "../services/visitApi";
import { getPrescriptions } from "../services/prescriptionApi";
import { useAsyncData } from "../hooks/useAsyncData";

type DateFilter = "all" | "today" | "7days" | "30days";

// Convert a date or ISO timestamp into a local YYYY-MM-DD key.
function getLocalDateKey(
  value: string | Date | null | undefined,
): string | null {
  if (!value) return null;

  let date: Date;

  // Handle date-only strings without UTC timezone conversion.
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Display dates in dd/mm/yy format.
function formatDate(
  value: string | Date | null | undefined,
): string {
  const dateKey = getLocalDateKey(value);

  if (!dateKey) return "—";

  const [year, month, day] = dateKey.split("-");

  return `${day}/${month}/${year.slice(-2)}`;
}

function Prescription() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [selectedDate, setSelectedDate] = useState("");

  const { data, isLoading, error } = useAsyncData(async () => {
    const [prescriptions, patients, visits] = await Promise.all([
      getPrescriptions(),
      getPatients(),
      getVisits(),
    ]);

    return { prescriptions, patients, visits };
  }, []);

  const filteredPrescriptions = useMemo(() => {
    if (!data) return [];

    const search = searchTerm.trim().toLowerCase();

    const today = new Date();
    const todayKey = getLocalDateKey(today);

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const daysAgo = dateFilter === "7days" ? 7 : 30;

    const startDate = new Date(todayDate);
    startDate.setDate(startDate.getDate() - (daysAgo - 1));

    const startDateKey = getLocalDateKey(startDate);

    return data.prescriptions.filter((prescription) => {
      // Find the associated patient.
      const patient = data.patients.find(
        (currentPatient) =>
          currentPatient.id === prescription.patientId,
      );

      // Search by patient name or patient ID.
      const matchesSearch =
        !search ||
        patient?.name?.toLowerCase().includes(search) ||
        patient?.patientId?.toLowerCase().includes(search);

      if (!matchesSearch) return false;

      // Get prescription date in a consistent format.
      const prescriptionDateKey = getLocalDateKey(
        prescription.prescriptionDate,
      );

      if (!prescriptionDateKey) return false;

      // Exact date search takes priority over quick filters.
      if (selectedDate) {
        return prescriptionDateKey === selectedDate;
      }

      // Show all prescriptions.
      if (dateFilter === "all") return true;

      // Today's prescriptions.
      if (dateFilter === "today") {
        return prescriptionDateKey === todayKey;
      }

      // Last 7 or 30 days, including today.
      // Future-dated prescriptions are excluded.
      return (
        prescriptionDateKey >= (startDateKey ?? "") &&
        prescriptionDateKey <= (todayKey ?? "")
      );
    });
  }, [searchTerm, dateFilter, selectedDate, data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Prescriptions
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage patient prescriptions.
        </p>
      </div>

      {/* Filters */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          {/* Patient Search */}
          <div>
            <label
              htmlFor="prescription-search"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Search Prescriptions
            </label>

            <input
              id="prescription-search"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by patient name or patient ID..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Date Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="prescription-date-filter"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Quick Filter
              </label>

              <select
                id="prescription-date-filter"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value as DateFilter)
                }
                className="w-full min-w-[170px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All prescriptions</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="prescription-specific-date"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Specific Date
              </label>

              <input
                id="prescription-specific-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Active Filter Summary */}
        {(searchTerm || dateFilter !== "all" || selectedDate) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">
              Showing {filteredPrescriptions.length}{" "}
              {filteredPrescriptions.length === 1
                ? "prescription"
                : "prescriptions"}
            </span>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setDateFilter("all");
                setSelectedDate("");
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Prescription List */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Prescription History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isLoading
              ? "Loading..."
              : `${filteredPrescriptions.length} ${
                  filteredPrescriptions.length === 1
                    ? "prescription"
                    : "prescriptions"
                }`}
          </p>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            Loading prescriptions...
          </div>
        ) : error ? (
          <div className="px-5 py-12 text-center text-sm text-red-600">
            {error}
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
              Rx
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              No prescriptions found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || dateFilter !== "all" || selectedDate
                ? "Try changing your search or date filter."
                : "Saved prescriptions will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Patient
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Patient ID
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Prescription Date
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Visit Date
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Medicines
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPrescriptions.map((prescription) => {
                  const patient = data?.patients.find(
                    (currentPatient) =>
                      currentPatient.id === prescription.patientId,
                  );

                  const visit = data?.visits.find(
                    (currentVisit) =>
                      currentVisit.id === prescription.visitId,
                  );

                  return (
                    <tr
                      key={prescription.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      {/* Patient */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {patient?.name ?? "Unknown Patient"}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          {patient?.gender
                            ? patient.gender.charAt(0).toUpperCase() +
                              patient.gender.slice(1)
                            : ""}
                          {patient?.age ? ` • ${patient.age} years` : ""}
                        </p>
                      </td>

                      {/* Patient ID */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {patient?.patientId ?? "—"}
                      </td>

                      {/* Prescription Date */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatDate(prescription.prescriptionDate)}
                      </td>

                      {/* Visit Date */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {formatDate(visit?.visitDate)}
                      </td>

                      {/* Medicine Count */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {prescription.medicines.length}{" "}
                        {prescription.medicines.length === 1
                          ? "medicine"
                          : "medicines"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/patients/${prescription.patientId}/visits/${prescription.visitId}/prescription/preview`,
                              )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/patients/${prescription.patientId}/visits/${prescription.visitId}/prescription`,
                              )
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Prescription;
