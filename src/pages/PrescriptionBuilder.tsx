import { useNavigate, useParams } from "react-router-dom";

import { initialPatients } from "../data/patients";
import { getVisits } from "../utils/visitStorage";

function PrescriptionBuilder() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();

  const patient = initialPatients.find(
    (currentPatient) => currentPatient.id === patientId
  );

  const visit = getVisits().find(
    (currentVisit) =>
      currentVisit.id === visitId &&
      currentVisit.patientId === patientId
  );

  if (!patient || !visit) {
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
            Prescription context not found
          </h1>

          <p className="mt-1 text-sm text-red-600">
            The patient or visit record could not be found.
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
          onClick={() =>
            navigate(`/patients/${patient.id}/visits/${visit.id}`)
          }
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Visit
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Prescription
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create prescription for {patient.name} (
            {patient.patientId})
          </p>
        </div>
      </div>

      {/* Patient & Visit Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Patient & Visit
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

            <p className="mt-1 text-sm text-gray-700">
              {patient.patientId}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Visit Date
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {new Date(visit.visitDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Diagnosis
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {visit.diagnosis || "Not recorded"}
            </p>
          </div>
        </div>
      </div>

      {/* Medicines */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Medicines
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Medicines will be added here.
        </p>
      </div>

      {/* Spectacle Prescription */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Spectacle Prescription
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Spectacle prescription fields will be added here.
        </p>
      </div>

      {/* Advice & Follow-up */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Advice & Follow-up
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Advice and follow-up fields will be added here.
        </p>
      </div>
    </div>
  );
}

export default PrescriptionBuilder;