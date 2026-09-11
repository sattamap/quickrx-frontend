import { useNavigate, useParams } from "react-router-dom";

import { initialPatients } from "../data/patients";
import { getVisits } from "../utils/visitStorage";
import { getPrescriptionByVisitId } from "../utils/prescriptionStorage";

function PrescriptionPreview() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();

  const patient = initialPatients.find(
    (currentPatient) => currentPatient.id === patientId,
  );

  const visit = getVisits().find(
    (currentVisit) =>
      currentVisit.id === visitId &&
      currentVisit.patientId === patientId,
  );

  const prescription = visitId
    ? getPrescriptionByVisitId(visitId)
    : undefined;

  if (!patient || !visit || !prescription) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              patientId && visitId
                ? `/patients/${patientId}/visits/${visitId}`
                : "/patients",
            )
          }
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Visit
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            Prescription not found
          </h1>

          <p className="mt-1 text-sm text-red-600">
            The prescription record could not be found for
            this visit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="print:hidden flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/patients/${patient.id}/visits/${visit.id}`,
              )
            }
            className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Visit
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Prescription Preview
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review the prescription before printing.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/patients/${patient.id}/visits/${visit.id}/prescription`,
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit Prescription
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Print Prescription
          </button>
        </div>
      </div>

      {/* Printable Prescription */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:border-0 print:p-0 print:shadow-none sm:p-8">
        {/* Doctor Header */}
        <div className="border-b border-gray-300 pb-5 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            QuickRx Eye Care
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Ophthalmology Prescription
          </p>

          <p className="mt-2 text-sm font-medium text-gray-700">
            Dr. Doctor
          </p>

          <p className="text-xs text-gray-500">
            Ophthalmologist
          </p>
        </div>

        {/* Patient Information */}
        <div className="border-b border-gray-200 py-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Patient Information
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-500">
                Patient
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {patient.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Patient ID
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {patient.patientId}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Age
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {visit.ageAtVisit} years
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Date
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {new Date(
                  prescription.prescriptionDate,
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="border-b border-gray-200 py-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Diagnosis
          </h3>

          <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
            {visit.diagnosis || "—"}
          </p>
        </div>

        {/* Medicines */}
        <div className="border-b border-gray-200 py-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Medicines
          </h3>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-3">
                    Medicine
                  </th>

                  <th className="px-3 py-3">
                    Form
                  </th>

                  <th className="px-3 py-3">
                    Dose
                  </th>

                  <th className="px-3 py-3">
                    Frequency
                  </th>

                  <th className="px-3 py-3">
                    Duration
                  </th>

                  <th className="px-3 py-3">
                    Instructions
                  </th>
                </tr>
              </thead>

              <tbody>
                {prescription.medicines.map(
                  (medicine) => (
                    <tr
                      key={medicine.id}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <td className="px-3 py-3">
                        <p className="font-medium text-gray-900">
                          {medicine.name}
                        </p>

                        {medicine.strength && (
                          <p className="text-xs text-gray-500">
                            {medicine.strength}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-3 text-gray-700">
                        {medicine.form || "—"}
                      </td>

                      <td className="px-3 py-3 text-gray-700">
                        {medicine.dose || "—"}
                      </td>

                      <td className="px-3 py-3 text-gray-700">
                        {medicine.frequency || "—"}
                      </td>

                      <td className="px-3 py-3 text-gray-700">
                        {medicine.duration || "—"}
                      </td>

                      <td className="px-3 py-3 text-gray-700">
                        {medicine.instructions || "—"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spectacle Prescription */}
        <div className="border-b border-gray-200 py-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Spectacle Prescription
          </h3>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-3">
                    Eye
                  </th>

                  <th className="px-3 py-3">
                    SPH
                  </th>

                  <th className="px-3 py-3">
                    CYL
                  </th>

                  <th className="px-3 py-3">
                    AXIS
                  </th>

                  <th className="px-3 py-3">
                    VA
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Right
                  </td>

                  <td className="px-3 py-3 text-gray-700">
                    {prescription
                      .spectaclePrescription.right
                      .sph || "—"}
                  </td>

                  <td className="px-3 py-3 text-gray-700">
                    {prescription
                      .spectaclePrescription.right
                      .cyl || "—"}
                  </td>

                  <td className="px-3 py-3 text-gray-700">
                    {prescription
                      .spectaclePrescription.right
                      .axis || "—"}
                  </td>

                  <td className="px-3 py-3 text-gray-700">
                    {prescription
                      .spectaclePrescription.right
                      .visualAcuity || "—"}
                  </td>
                </tr>

                <tr>
                  <td className="px-3 py-3 font-medium text-gray-900">
                    Left
                  </td>

                  <td className="px-3 py-3 text-gray-700">
                    {prescription
                      .spectaclePrescription.left
                      .sph || "—"}
                  </td>

                  <td className="px-3 py-3 text-gray-700">
                    {prescription
                      .spectaclePrescription.left
                      .cyl || "—"}
                  </td>

                  <td className="px-3 py-3 text-gray-700">
                    {prescription
                      .spectaclePrescription.left
                      .axis || "—"}
                  </td>

                  <td className="px-3 py-3 text-gray-700">
                    {prescription
                      .spectaclePrescription.left
                      .visualAcuity || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">
                Near Addition
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {prescription
                  .spectaclePrescription
                  .nearAddition || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                PD
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {prescription.spectaclePrescription.pd
                  ? `${prescription.spectaclePrescription.pd} mm`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Advice */}
        <div className="border-b border-gray-200 py-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Advice
          </h3>

          <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
            {prescription.advice || "—"}
          </p>
        </div>

        {/* Follow-up */}
        <div className="py-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Follow-up
          </h3>

          <p className="mt-2 text-sm text-gray-700">
            {prescription.followUp || "—"}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-200 pt-6 text-right">
          <p className="text-sm font-medium text-gray-900">
            Dr. Doctor
          </p>

          <p className="text-xs text-gray-500">
            Ophthalmologist
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionPreview;