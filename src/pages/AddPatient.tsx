import { useNavigate } from "react-router-dom";

import PatientForm from "../components/PatientForm";
import type { CreatePatientInput } from "../types/patient";

function AddPatient() {
  const navigate = useNavigate();

  const generatePatientId = () => {
    const number = Date.now().toString().slice(-6);

    return `PAT-${number}`;
  };

  const handleSubmit = (data: CreatePatientInput) => {
    const newPatient = {
      ...data,
      id: crypto.randomUUID(),
      patientId: generatePatientId(),
      createdAt: new Date().toISOString(),
    };

    console.log("New patient:", newPatient);

    navigate("/patients");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Patients
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          Add New Patient
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new patient record.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <PatientForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/patients")}
        />
      </div>
    </div>
  );
}

export default AddPatient;