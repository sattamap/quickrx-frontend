import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

import { initialPatients } from "../data/patients";

function NewVisit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const patient = initialPatients.find(
    (currentPatient) => currentPatient.id === id,
  );

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [visualAcuity, setVisualAcuity] = useState({
    right: {
      unaided: "",
      aided: "",
    },
    left: {
      unaided: "",
      aided: "",
    },
  });

  const [refraction, setRefraction] = useState({
    right: {
      sph: "",
      cyl: "",
      axis: "",
      visualAcuity: "",
    },
    left: {
      sph: "",
      cyl: "",
      axis: "",
      visualAcuity: "",
    },
  });

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
          <h1 className="font-semibold text-red-800">Patient not found</h1>

          <p className="mt-1 text-sm text-red-600">
            Unable to start a visit because this patient does not exist.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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

        {/* Examination Placeholder */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Ophthalmic Examination
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Detailed eye examination fields will be added in the next steps.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Visual Acuity
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Right Eye */}
                <div>
                  <h4 className="mb-3 font-medium text-gray-700">
                    Right Eye (OD)
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-center font-medium text-gray-700">
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
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-center font-medium text-gray-700">
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
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Left Eye */}
                <div>
                  <h4 className="mb-3 font-medium text-gray-700">
                    Left Eye (OS)
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-center font-medium text-gray-700">
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
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-center font-medium text-gray-700">
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
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 p-4">
              <p className="text-sm font-medium text-gray-700">IOP</p>

              <p className="mt-1 text-xs text-gray-500">Right / Left eye</p>
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
          <h2 className="text-lg font-semibold text-gray-900">Diagnosis</h2>

          <div className="mt-4">
            <textarea
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
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
              onChange={(event) => setClinicalNotes(event.target.value)}
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
            onClick={() => navigate(`/patients/${patient.id}`)}
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
