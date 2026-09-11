import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { initialPatients } from "../data/patients";
import { getPrescriptions } from "../utils/prescriptionStorage";
import { getVisits } from "../utils/visitStorage";

function Prescription() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const prescriptions = getPrescriptions();
  const visits = getVisits();

  const filteredPrescriptions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return prescriptions;
    }

    return prescriptions.filter((prescription) => {
      const patient = initialPatients.find(
        (currentPatient) => currentPatient.id === prescription.patientId,
      );

      return (
        patient?.name.toLowerCase().includes(search) ||
        patient?.patientId.toLowerCase().includes(search)
      );
    });
  }, [searchTerm, prescriptions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage patient prescriptions.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
          className="w-full max-w-xl rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

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
              {searchTerm
                ? "Try a different patient name or ID."
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
                      currentPatient.id === prescription.patientId,
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
                        {prescription.prescriptionDate}
                      </td>

                      {/* Visit Date */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {visits.find(
                          (visit) => visit.id === prescription.visitId,
                        )?.visitDate ?? "—"}
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
