import { useNavigate, useParams } from "react-router-dom";

import { initialPatients } from "../data/patients";

const mockVisits = [
  {
    id: "visit-1",
    date: "2026-09-07",
    reason: "Blurred vision",
    diagnosis: "Refractive error",
  },
  {
    id: "visit-2",
    date: "2026-08-10",
    reason: "Routine eye examination",
    diagnosis: "Myopia",
  },
];

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const patient = initialPatients.find(
    (currentPatient) => currentPatient.id === id
  );

  if (!patient) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Patients
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            Patient not found
          </h1>

          <p className="mt-1 text-sm text-red-600">
            The patient record you're looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Patients
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.name}
              </h1>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {patient.patientId}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Patient profile and clinical history
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/patients/${patient.id}/new-visit`)
            }
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Visit
          </button>
        </div>
      </div>

      {/* Patient Information */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Patient Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Full Name
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {patient.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Patient ID
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {patient.patientId}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Age
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {patient.age} years
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Date of Birth
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {patient.dateOfBirth || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Gender
              </p>

              <p className="mt-1 text-sm capitalize text-gray-700">
                {patient.gender}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Phone
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {patient.phone}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-gray-500">
                Address
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {patient.address || "Not provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Medical Summary
          </h2>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Allergies
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {patient.allergies || "None recorded"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-500">
                Notes
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {patient.notes || "No notes available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visit History */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Visit History
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Previous consultations and clinical records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">
                  Date
                </th>

                <th className="px-5 py-3 font-medium">
                  Reason for Visit
                </th>

                <th className="px-5 py-3 font-medium">
                  Diagnosis
                </th>

                <th className="px-5 py-3 font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {mockVisits.map((visit) => (
                <tr
                  key={visit.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-gray-700">
                    {visit.date}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {visit.reason}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {visit.diagnosis}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mockVisits.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="font-medium text-gray-900">
              No visits yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Start a new visit to create the patient's first
              clinical record.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDetails;