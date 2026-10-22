import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPatientById } from "../services/patientApi.ts";
import { getVisitsByPatientId } from "../services/visitApi.ts";
import { getPrescriptionsByPatientId } from "../services/prescriptionApi.ts";
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
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Enter Result modal state.
   */
  const [selectedInvestigation, setSelectedInvestigation] =
    useState<Investigation | null>(null);

  const [resultVisitId, setResultVisitId] = useState("");
  const [testDate, setTestDate] = useState("");
  const [result, setResult] = useState("");
  const [resultNotes, setResultNotes] = useState("");

  const [isSavingResult, setIsSavingResult] = useState(false);
  const [resultError, setResultError] = useState("");

  /*
   * Review Result modal state.
   */
  const [selectedReviewInvestigation, setSelectedReviewInvestigation] =
    useState<Investigation | null>(null);

  const [isReviewingResult, setIsReviewingResult] = useState(false);

  const [reviewError, setReviewError] = useState("");

  /*
   * Load patient data.
   */
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Patient ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [patientData, visitsData, prescriptionsData, investigationsData] =
          await Promise.all([
            getPatientById(id),
            getVisitsByPatientId(id),
            getPrescriptionsByPatientId(id),
            getPatientInvestigations(id),
          ]);

        setPatient(patientData);
        setVisits(visitsData);
        setPrescriptions(prescriptionsData);
        setInvestigations(
          investigationsData.filter(
            (investigation) => investigation.status !== "cancelled",
          ),
        );
      } catch (loadError) {
        console.error("Failed to load patient details:", loadError);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load patient information.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  /*
   * Reload investigations after entering/reviewing a result.
   */
  const loadInvestigations = async (patientId: string) => {
    try {
      const investigationData = await getPatientInvestigations(patientId);

      setInvestigations(
        investigationData.filter(
          (investigation) => investigation.status !== "cancelled",
        ),
      );
    } catch (loadError) {
      console.error("Failed to reload investigations:", loadError);
    }
  };

  /*
   * Build a stable Visit No. mapping for this patient.
   *
   * The oldest visit becomes Visit 01, the next Visit 02, etc.
   *
   * We do not store this number inside Investigation.
   * Investigation already points to the correct visit through
   * orderedVisitId.
   */
  const visitNumberMap = useMemo(() => {
    const sortedVisits = [...visits].sort((a, b) => {
      const dateDifference =
        new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      /*
       * If two visits have the same visit date, use createdAt
       * when available as a tie-breaker.
       */
      const aWithCreatedAt = a as Visit & {
        createdAt?: string;
      };

      const bWithCreatedAt = b as Visit & {
        createdAt?: string;
      };

      if (aWithCreatedAt.createdAt && bWithCreatedAt.createdAt) {
        return (
          new Date(aWithCreatedAt.createdAt).getTime() -
          new Date(bWithCreatedAt.createdAt).getTime()
        );
      }

      return 0;
    });

    const map = new Map<string, number>();

    sortedVisits.forEach((visit, index) => {
      map.set(visit.id, index + 1);
    });

    return map;
  }, [visits]);

  /*
   * Return a formatted Visit number.
   */
  const getVisitNumber = (visitId: string): string => {
    const number = visitNumberMap.get(visitId);

    if (!number) {
      return "—";
    }

    return `Visit ${String(number).padStart(2, "0")}`;
  };

  /*
   * Get the Visit object associated with an investigation.
   */
  const getInvestigationVisit = (
    investigation: Investigation,
  ): Visit | undefined => {
    return visits.find((visit) => visit.id === investigation.orderedVisitId);
  };

  /*
   * Investigation status styling.
   */
  const getInvestigationStatusClass = (
    status: Investigation["status"],
  ): string => {
    switch (status) {
      case "ordered":
        return "bg-blue-50 text-blue-700";

      case "completed":
        return "bg-amber-50 text-amber-700";

      case "reviewed":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-gray-100 text-gray-500";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /*
   * Investigation status label.
   */
  const getInvestigationStatusLabel = (
    status: Investigation["status"],
  ): string => {
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
  const handleOpenResultModal = (investigation: Investigation) => {
    setSelectedInvestigation(investigation);

    setResultVisitId("");
    setTestDate(
      investigation.testDate
        ? investigation.testDate.substring(0, 10)
        : new Date().toISOString().substring(0, 10),
    );
    setResult(investigation.result || "");
    setResultNotes(investigation.notes || "");

    setResultError("");
  };

  /*
   * Close Enter Result modal.
   */
  const handleCloseResultModal = () => {
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
  const handleSaveResult = async () => {
    if (!selectedInvestigation) {
      return;
    }

    if (!resultVisitId) {
      setResultError(
        "Please select the visit where the test result was recorded.",
      );
      return;
    }

    if (!testDate) {
      setResultError("Please select the test date.");
      return;
    }

    if (!result.trim()) {
      setResultError("Please enter the investigation result.");
      return;
    }

    try {
      setIsSavingResult(true);
      setResultError("");

      await addInvestigationResult(selectedInvestigation._id, {
        result: result.trim(),
        testDate,
        resultVisitId,
        notes: resultNotes.trim(),
      });

      if (id) {
        await loadInvestigations(id);
      }

      handleCloseResultModal();
    } catch (saveError) {
      console.error("Failed to save investigation result:", saveError);

      setResultError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save investigation result.",
      );
    } finally {
      setIsSavingResult(false);
    }
  };

  /*
   * Open Review Result modal.
   */
  const handleOpenReviewModal = (investigation: Investigation) => {
    setSelectedReviewInvestigation(investigation);
    setReviewError("");
  };

  /*
   * Close Review Result modal.
   */
  const handleCloseReviewModal = () => {
    if (isReviewingResult) {
      return;
    }

    setSelectedReviewInvestigation(null);
    setReviewError("");
  };

  /*
   * Mark investigation as reviewed.
   */
  const handleReviewInvestigation = async () => {
    if (!selectedReviewInvestigation) {
      return;
    }

    try {
      setIsReviewingResult(true);
      setReviewError("");

      await reviewInvestigation(selectedReviewInvestigation._id);

      if (id) {
        await loadInvestigations(id);
      }

      handleCloseReviewModal();
    } catch (reviewErrorValue) {
      console.error("Failed to review investigation:", reviewErrorValue);

      setReviewError(
        reviewErrorValue instanceof Error
          ? reviewErrorValue.message
          : "Failed to review investigation.",
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
      <div className="p-6">
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            Loading patient information...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (error || !patient) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            {error || "Patient not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/patients")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  /*
   * Find prescription for a visit.
   */
  const getPrescriptionForVisit = (visitId: string) => {
    return prescriptions.find(
      (prescription) => prescription.visitId === visitId,
    );
  };

  /*
   * Only non-cancelled investigations are shown in history.
   */
  const visibleInvestigations = investigations.filter(
    (investigation) => investigation.status !== "cancelled",
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/patients")}
            className="mb-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Patients
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>

          <p className="mt-1 text-sm text-gray-500">
            Patient profile, visit history, prescriptions, and investigations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/patients/${patient.id}/new-visit`)}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Visit
        </button>
      </div>

      {/* Patient Information */}
      <section className="rounded-lg border bg-white p-5">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {patient.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Patient ID: {patient.patientId}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
            <span className="text-gray-500">Registered:</span>{" "}
            <span className="font-medium text-gray-800">
              {new Date(patient.createdAt).toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Age
            </p>
            <p className="mt-1 text-sm text-gray-900">{patient.age} years</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Gender
            </p>
            <p className="mt-1 text-sm capitalize text-gray-900">
              {patient.gender}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Date of Birth
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {patient.dateOfBirth
                ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB")
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Phone
            </p>
            <p className="mt-1 text-sm text-gray-900">{patient.phone || "—"}</p>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Address
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {patient.address || "—"}
            </p>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Allergies
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {patient.allergies || "None recorded"}
            </p>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Patient Notes
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-900">
              {patient.notes || "—"}
            </p>
          </div>
          {/* Referred By */}
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Referred By
              </h3>

              {patient.referredBy &&
              (patient.referredBy.name ||
                patient.referredBy.designation ||
                patient.referredBy.organization ||
                patient.referredBy.phone) ? (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Doctor / Person
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {patient.referredBy.name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Designation
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {patient.referredBy.designation || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Hospital / Organization
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {patient.referredBy.organization || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Contact Number
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {patient.referredBy.phone || "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  No referral information recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Investigation History */}
      <section className="rounded-lg border bg-white">
        <div className="border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Investigation History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Investigations ordered during the patient's visits.
            </p>
          </div>
        </div>

        {visibleInvestigations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Visit No.</th>

                  <th className="px-5 py-3 font-medium">Investigation</th>

                  <th className="px-5 py-3 font-medium">Eye</th>

                  <th className="px-5 py-3 font-medium">Ordered Date</th>

                  <th className="px-5 py-3 font-medium">Test Date</th>

                  <th className="px-5 py-3 font-medium">Status</th>

                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {visibleInvestigations.map((investigation) => {
                  const investigationVisit =
                    getInvestigationVisit(investigation);

                  return (
                    <tr key={investigation._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">
                          {getVisitNumber(investigation.orderedVisitId)}
                        </div>

                        {investigationVisit && (
                          <div className="mt-0.5 text-xs text-gray-400">
                            {new Date(
                              investigationVisit.visitDate,
                            ).toLocaleDateString("en-GB")}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {investigation.testName}
                        </p>

                        {investigation.notes && (
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {investigation.notes}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-700">
                        {investigation.eye}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {new Date(investigation.orderedDate).toLocaleDateString(
                          "en-GB",
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {investigation.testDate
                          ? new Date(investigation.testDate).toLocaleDateString(
                              "en-GB",
                            )
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getInvestigationStatusClass(
                            investigation.status,
                          )}`}
                        >
                          {getInvestigationStatusLabel(investigation.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {investigation.status === "ordered" && (
                          <button
                            type="button"
                            onClick={() => handleOpenResultModal(investigation)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Enter Result
                          </button>
                        )}

                        {investigation.status === "completed" && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(investigation)}
                            className="text-sm font-medium text-amber-600 hover:text-amber-700"
                          >
                            Review Result
                          </button>
                        )}

                        {investigation.status === "reviewed" && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(investigation)}
                            className="text-sm font-medium text-green-600 hover:text-green-700"
                          >
                            View Result
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="font-medium text-gray-900">No investigations yet</p>

            <p className="mt-1 text-sm text-gray-500">
              Investigations prescribed during visits will appear here.
            </p>
          </div>
        )}
      </section>

      {/* Visit History */}
      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b  px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Visit History</h2>

          <p className="mt-1 text-sm text-gray-500">
            Clinical visits recorded for this patient.
          </p>
        </div>

        {visits.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-medium text-gray-900">No visits yet</p>

            <p className="mt-1 text-sm text-gray-500">
              Start a new visit to create the patient's first clinical record.
            </p>

            <button
              type="button"
              onClick={() => navigate(`/patients/${patient.id}/new-visit`)}
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
                  <th className="px-5 py-3 font-medium">Date</th>

                  <th className="px-5 py-3 font-medium">Reason for Visit</th>

                  <th className="px-5 py-3 font-medium">Diagnosis</th>

                  <th className="px-5 py-3 font-medium">Age</th>

                  <th className="px-5 py-3 font-medium">Prescription</th>

                  <th className="px-5 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visits.map((visit) => {
                  const prescription = getPrescriptionForVisit(visit.id);

                  return (
                    <tr
                      key={visit.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {new Date(visit.visitDate).toLocaleDateString(
                            "en-GB",
                          )}
                        </div>
                        <div className="mt-0.5 text-sm text-gray-600">
                          <span>(</span>{getVisitNumber(visit.id)}<span>)</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {visit.chiefComplaint || "—"}
                      </td>

                      <td className="max-w-[220px] px-5 py-4 text-gray-700">
                        <p className="line-clamp-2">{visit.diagnosis || "—"}</p>
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {visit.ageAtVisit ? `${visit.ageAtVisit} years` : "—"}
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
                        <div className="flex justify-evenly gap-3">
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

      {/* Prescription History */}
      <section className="rounded-lg border bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Prescription History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Previous prescriptions issued to this patient.
          </p>
        </div>

        {prescriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>

                  <th className="px-5 py-3 font-medium">Visit</th>

                  <th className="px-5 py-3 font-medium">Medicines</th>

                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {prescriptions.map((prescription) => {
                  const prescriptionVisit = visits.find(
                    (visit) => visit.id === prescription.visitId,
                  );

                  return (
                    <tr
                      key={prescription.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-gray-700">
                        {new Date(
                          prescription.prescriptionDate,
                        ).toLocaleDateString("en-GB")}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-gray-900">
                          {prescriptionVisit
                            ? getVisitNumber(prescriptionVisit.id)
                            : "—"}
                        </span>

                        {prescriptionVisit && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            {new Date(
                              prescriptionVisit.visitDate,
                            ).toLocaleDateString("en-GB")}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {prescription.medicines?.length || 0} medicine
                        {(prescription.medicines?.length || 0) !== 1 ? "s" : ""}
                      </td>

                      <td className="px-5 py-4">
                        {prescriptionVisit ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/patients/${patient.id}/visits/${prescriptionVisit.id}/prescription/preview`,
                              )
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            View
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="font-medium text-gray-900">No prescriptions yet</p>

            <p className="mt-1 text-sm text-gray-500">
              Prescriptions created during visits will appear here.
            </p>
          </div>
        )}
      </section>

      {/* Enter Result Modal */}
      {selectedInvestigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="border-b px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Enter Investigation Result
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Record the result of the prescribed investigation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseResultModal}
                  disabled={isSavingResult}
                  className="text-xl leading-none text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              {/* Investigation summary */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Visit No.
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {getVisitNumber(selectedInvestigation.orderedVisitId)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Investigation
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {selectedInvestigation.testName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Eye
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {selectedInvestigation.eye}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Ordered Date
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {new Date(
                        selectedInvestigation.orderedDate,
                      ).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Result visit */}
              <div>
                <label
                  htmlFor="resultVisit"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Result Visit
                </label>

                <select
                  id="resultVisit"
                  value={resultVisitId}
                  onChange={(event) => setResultVisitId(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select the visit where result was recorded
                  </option>

                  {[...visits]
                    .sort(
                      (a, b) =>
                        new Date(b.visitDate).getTime() -
                        new Date(a.visitDate).getTime(),
                    )
                    .map((visit) => (
                      <option key={visit.id} value={visit.id}>
                        {getVisitNumber(visit.id)} —{" "}
                        {new Date(visit.visitDate).toLocaleDateString("en-GB")}
                      </option>
                    ))}
                </select>
              </div>

              {/* Test date */}
              <div>
                <label
                  htmlFor="testDate"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Test Date
                </label>

                <input
                  id="testDate"
                  type="date"
                  value={testDate}
                  onChange={(event) => setTestDate(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Result */}
              <div>
                <label
                  htmlFor="investigationResult"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Result
                </label>

                <textarea
                  id="investigationResult"
                  rows={6}
                  value={result}
                  onChange={(event) => setResult(event.target.value)}
                  placeholder="Enter the investigation result..."
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="resultNotes"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Notes
                </label>

                <textarea
                  id="resultNotes"
                  rows={3}
                  value={resultNotes}
                  onChange={(event) => setResultNotes(event.target.value)}
                  placeholder="Optional notes..."
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {resultError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {resultError}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseResultModal}
                disabled={isSavingResult}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveResult}
                disabled={isSavingResult}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingResult ? "Saving..." : "Save Result"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Result Modal */}
      {selectedReviewInvestigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="border-b px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Investigation Result
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Review the recorded investigation result.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseReviewModal}
                  disabled={isReviewingResult}
                  className="text-xl leading-none text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              {/* Investigation summary */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Visit No.
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      {getVisitNumber(
                        selectedReviewInvestigation.orderedVisitId,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Investigation
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {selectedReviewInvestigation.testName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Eye
                    </p>

                    <p className="mt-1 font-medium text-gray-900">
                      {selectedReviewInvestigation.eye}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Status
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getInvestigationStatusClass(
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

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Ordered Date
                  </p>

                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(
                      selectedReviewInvestigation.orderedDate,
                    ).toLocaleDateString("en-GB")}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Test Date
                  </p>

                  <p className="mt-1 text-sm text-gray-900">
                    {selectedReviewInvestigation.testDate
                      ? new Date(
                          selectedReviewInvestigation.testDate,
                        ).toLocaleDateString("en-GB")
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Result Visit
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedReviewInvestigation.resultVisitId
                      ? getVisitNumber(
                          selectedReviewInvestigation.resultVisitId,
                        )
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Result */}
              <div>
                <p className="mb-1.5 text-sm font-medium text-gray-700">
                  Result
                </p>

                <div className="min-h-32 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="whitespace-pre-line text-sm leading-6 text-gray-900">
                    {selectedReviewInvestigation.result ||
                      "No result recorded."}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedReviewInvestigation.notes && (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-gray-700">
                    Notes
                  </p>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="whitespace-pre-line text-sm leading-6 text-gray-900">
                      {selectedReviewInvestigation.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Reviewed at */}
              {selectedReviewInvestigation.reviewedAt && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Reviewed At
                  </p>

                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(
                      selectedReviewInvestigation.reviewedAt,
                    ).toLocaleString("en-GB")}
                  </p>
                </div>
              )}

              {reviewError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reviewError}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseReviewModal}
                disabled={isReviewingResult}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Close
              </button>

              {selectedReviewInvestigation.status === "completed" && (
                <button
                  type="button"
                  onClick={handleReviewInvestigation}
                  disabled={isReviewingResult}
                  className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isReviewingResult ? "Reviewing..." : "Mark as Reviewed"}
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
