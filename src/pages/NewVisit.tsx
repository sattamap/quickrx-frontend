import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPatientById } from "../services/patientApi.ts";
import { createVisit } from "../services/visitApi.ts";
import { useAsyncData } from "../hooks/useAsyncData";

import type { CreateVisitInput } from "../types/visit.ts";
import type { Patient } from "../types/patient.ts";

/* ------------------------------------------------------------------ */
/* Loader wrapper                                                      */
/* ------------------------------------------------------------------ */

function NewVisit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: patient, isLoading, error } = useAsyncData(
    () => (id ? getPatientById(id) : Promise.resolve(undefined)),
    [id],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Loading patient...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
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
            {error ? "Unable to load patient" : "Patient not found"}
          </h1>

          <p className="mt-1 text-sm text-red-600">
            {error ??
              "Unable to start a visit because this patient does not exist."}
          </p>
        </div>
      </div>
    );
  }

  return <NewVisitForm patient={patient} />;
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

interface NewVisitFormProps {
  patient: Patient;
}

function NewVisitForm({ patient }: NewVisitFormProps) {
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [visualAcuity, setVisualAcuity] = useState({
    right: { unaided: "", aided: "" },
    left: { unaided: "", aided: "" },
  });

  const [refraction, setRefraction] = useState({
    right: { sph: "", cyl: "", axis: "", visualAcuity: "" },
    left: { sph: "", cyl: "", axis: "", visualAcuity: "" },
  });

  const [iop, setIop] = useState({ right: "", left: "" });

  const [eyeExamination, setEyeExamination] = useState({
    anteriorSegment: { right: "", left: "" },
    fundus: { right: "", left: "" },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSaving(true);

    const newVisit: CreateVisitInput = {
      patientId: patient.id,
      ageAtVisit: patient.age,
      visitDate: new Date().toISOString(),
      chiefComplaint: chiefComplaint.trim(),

      examination: {
        visualAcuity: {
          right: visualAcuity.right,
          left: visualAcuity.left,
        },

        refraction: {
          right: refraction.right,
          left: refraction.left,
        },

        iop: {
          right: iop.right,
          left: iop.left,
        },

        anteriorSegment: {
          right: eyeExamination.anteriorSegment.right,
          left: eyeExamination.anteriorSegment.left,
        },

        fundus: {
          right: eyeExamination.fundus.right,
          left: eyeExamination.fundus.left,
        },
      },

      diagnosis: diagnosis.trim(),
      clinicalNotes: clinicalNotes.trim(),
    };

    try {
      const savedVisit = await createVisit(newVisit);

      console.log("Visit saved successfully:", savedVisit);

      navigate(`/patients/${patient.id}`);
    } catch (submitError) {
      console.error("Failed to save visit:", submitError);

      window.alert("Unable to save visit. Please try again.");

      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate(`/patients/${patient.id}`)}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Patient
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Visit</h1>

            <p className="mt-1 text-sm text-gray-500">
              Create a new ophthalmology visit for{" "}
              <span className="font-medium text-gray-700">{patient.name}</span>
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm">
            <span className="text-gray-500">Patient ID:</span>{" "}
            <span className="font-semibold text-blue-700">
              {patient.patientId}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                value={new Date().toISOString().split("T")[0]}
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
              onChange={(event) => setChiefComplaint(event.target.value)}
              rows={3}
              placeholder="e.g. blurred vision, eye pain, redness..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </section>

        {/* Ophthalmic Examination */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Ophthalmic Examination
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the eye examination findings for this visit.
          </p>

          <div className="mt-5 space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Visual Acuity */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 text-base font-semibold text-gray-800">
                  Visual Acuity
                </h3>

                <div className="space-y-5">
                  {/* Right Eye */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                      Right Eye (OD)
                    </h4>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Unaided VA
                        </label>

                        <input
                          type="text"
                          value={visualAcuity.right.unaided}
                          onChange={(event) =>
                            setVisualAcuity((previous) => ({
                              ...previous,
                              right: {
                                ...previous.right,
                                unaided: event.target.value,
                              },
                            }))
                          }
                          placeholder="e.g. 6/18"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Aided VA
                        </label>

                        <input
                          type="text"
                          value={visualAcuity.right.aided}
                          onChange={(event) =>
                            setVisualAcuity((previous) => ({
                              ...previous,
                              right: {
                                ...previous.right,
                                aided: event.target.value,
                              },
                            }))
                          }
                          placeholder="e.g. 6/6"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Left Eye */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                      Left Eye (OS)
                    </h4>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Unaided VA
                        </label>

                        <input
                          type="text"
                          value={visualAcuity.left.unaided}
                          onChange={(event) =>
                            setVisualAcuity((previous) => ({
                              ...previous,
                              left: {
                                ...previous.left,
                                unaided: event.target.value,
                              },
                            }))
                          }
                          placeholder="e.g. 6/12"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Aided VA
                        </label>

                        <input
                          type="text"
                          value={visualAcuity.left.aided}
                          onChange={(event) =>
                            setVisualAcuity((previous) => ({
                              ...previous,
                              left: {
                                ...previous.left,
                                aided: event.target.value,
                              },
                            }))
                          }
                          placeholder="e.g. 6/6"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intraocular Pressure */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 text-base font-semibold text-gray-800">
                  Intraocular Pressure (IOP)
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Right Eye */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Right Eye (OD)
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={iop.right}
                        onChange={(event) =>
                          setIop((previous) => ({
                            ...previous,
                            right: event.target.value,
                          }))
                        }
                        placeholder="15"
                        className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <span className="shrink-0 text-sm text-gray-500">
                        mmHg
                      </span>
                    </div>
                  </div>

                  {/* Left Eye */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Left Eye (OS)
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={iop.left}
                        onChange={(event) =>
                          setIop((previous) => ({
                            ...previous,
                            left: event.target.value,
                          }))
                        }
                        placeholder="16"
                        className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <span className="shrink-0 text-sm text-gray-500">
                        mmHg
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refraction — full width, needs room for the table */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-4 text-base font-semibold text-gray-800">
                Refraction
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-600">
                      <th className="px-3 py-3">Eye</th>
                      <th className="px-3 py-3">SPH</th>
                      <th className="px-3 py-3">CYL</th>
                      <th className="px-3 py-3">AXIS</th>
                      <th className="px-3 py-3">Visual Acuity</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Right Eye */}
                    <tr className="border-b">
                      <td className="px-3 py-3 font-medium">Right (OD)</td>

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={refraction.right.sph}
                          onChange={(event) =>
                            setRefraction((previous) => ({
                              ...previous,
                              right: {
                                ...previous.right,
                                sph: event.target.value,
                              },
                            }))
                          }
                          placeholder="-1.50"
                          className="w-full min-w-[90px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={refraction.right.cyl}
                          onChange={(event) =>
                            setRefraction((previous) => ({
                              ...previous,
                              right: {
                                ...previous.right,
                                cyl: event.target.value,
                              },
                            }))
                          }
                          placeholder="-0.50"
                          className="w-full min-w-[90px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={refraction.right.axis}
                          onChange={(event) =>
                            setRefraction((previous) => ({
                              ...previous,
                              right: {
                                ...previous.right,
                                axis: event.target.value,
                              },
                            }))
                          }
                          placeholder="180"
                          className="w-full min-w-[80px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={refraction.right.visualAcuity}
                          onChange={(event) =>
                            setRefraction((previous) => ({
                              ...previous,
                              right: {
                                ...previous.right,
                                visualAcuity: event.target.value,
                              },
                            }))
                          }
                          placeholder="6/6"
                          className="w-full min-w-[90px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>
                    </tr>

                    {/* Left Eye */}
                    <tr>
                      <td className="px-3 py-3 font-medium">Left (OS)</td>

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={refraction.left.sph}
                          onChange={(event) =>
                            setRefraction((previous) => ({
                              ...previous,
                              left: {
                                ...previous.left,
                                sph: event.target.value,
                              },
                            }))
                          }
                          placeholder="-1.25"
                          className="w-full min-w-[90px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={refraction.left.cyl}
                          onChange={(event) =>
                            setRefraction((previous) => ({
                              ...previous,
                              left: {
                                ...previous.left,
                                cyl: event.target.value,
                              },
                            }))
                          }
                          placeholder="-0.25"
                          className="w-full min-w-[90px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={refraction.left.axis}
                          onChange={(event) =>
                            setRefraction((previous) => ({
                              ...previous,
                              left: {
                                ...previous.left,
                                axis: event.target.value,
                              },
                            }))
                          }
                          placeholder="170"
                          className="w-full min-w-[80px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={refraction.left.visualAcuity}
                          onChange={(event) =>
                            setRefraction((previous) => ({
                              ...previous,
                              left: {
                                ...previous.left,
                                visualAcuity: event.target.value,
                              },
                            }))
                          }
                          placeholder="6/6"
                          className="w-full min-w-[90px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Eye Examination — full width, needs room for textareas */}
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-1 text-base font-semibold text-gray-800">
                Eye Examination
              </h3>

              <p className="mb-5 text-sm text-gray-500">
                Anterior Segment / Fundus
              </p>

              {/* Anterior Segment */}
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-medium text-gray-700">
                  Anterior Segment
                </h4>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Right Eye */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Right Eye (OD)
                    </label>

                    <textarea
                      rows={4}
                      value={eyeExamination.anteriorSegment.right}
                      onChange={(event) =>
                        setEyeExamination((previous) => ({
                          ...previous,
                          anteriorSegment: {
                            ...previous.anteriorSegment,
                            right: event.target.value,
                          },
                        }))
                      }
                      placeholder="Enter anterior segment findings..."
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Left Eye */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Left Eye (OS)
                    </label>

                    <textarea
                      rows={4}
                      value={eyeExamination.anteriorSegment.left}
                      onChange={(event) =>
                        setEyeExamination((previous) => ({
                          ...previous,
                          anteriorSegment: {
                            ...previous.anteriorSegment,
                            left: event.target.value,
                          },
                        }))
                      }
                      placeholder="Enter anterior segment findings..."
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Fundus */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-700">
                  Fundus
                </h4>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Right Eye */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Right Eye (OD)
                    </label>

                    <textarea
                      rows={4}
                      value={eyeExamination.fundus.right}
                      onChange={(event) =>
                        setEyeExamination((previous) => ({
                          ...previous,
                          fundus: {
                            ...previous.fundus,
                            right: event.target.value,
                          },
                        }))
                      }
                      placeholder="Enter fundus findings..."
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Left Eye */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Left Eye (OS)
                    </label>

                    <textarea
                      rows={4}
                      value={eyeExamination.fundus.left}
                      onChange={(event) =>
                        setEyeExamination((previous) => ({
                          ...previous,
                          fundus: {
                            ...previous.fundus,
                            left: event.target.value,
                          },
                        }))
                      }
                      placeholder="Enter fundus findings..."
                      className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diagnosis */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-1 text-lg font-semibold text-gray-800">
            Diagnosis
          </h3>

          <p className="mb-4 text-sm text-gray-500">
            Enter the clinical diagnosis for this visit.
          </p>

          <textarea
            rows={3}
            value={diagnosis}
            onChange={(event) => setDiagnosis(event.target.value)}
            placeholder="Enter diagnosis..."
            className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Clinical Notes */}
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-1 text-lg font-semibold text-gray-800">
            Clinical Notes
          </h3>

          <p className="mb-4 text-sm text-gray-500">
            Add relevant clinical observations or additional notes.
          </p>

          <textarea
            rows={5}
            value={clinicalNotes}
            onChange={(event) => setClinicalNotes(event.target.value)}
            placeholder="Enter clinical notes..."
            className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(`/patients/${patient.id}`)}
            disabled={isSaving}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSaving ? "Saving..." : "Save Visit"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewVisit;