import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPatientById } from "../services/patientApi.ts";
import { getVisitsByPatientId } from "../services/visitApi.ts";
import {
  getPrescriptionsByPatientId,
} from "../services/prescriptionApi.ts";

import {
  addInvestigationResult,
  getPatientInvestigations,
  reviewInvestigation,
  type Investigation,
} from "../services/investigationApi.ts";

import type { Patient } from "../types/patient.ts";
import type { Visit } from "../types/visit.ts";
import type { Prescription } from "../types/prescription.ts";

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [prescriptions, setPrescriptions] = useState<
    Prescription[]
  >([]);
  const [investigations, setInvestigations] = useState<
    Investigation[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Investigation Result Modal
   */
  const [selectedInvestigation, setSelectedInvestigation] =
    useState<Investigation | null>(null);

  const [resultVisitId, setResultVisitId] = useState("");
  const [testDate, setTestDate] = useState("");
  const [result, setResult] = useState("");
  const [resultNotes, setResultNotes] = useState("");

  const [isSavingResult, setIsSavingResult] =
    useState(false);

  const [resultError, setResultError] = useState("");

  /*
   * Investigation Review Modal
   */
  const [
    selectedReviewInvestigation,
    setSelectedReviewInvestigation,
  ] = useState<Investigation | null>(null);

  const [isReviewingResult, setIsReviewingResult] =
    useState(false);

  const [reviewError, setReviewError] = useState("");

  /*
   * Load investigations again after result/review actions.
   */
  const loadInvestigations = async (
    patientId: string,
  ) => {
    const investigationData =
      await getPatientInvestigations(patientId);

    setInvestigations(investigationData);
  };

  /*
   * Initial page loading.
   */
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Patient information is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [
          patientData,
          visitData,
          prescriptionData,
          investigationData,
        ] = await Promise.all([
          getPatientById(id),
          getVisitsByPatientId(id),
          getPrescriptionsByPatientId(id),
          getPatientInvestigations(id),
        ]);

        if (!patientData) {
          setError("Patient not found.");
          return;
        }

        setPatient(patientData);
        setVisits(visitData);
        setPrescriptions(prescriptionData);
        setInvestigations(investigationData);
      } catch (error) {
        console.error(
          "Failed to load patient details:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load patient information.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  /*
   * Investigation status styling.
   */
  const getInvestigationStatusClasses = (
    status: Investigation["status"],
  ) => {
    switch (status) {
      case "ordered":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "completed":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "reviewed":
        return "bg-green-50 text-green-700 border-green-200";

      case "cancelled":
        return "bg-gray-100 text-gray-500 border-gray-200";

      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  /*
   * Investigation status label.
   */
  const getInvestigationStatusLabel = (
    status: Investigation["status"],
  ) => {
    switch (status) {
      case "ordered":
        return "Ordered";

      case "completed":
        return "Completed";

      case "reviewed":
        return "Reviewed";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  /*
   * Open Enter Result modal.
   */
  const openResultModal = (
    investigation: Investigation,
  ) => {
    setSelectedInvestigation(investigation);

    setResultVisitId("");

    setTestDate(
      new Date().toISOString().split("T")[0],
    );

    setResult("");
    setResultNotes("");
    setResultError("");
  };

  /*
   * Close Enter Result modal.
   */
  const closeResultModal = () => {
    if (isSavingResult) {
      return;
    }

    setSelectedInvestigation(null);
    setResultVisitId("");
    setTestDate("");
    setResult("");
    setResultNotes("");
    setResultError("");
  };

  /*
   * Save investigation result.
   */
  const handleSaveInvestigationResult = async () => {
    if (!selectedInvestigation || !patient) {
      return;
    }

    if (!resultVisitId) {
      setResultError(
        "Please select the visit where this investigation result is being recorded.",
      );
      return;
    }

    if (!testDate) {
      setResultError(
        "Please select the test date.",
      );
      return;
    }

    if (!result.trim()) {
      setResultError(
        "Please enter the investigation result.",
      );
      return;
    }

    try {
      setIsSavingResult(true);
      setResultError("");

      await addInvestigationResult(
        selectedInvestigation._id,
        {
          result: result.trim(),
          testDate,
          resultVisitId,
          notes:
            resultNotes.trim() || undefined,
        },
      );

      await loadInvestigations(patient.id);

      setSelectedInvestigation(null);
      setResultVisitId("");
      setTestDate("");
      setResult("");
      setResultNotes("");
      setResultError("");
    } catch (error) {
      console.error(
        "Failed to save investigation result:",
        error,
      );

      setResultError(
        error instanceof Error
          ? error.message
          : "Unable to save investigation result. Please try again.",
      );
    } finally {
      setIsSavingResult(false);
    }
  };

  /*
   * Open Review Result modal.
   */
  const openReviewModal = (
    investigation: Investigation,
  ) => {
    setSelectedReviewInvestigation(
      investigation,
    );

    setReviewError("");
  };

  /*
   * Close Review Result modal.
   */
  const closeReviewModal = () => {
    if (isReviewingResult) {
      return;
    }

    setSelectedReviewInvestigation(null);
    setReviewError("");
  };

  /*
   * Mark investigation result as reviewed.
   */
  const handleReviewInvestigation = async () => {
    if (
      !selectedReviewInvestigation ||
      !patient
    ) {
      return;
    }

    try {
      setIsReviewingResult(true);
      setReviewError("");

      await reviewInvestigation(
        selectedReviewInvestigation._id,
      );

      await loadInvestigations(patient.id);

      /*
       * Close the modal after successful review.
       *
       * We don't call closeReviewModal() here because
       * isReviewingResult is still true during this
       * function's execution.
       */
      setSelectedReviewInvestigation(null);
      setReviewError("");
    } catch (error) {
      console.error(
        "Failed to review investigation:",
        error,
      );

      setReviewError(
        error instanceof Error
          ? error.message
          : "Unable to review investigation result. Please try again.",
      );
    } finally {
      setIsReviewingResult(false);
    }
  };

  /*
   * Loading state.
   */
  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading patient information...
        </p>
      </div>
    );
  }

  /*
   * Error state.
   */
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
          <h1 className="text-lg font-semibold text-red-800">
            Unable to load patient
          </h1>

          <p className="mt-1 text-sm text-red-600">
            {error || "Patient not found."}
          </p>
        </div>
      </div>
    );
  }

  /*
   * Find prescription for a visit.
   */
  const getPrescriptionForVisit = (
    visitId: string,
  ) => {
    return prescriptions.find(
      (prescription) =>
        prescription.visitId === visitId,
    );
  };

  /*
   * Sort investigations newest first.
   */
  const sortedInvestigations = [
    ...investigations,
  ].sort(
    (a, b) =>
      new Date(b.orderedDate).getTime() -
      new Date(a.orderedDate).getTime(),
  );

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* Header */}
      {/* ========================================================= */}

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
            <div className="flex flex-wrap items-center gap-3">
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
              navigate(
                `/patients/${patient.id}/new-visit`,
              )
            }
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Visit
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Patient Information */}
      {/* ========================================================= */}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Patient Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Basic patient information and contact details.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Patient ID
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {patient.patientId || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Name
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {patient.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Age
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {patient.age
                ? `${patient.age} years`
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Gender
            </p>

            <p className="mt-1 text-sm capitalize text-gray-700">
              {patient.gender || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Date of Birth
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {patient.dateOfBirth
                ? new Date(
                    patient.dateOfBirth,
                  ).toLocaleDateString()
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Phone
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {patient.phone || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Address
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {patient.address || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Registered
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {patient.createdAt
                ? new Date(
                    patient.createdAt,
                  ).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        {(patient.allergies || patient.notes) && (
          <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
            {patient.allergies && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Allergies
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {patient.allergies}
                </p>
              </div>
            )}

            {patient.notes && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Patient Notes
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {patient.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* Visit History */}
      {/* ========================================================= */}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Visit History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Clinical visits recorded for this patient.
          </p>
        </div>

        {visits.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-medium text-gray-900">
              No visits yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Start a new visit to create the
              patient's first clinical record.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/patients/${patient.id}/new-visit`,
                )
              }
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Start New Visit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
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
                    Age
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Prescription
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {visits.map((visit) => {
                  const prescription =
                    getPrescriptionForVisit(
                      visit.id,
                    );

                  return (
                    <tr
                      key={visit.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-gray-700">
                        {new Date(
                          visit.visitDate,
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {visit.chiefComplaint ||
                          "—"}
                      </td>

                      <td className="max-w-[220px] px-5 py-4 text-gray-700">
                        <p className="line-clamp-2">
                          {visit.diagnosis ||
                            "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {visit.ageAtVisit
                          ? `${visit.ageAtVisit} years`
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        {prescription ? (
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            Available
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                            None
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/patients/${patient.id}/visits/${visit.id}`,
                              )
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            View Visit
                          </button>

                          {prescription ? (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/patients/${patient.id}/visits/${visit.id}/prescription/preview`,
                                )
                              }
                              className="text-sm font-medium text-green-600 hover:text-green-700"
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
                              className="text-sm font-medium text-purple-600 hover:text-purple-700"
                            >
                              New Prescription
                            </button>
                          )}
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

      {/* ========================================================= */}
      {/* Investigation History */}
      {/* ========================================================= */}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Investigation History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Investigations ordered, completed, and
                reviewed for this patient.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {sortedInvestigations.length}{" "}
              {sortedInvestigations.length === 1
                ? "investigation"
                : "investigations"}
            </div>
          </div>
        </div>

        {sortedInvestigations.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
              Lab
            </div>

            <h3 className="mt-4 font-medium text-gray-900">
              No investigations
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Investigations ordered from prescriptions
              will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    Investigation
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Eye
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Ordered Date
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Test Date
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedInvestigations.map(
                  (investigation) => (
                    <tr
                      key={investigation._id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {investigation.testName}
                        </p>

                        {investigation.notes && (
                          <p className="mt-1 max-w-[250px] truncate text-xs text-gray-500">
                            {investigation.notes}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {investigation.eye}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {new Date(
                          investigation.orderedDate,
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {investigation.testDate
                          ? new Date(
                              investigation.testDate,
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getInvestigationStatusClasses(
                            investigation.status,
                          )}`}
                        >
                          {getInvestigationStatusLabel(
                            investigation.status,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {investigation.status ===
                          "ordered" && (
                          <button
                            type="button"
                            onClick={() =>
                              openResultModal(
                                investigation,
                              )
                            }
                            className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                          >
                            Enter Result
                          </button>
                        )}

                        {investigation.status ===
                          "completed" && (
                          <button
                            type="button"
                            onClick={() =>
                              openReviewModal(
                                investigation,
                              )
                            }
                            className="rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100"
                          >
                            Review Result
                          </button>
                        )}

                        {investigation.status ===
                          "reviewed" && (
                          <button
                            type="button"
                            onClick={() =>
                              openReviewModal(
                                investigation,
                              )
                            }
                            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                          >
                            View Result
                          </button>
                        )}

                        {investigation.status ===
                          "cancelled" && (
                          <span className="text-xs text-gray-400">
                            Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* Prescription Summary */}
      {/* ========================================================= */}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Prescription History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Prescriptions issued for this patient.
          </p>
        </div>

        {prescriptions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
              Rx
            </div>

            <h3 className="mt-4 font-medium text-gray-900">
              No prescriptions yet
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Saved prescriptions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    Prescription Date
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Visit Date
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Medicines
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {prescriptions
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(
                        b.prescriptionDate,
                      ).getTime() -
                      new Date(
                        a.prescriptionDate,
                      ).getTime(),
                  )
                  .map((prescription) => {
                    const visit = visits.find(
                      (currentVisit) =>
                        currentVisit.id ===
                        prescription.visitId,
                    );

                    return (
                      <tr
                        key={prescription.id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <td className="px-5 py-4 text-gray-700">
                          {new Date(
                            prescription.prescriptionDate,
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          {visit?.visitDate
                            ? new Date(
                                visit.visitDate,
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          {prescription.medicines
                            .length > 0 ? (
                            <div className="space-y-1">
                              {prescription.medicines
                                .slice(0, 3)
                                .map(
                                  (
                                    medicine,
                                  ) => (
                                    <p
                                      key={
                                        medicine.id
                                      }
                                      className="text-gray-700"
                                    >
                                      {medicine.name}
                                      {medicine.strength && (
                                        <span className="ml-1 text-xs text-gray-500">
                                          {
                                            medicine.strength
                                          }
                                        </span>
                                      )}
                                    </p>
                                  ),
                                )}

                              {prescription.medicines
                                .length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +
                                  {prescription
                                    .medicines
                                    .length -
                                    3}{" "}
                                  more
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              No medicines
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/patients/${patient.id}/visits/${prescription.visitId}/prescription/preview`,
                              )
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            View Prescription
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* Enter Investigation Result Modal */}
      {/* ========================================================= */}

      {selectedInvestigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Enter Investigation Result
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Record the result for this investigation.
                </p>
              </div>

              <button
                type="button"
                onClick={closeResultModal}
                disabled={isSavingResult}
                className="rounded-md px-2 py-1 text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              {resultError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {resultError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Investigation
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {
                      selectedInvestigation.testName
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Eye
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {selectedInvestigation.eye}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="result-visit"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Result Visit
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  id="result-visit"
                  value={resultVisitId}
                  onChange={(event) =>
                    setResultVisitId(
                      event.target.value,
                    )
                  }
                  disabled={isSavingResult}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                >
                  <option value="">
                    Select the visit where the result is recorded
                  </option>

                  {visits.map((visit) => (
                    <option
                      key={visit.id}
                      value={visit.id}
                    >
                      {new Date(
                        visit.visitDate,
                      ).toLocaleDateString()}{" "}
                      —{" "}
                      {visit.chiefComplaint ||
                        "Clinical visit"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="test-date"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Test Date
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="test-date"
                  type="date"
                  value={testDate}
                  onChange={(event) =>
                    setTestDate(
                      event.target.value,
                    )
                  }
                  disabled={isSavingResult}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="investigation-result"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Result
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  id="investigation-result"
                  rows={6}
                  value={result}
                  onChange={(event) =>
                    setResult(
                      event.target.value,
                    )
                  }
                  disabled={isSavingResult}
                  placeholder="Enter the investigation findings/result..."
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="investigation-result-notes"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Notes
                </label>

                <textarea
                  id="investigation-result-notes"
                  rows={3}
                  value={resultNotes}
                  onChange={(event) =>
                    setResultNotes(
                      event.target.value,
                    )
                  }
                  disabled={isSavingResult}
                  placeholder="Optional notes..."
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={closeResultModal}
                disabled={isSavingResult}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveInvestigationResult
                }
                disabled={isSavingResult}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSavingResult
                  ? "Saving Result..."
                  : "Save Result"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Review Investigation Result Modal */}
      {/* ========================================================= */}

      {selectedReviewInvestigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedReviewInvestigation.status ===
                  "reviewed"
                    ? "Investigation Result"
                    : "Review Investigation Result"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedReviewInvestigation.status ===
                  "reviewed"
                    ? "View the recorded investigation result."
                    : "Review the result before marking it as reviewed."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                disabled={isReviewingResult}
                className="rounded-md px-2 py-1 text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 px-5 py-5">
              {reviewError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reviewError}
                </div>
              )}

              {/* Basic Investigation Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Investigation
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {
                      selectedReviewInvestigation.testName
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Eye
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {
                      selectedReviewInvestigation.eye
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Ordered Date
                  </p>

                  <p className="mt-1 text-sm text-gray-800">
                    {new Date(
                      selectedReviewInvestigation.orderedDate,
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Test Date
                  </p>

                  <p className="mt-1 text-sm text-gray-800">
                    {selectedReviewInvestigation.testDate
                      ? new Date(
                          selectedReviewInvestigation.testDate,
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </p>

                  <div className="mt-1">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getInvestigationStatusClasses(
                        selectedReviewInvestigation.status,
                      )}`}
                    >
                      {getInvestigationStatusLabel(
                        selectedReviewInvestigation.status,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Result
                </p>

                <div className="min-h-32 whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800">
                  {selectedReviewInvestigation.result ||
                    "No result available."}
                </div>
              </div>

              {/* Notes */}
              {selectedReviewInvestigation.notes && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Notes
                  </p>

                  <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-800">
                    {
                      selectedReviewInvestigation.notes
                    }
                  </div>
                </div>
              )}

              {/* Reviewed Date */}
              {selectedReviewInvestigation.reviewedAt && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Reviewed At
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {new Date(
                      selectedReviewInvestigation.reviewedAt,
                    ).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={closeReviewModal}
                disabled={isReviewingResult}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Close
              </button>

              {selectedReviewInvestigation.status ===
                "completed" && (
                <button
                  type="button"
                  onClick={
                    handleReviewInvestigation
                  }
                  disabled={isReviewingResult}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                >
                  {isReviewingResult
                    ? "Marking as Reviewed..."
                    : "Mark as Reviewed"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDetails;