import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPatientById } from "../services/patientApi.ts";
import { getVisitById, updateVisit } from "../services/visitApi.ts";
import { useAsyncData } from "../hooks/useAsyncData";

import type { CreateVisitInput } from "../types/visit.ts";
import type { Patient } from "../types/patient.ts";
import type { Visit } from "../types/visit.ts";

function EditVisit() {
  const { patientId, visitId } = useParams();

  const { data, isLoading, error } = useAsyncData(async () => {
    if (!patientId || !visitId) {
      return undefined;
    }

    const [patient, visit] = await Promise.all([
      getPatientById(patientId),
      getVisitById(visitId),
    ]);

    if (!patient || !visit) {
      return undefined;
    }

    return { patient, visit };
  }, [patientId, visitId]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading visit...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            {error ? "Unable to load visit" : "Visit not found"}
          </h1>

          <p className="mt-1 text-sm text-red-600">
            {error ?? "The visit record could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return <EditVisitForm patient={data.patient} visit={data.visit} />;
}

interface EditVisitFormProps {
  patient: Patient;
  visit: Visit;
}

function EditVisitForm({ patient, visit }: EditVisitFormProps) {
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);

  const [chiefComplaint, setChiefComplaint] = useState(
    visit.chiefComplaint ?? "",
  );

  const [diagnosis, setDiagnosis] = useState(visit.diagnosis ?? "");

  const [clinicalNotes, setClinicalNotes] = useState(
    visit.clinicalNotes ?? "",
  );

  const [visualAcuity, setVisualAcuity] = useState({
    right: {
      unaided: visit.examination.visualAcuity.right.unaided ?? "",
      aided: visit.examination.visualAcuity.right.aided ?? "",
    },
    left: {
      unaided: visit.examination.visualAcuity.left.unaided ?? "",
      aided: visit.examination.visualAcuity.left.aided ?? "",
    },
  });

  const [refraction, setRefraction] = useState({
    right: {
      sph: visit.examination.refraction.right.sph ?? "",
      cyl: visit.examination.refraction.right.cyl ?? "",
      axis: visit.examination.refraction.right.axis ?? "",
      visualAcuity:
        visit.examination.refraction.right.visualAcuity ?? "",
    },
    left: {
      sph: visit.examination.refraction.left.sph ?? "",
      cyl: visit.examination.refraction.left.cyl ?? "",
      axis: visit.examination.refraction.left.axis ?? "",
      visualAcuity:
        visit.examination.refraction.left.visualAcuity ?? "",
    },
  });

  const [iop, setIop] = useState({
    right: visit.examination.iop.right ?? "",
    left: visit.examination.iop.left ?? "",
  });

  const [eyeExamination, setEyeExamination] = useState({
    anteriorSegment: {
      right: visit.examination.anteriorSegment.right ?? "",
      left: visit.examination.anteriorSegment.left ?? "",
    },
    fundus: {
      right: visit.examination.fundus.right ?? "",
      left: visit.examination.fundus.left ?? "",
    },
  });

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!visit.id) {
      return;
    }

    setIsSaving(true);

    const updatedVisit: Partial<CreateVisitInput> = {
      patientId: patient.id,
      ageAtVisit: visit.ageAtVisit,
      visitDate: visit.visitDate,

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
      await updateVisit(visit.id, updatedVisit);

      navigate(`/patients/${patient.id}/visits/${visit.id}`);
    } catch (submitError) {
      console.error("Failed to update visit:", submitError);

      window.alert("Unable to update visit. Please try again.");

      setIsSaving(false);
    }
  };

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

        <h1 className="text-2xl font-bold text-gray-900">
          Edit Visit
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {patient.name} · {patient.patientId}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visit Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Visit Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Patient
              </label>

              <input
                type="text"
                value={`${patient.name} (${patient.patientId})`}
                disabled
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Age at Visit
              </label>

              <input
                type="text"
                value={`${visit.ageAtVisit} years`}
                disabled
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Chief Complaint
          </h2>

          <textarea
            value={chiefComplaint}
            onChange={(event) =>
              setChiefComplaint(event.target.value)
            }
            rows={3}
            placeholder="Enter patient's chief complaint..."
            className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Ophthalmic Examination */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Ophthalmic Examination
          </h2>

          {/* Visual Acuity */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900">
              Visual Acuity
            </h3>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                    <th className="px-3 py-2">Eye</th>
                    <th className="px-3 py-2">Unaided</th>
                    <th className="px-3 py-2">Aided</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium">Right</td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={visualAcuity.right.unaided}
                        onChange={(event) =>
                          setVisualAcuity((current) => ({
                            ...current,
                            right: {
                              ...current.right,
                              unaided: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={visualAcuity.right.aided}
                        onChange={(event) =>
                          setVisualAcuity((current) => ({
                            ...current,
                            right: {
                              ...current.right,
                              aided: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="px-3 py-3 font-medium">Left</td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={visualAcuity.left.unaided}
                        onChange={(event) =>
                          setVisualAcuity((current) => ({
                            ...current,
                            left: {
                              ...current.left,
                              unaided: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={visualAcuity.left.aided}
                        onChange={(event) =>
                          setVisualAcuity((current) => ({
                            ...current,
                            left: {
                              ...current.left,
                              aided: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* IOP */}
          <div className="mt-8">
            <h3 className="font-medium text-gray-900">
              Intraocular Pressure
            </h3>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-gray-600">
                  Right Eye
                </label>

                <input
                  type="text"
                  value={iop.right}
                  onChange={(event) =>
                    setIop((current) => ({
                      ...current,
                      right: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Left Eye
                </label>

                <input
                  type="text"
                  value={iop.left}
                  onChange={(event) =>
                    setIop((current) => ({
                      ...current,
                      left: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Refraction */}
          <div className="mt-8">
            <h3 className="font-medium text-gray-900">
              Refraction
            </h3>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                    <th className="px-3 py-2">Eye</th>
                    <th className="px-3 py-2">SPH</th>
                    <th className="px-3 py-2">CYL</th>
                    <th className="px-3 py-2">AXIS</th>
                    <th className="px-3 py-2">VA</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium">Right</td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={refraction.right.sph}
                        onChange={(event) =>
                          setRefraction((current) => ({
                            ...current,
                            right: {
                              ...current.right,
                              sph: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={refraction.right.cyl}
                        onChange={(event) =>
                          setRefraction((current) => ({
                            ...current,
                            right: {
                              ...current.right,
                              cyl: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={refraction.right.axis}
                        onChange={(event) =>
                          setRefraction((current) => ({
                            ...current,
                            right: {
                              ...current.right,
                              axis: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={refraction.right.visualAcuity}
                        onChange={(event) =>
                          setRefraction((current) => ({
                            ...current,
                            right: {
                              ...current.right,
                              visualAcuity: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="px-3 py-3 font-medium">Left</td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={refraction.left.sph}
                        onChange={(event) =>
                          setRefraction((current) => ({
                            ...current,
                            left: {
                              ...current.left,
                              sph: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={refraction.left.cyl}
                        onChange={(event) =>
                          setRefraction((current) => ({
                            ...current,
                            left: {
                              ...current.left,
                              cyl: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={refraction.left.axis}
                        onChange={(event) =>
                          setRefraction((current) => ({
                            ...current,
                            left: {
                              ...current.left,
                              axis: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={refraction.left.visualAcuity}
                        onChange={(event) =>
                          setRefraction((current) => ({
                            ...current,
                            left: {
                              ...current.left,
                              visualAcuity: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Anterior Segment */}
          <div className="mt-8">
            <h3 className="font-medium text-gray-900">
              Anterior Segment
            </h3>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-gray-600">
                  Right Eye
                </label>

                <textarea
                  rows={4}
                  value={eyeExamination.anteriorSegment.right}
                  onChange={(event) =>
                    setEyeExamination((current) => ({
                      ...current,
                      anteriorSegment: {
                        ...current.anteriorSegment,
                        right: event.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Left Eye
                </label>

                <textarea
                  rows={4}
                  value={eyeExamination.anteriorSegment.left}
                  onChange={(event) =>
                    setEyeExamination((current) => ({
                      ...current,
                      anteriorSegment: {
                        ...current.anteriorSegment,
                        left: event.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Fundus */}
          <div className="mt-8">
            <h3 className="font-medium text-gray-900">Fundus</h3>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-gray-600">
                  Right Eye
                </label>

                <textarea
                  rows={4}
                  value={eyeExamination.fundus.right}
                  onChange={(event) =>
                    setEyeExamination((current) => ({
                      ...current,
                      fundus: {
                        ...current.fundus,
                        right: event.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Left Eye
                </label>

                <textarea
                  rows={4}
                  value={eyeExamination.fundus.left}
                  onChange={(event) =>
                    setEyeExamination((current) => ({
                      ...current,
                      fundus: {
                        ...current.fundus,
                        left: event.target.value,
                      },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Diagnosis
          </h2>

          <textarea
            rows={4}
            value={diagnosis}
            onChange={(event) => setDiagnosis(event.target.value)}
            placeholder="Enter diagnosis..."
            className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Clinical Notes */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Clinical Notes
          </h2>

          <textarea
            rows={5}
            value={clinicalNotes}
            onChange={(event) =>
              setClinicalNotes(event.target.value)
            }
            placeholder="Enter clinical notes..."
            className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(`/patients/${patient.id}/visits/${visit.id}`)
            }
            disabled={isSaving}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditVisit;