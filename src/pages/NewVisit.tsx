import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import { initialPatients } from "../data/patients";

function NewVisit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const patient = initialPatients.find(
    (currentPatient) => currentPatient.id === id
  );

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");

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
          <h1 className="font-semibold text-red-800">
            Patient not found
          </h1>

          <p className="mt-1 text-sm text-red-600">
            Unable to start a visit because this patient does not
            exist.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    console.log({
      patientId: patient.id,
      visitDate: new Date().toISOString(),
      chiefComplaint,
      diagnosis,
      clinicalNotes,
    });

    navigate(`/patients/${patient.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() =>
            navigate(`/patients/${patient.id}`)
          }
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Patient
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              New Visit
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create a new ophthalmology visit for{" "}
              <span className="font-medium text-gray-700">
                {patient.name}
              </span>
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm">
            <span className="text-gray-500">
              Patient ID:
            </span>{" "}
            <span className="font-semibold text-blue-700">
              {patient.patientId}
            </span>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Visit Information */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Visit Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Patient
              </label>

              <input
                type="text"
                value={`${patient.name} (${patient.patientId})`}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Visit Date
              </label>

              <input
                type="date"
                value={new Date()
                  .toISOString()
                  .split("T")[0]}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Chief Complaint
            </label>

            <textarea
              value={chiefComplaint}
              onChange={(event) =>
                setChiefComplaint(event.target.value)
              }
              rows={3}
              placeholder="e.g. blurred vision, eye pain, redness..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </section>

        {/* Examination Placeholder */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Ophthalmic Examination
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Detailed eye examination fields will be added in the
            next steps.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-dashed border-gray-300 p-4">
              <p className="text-sm font-medium text-gray-700">
                Visual Acuity
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Right / Left eye
              </p>
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 p-4">
              <p className="text-sm font-medium text-gray-700">
                Refraction
              </p>

              <p className="mt-1 text-xs text-gray-500">
                SPH / CYL / AXIS
              </p>
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 p-4">
              <p className="text-sm font-medium text-gray-700">
                IOP
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Right / Left eye
              </p>
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 p-4">
              <p className="text-sm font-medium text-gray-700">
                Eye Examination
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Anterior segment / Fundus
              </p>
            </div>
          </div>
        </section>

        {/* Diagnosis */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Diagnosis
          </h2>

          <div className="mt-4">
            <textarea
              value={diagnosis}
              onChange={(event) =>
                setDiagnosis(event.target.value)
              }
              rows={3}
              placeholder="Enter diagnosis..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </section>

        {/* Clinical Notes */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Clinical Notes
          </h2>

          <div className="mt-4">
            <textarea
              value={clinicalNotes}
              onChange={(event) =>
                setClinicalNotes(event.target.value)
              }
              rows={5}
              placeholder="Enter additional clinical notes..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(`/patients/${patient.id}`)
            }
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Visit
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewVisit;