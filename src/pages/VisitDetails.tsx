import { useNavigate, useParams } from "react-router-dom";

import { getPatientById } from "../services/patientService";
import { getVisitForPatient } from "../services/visitService";
import { getPrescriptionByVisitId } from "../services/prescriptionService";
import { useAsyncData } from "../hooks/useAsyncData";

function VisitDetails() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useAsyncData(async () => {
    if (!patientId || !visitId) {
      return undefined;
    }

    const [patient, visit, prescription] = await Promise.all([
      getPatientById(patientId),
      getVisitForPatient(patientId, visitId),
      getPrescriptionByVisitId(visitId),
    ]);

    if (!patient || !visit) {
      return undefined;
    }

    return { patient, visit, prescription };
  }, [patientId, visitId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Loading visit...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(`/patients/${patientId}`)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Patient
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            {error ? "Unable to load visit" : "Visit not found"}
          </h1>

          <p className="mt-1 text-sm text-red-600">
            {error ?? "The visit record you're looking for does not exist."}
          </p>
        </div>
      </div>
    );
  }

  const { patient, visit, prescription } = data;

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate(`/patients/${patient.id}`)}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Patient
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visit Details</h1>

            <p className="mt-1 text-sm text-gray-500">
              {patient.name} · {patient.patientId}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {prescription ? (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/patients/${patient.id}/visits/${visit.id}/prescription/preview`,
                  )
                }
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
              >
                View Prescription
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/patients/${patient.id}/visits/${visit.id}/prescription`,
                  )
                }
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                + New Prescription
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/patients/${patient.id}/new-visit`)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              + New Visit
            </button>
          </div>
        </div>
      </div>

      {/* Visit Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Visit Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Patient
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
              Visit Date
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDate(visit.visitDate)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Age at Visit
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {visit.ageAtVisit} years
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-5">
          <p className="text-xs font-medium uppercase text-gray-500">
            Chief Complaint
          </p>

          <p className="mt-1 text-sm text-gray-700">
            {visit.chiefComplaint || "Not recorded"}
          </p>
        </div>
      </div>

      {/* Ophthalmic Examination */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Ophthalmic Examination
        </h2>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          {/* Visual Acuity */}
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Visual Acuity</h3>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[400px] text-sm">
                <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Eye</th>
                    <th className="px-3 py-2 font-medium">Unaided</th>
                    <th className="px-3 py-2 font-medium">Aided</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-gray-900">
                      Right
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.visualAcuity.right.unaided || "—"}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.visualAcuity.right.aided || "—"}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-3 py-3 font-medium text-gray-900">
                      Left
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.visualAcuity.left.unaided || "—"}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.visualAcuity.left.aided || "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* IOP */}
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">
              Intraocular Pressure
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase text-gray-500">
                  Right Eye
                </p>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {visit.examination.iop.right || "—"}
                  {visit.examination.iop.right && " mmHg"}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase text-gray-500">
                  Left Eye
                </p>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {visit.examination.iop.left || "—"}
                  {visit.examination.iop.left && " mmHg"}
                </p>
              </div>
            </div>
          </div>

          {/* Refraction */}
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h3 className="font-semibold text-gray-900">Refraction</h3>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Eye</th>
                    <th className="px-3 py-2 font-medium">SPH</th>
                    <th className="px-3 py-2 font-medium">CYL</th>
                    <th className="px-3 py-2 font-medium">AXIS</th>
                    <th className="px-3 py-2 font-medium">VA</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-gray-900">
                      Right
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.refraction.right.sph || "—"}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.refraction.right.cyl || "—"}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.refraction.right.axis || "—"}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.refraction.right.visualAcuity || "—"}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-3 py-3 font-medium text-gray-900">
                      Left
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.refraction.left.sph || "—"}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.refraction.left.cyl || "—"}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.refraction.left.axis || "—"}
                    </td>

                    <td className="px-3 py-3 text-gray-700">
                      {visit.examination.refraction.left.visualAcuity || "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Anterior Segment */}
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Anterior Segment</h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Right Eye
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                  {visit.examination.anteriorSegment.right || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Left Eye
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                  {visit.examination.anteriorSegment.left || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Fundus */}
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Fundus</h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Right Eye
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                  {visit.examination.fundus.right || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Left Eye
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                  {visit.examination.fundus.left || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Diagnosis</h2>

        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
          {visit.diagnosis || "No diagnosis recorded"}
        </p>
      </div>

      {/* Clinical Notes */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Clinical Notes</h2>

        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
          {visit.clinicalNotes || "No clinical notes recorded"}
        </p>
      </div>
    </div>
  );
}

export default VisitDetails;