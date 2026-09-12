import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { initialPatients } from "../data/patients";
import { getPrescriptions } from "../utils/prescriptionStorage";
import { getVisits } from "../utils/visitStorage";

type DateFilter = "all" | "today" | "7days" | "30days";

function Prescription() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] =
    useState<DateFilter>("all");

  const prescriptions = getPrescriptions();
  const visits = getVisits();

  const filteredPrescriptions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const today = new Date();

    return prescriptions.filter((prescription) => {
      /*
       * Search filter
       */
      const patient = initialPatients.find(
        (currentPatient) =>
          currentPatient.id === prescription.patientId,
      );

      const matchesSearch =
        !search ||
        patient?.name.toLowerCase().includes(search) ||
        patient?.patientId.toLowerCase().includes(search);

      if (!matchesSearch) {
        return false;
      }

      /*
       * Date filter
       */
      if (dateFilter === "all") {
        return true;
      }

      const prescriptionDate = new Date(
        `${prescription.prescriptionDate}T00:00:00`,
      );

      if (Number.isNaN(prescriptionDate.getTime())) {
        return false;
      }

      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      if (dateFilter === "today") {
        return (
          prescriptionDate.getTime() ===
          todayDate.getTime()
        );
      }

      const daysAgo =
        dateFilter === "7days" ? 7 : 30;

      const startDate = new Date(todayDate);

      startDate.setDate(
        startDate.getDate() - (daysAgo - 1),
      );

      return prescriptionDate >= startDate;
    });
  }, [searchTerm, dateFilter, prescriptions]);

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
          {/* Search */}
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
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search by patient name or patient ID..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Date Filter */}
          <div>
            <label
              htmlFor="prescription-date-filter"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Date
            </label>

            <select
              id="prescription-date-filter"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(
                  event.target.value as DateFilter,
                )
              }
              className="w-full min-w-[180px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All prescriptions</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>
          </div>
        </div>

        {/* Active Filter Summary */}
        {(searchTerm || dateFilter !== "all") && (
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
            {filteredPrescriptions.length}{" "}
            {filteredPrescriptions.length === 1
              ? "prescription"
              : "prescriptions"}
          </p>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
              Rx
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              No prescriptions found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || dateFilter !== "all"
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
                  const patient = initialPatients.find(
                    (currentPatient) =>
                      currentPatient.id ===
                      prescription.patientId,
                  );

                  const visit = visits.find(
                    (currentVisit) =>
                      currentVisit.id ===
                      prescription.visitId,
                  );

                  return (
                    <tr
                      key={prescription.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      {/* Patient */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {patient?.name ??
                            "Unknown Patient"}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          {patient?.gender
                            ? patient.gender
                                .charAt(0)
                                .toUpperCase() +
                              patient.gender.slice(1)
                            : ""}
                          {patient?.age
                            ? ` • ${patient.age} years`
                            : ""}
                        </p>
                      </td>

                      {/* Patient ID */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {patient?.patientId ?? "—"}
                      </td>

                      {/* Prescription Date */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {prescription.prescriptionDate}
                      </td>

                      {/* Visit Date */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {visit?.visitDate ?? "—"}
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