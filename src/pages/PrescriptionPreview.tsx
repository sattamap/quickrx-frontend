
import { useNavigate, useParams } from "react-router-dom";

import { getPatientById } from "../services/patientApi.ts";
import { getVisitById } from "../services/visitApi.ts";

import {
  deletePrescription,
  getPrescriptionByVisitId,
} from "../services/prescriptionApi.ts";

import {
  getPatientInvestigations,
  type Investigation,
} from "../services/investigationApi.ts";

import { getDoctorProfile } from "../services/doctorProfileApi.ts";
import { getPrescriptionSettings } from "../services/prescriptionSettingsApi.ts";
import { useAsyncData } from "../hooks/useAsyncData";

function PrescriptionPreview() {
  const { patientId, visitId } = useParams<{
    patientId: string;
    visitId: string;
  }>();

  const navigate = useNavigate();

  const { data, isLoading, error } = useAsyncData(async () => {
    if (!patientId || !visitId) {
      return undefined;
    }

    const [
      patient,
      visit,
      prescription,
      investigations,
      doctorProfile,
      prescriptionSettings,
    ] = await Promise.all([
      getPatientById(patientId),
      getVisitById(visitId),
      getPrescriptionByVisitId(visitId),
      getPatientInvestigations(patientId),
      getDoctorProfile(),
      getPrescriptionSettings(),
    ]);

    if (visit.patientId !== patient.id) {
      throw new Error("This visit does not belong to this patient.");
    }

    if (!prescription) {
      return undefined;
    }

    return {
      patient,
      visit,
      prescription,
      investigations,
      doctorProfile,
      prescriptionSettings,
    };
  }, [patientId, visitId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            Loading prescription...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
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
            {error ? "Unable to load prescription" : "Prescription not found"}
          </h1>

          <p className="mt-1 text-sm text-red-600">
            {error ??
              "The prescription record could not be found for this visit."}
          </p>
        </div>
      </div>
    );
  }

  const {
    patient,
    visit,
    prescription,
    investigations,
    doctorProfile,
    prescriptionSettings,
  } = data;

  /*
   * Only show investigations ordered for this particular visit.
   * Cancelled investigations should not appear on the prescription.
   */
  const visitInvestigations: Investigation[] = investigations.filter(
    (investigation) =>
      investigation.orderedVisitId === visit.id &&
      investigation.status !== "cancelled",
  );

  const handleDeletePrescription = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this prescription? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePrescription(prescription.id);

      navigate(`/patients/${patient.id}/visits/${visit.id}`);
    } catch (deleteError) {
      console.error("Failed to delete prescription:", deleteError);

      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete prescription. Please try again.",
      );
    }
  };

  const hasSpectacleData =
    prescription.spectaclePrescription.right.sph ||
    prescription.spectaclePrescription.right.cyl ||
    prescription.spectaclePrescription.right.axis ||
    prescription.spectaclePrescription.right.visualAcuity ||
    prescription.spectaclePrescription.left.sph ||
    prescription.spectaclePrescription.left.cyl ||
    prescription.spectaclePrescription.left.axis ||
    prescription.spectaclePrescription.left.visualAcuity ||
    prescription.spectaclePrescription.nearAddition ||
    prescription.spectaclePrescription.pd;

  const shouldShowSpectaclePrescription =
    prescriptionSettings.showSpectaclePrescription && hasSpectacleData;

  /*
   * Chamber footer settings.
   *
   * The fallbacks preserve the existing footer for older settings records
   * that might not yet contain the new fields.
   */
  const showChamberFooter =
    prescriptionSettings.showChamberFooter !== false;

  const footerHeading =
    prescriptionSettings.footerHeading?.trim() ||
    "রোগী দেখার সময় ও সিরিয়াল";

  const visitingHours =
    prescriptionSettings.visitingHours?.trim() ||
    "বিকাল ৫টা থেকে রাত ৯টা পর্যন্ত";

  const serialBookingPhone =
    prescriptionSettings.serialBookingPhone?.trim() ||
    "০১৯২১৯০৯১১";

  const weeklyClosingDay =
    prescriptionSettings.weeklyClosingDay?.trim() ||
    "প্রতি শুক্রবার";

  return (
    <div className="mx-auto max-w-4xl space-y-6 print:max-w-none">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
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
            onClick={handleDeletePrescription}
            className="rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete Prescription
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
      <div
        className="rounded-xl border border-slate-200 bg-white p-5 text-[13px] leading-snug text-gray-800 shadow-sm sm:p-7 print:rounded-none print:border-0 print:p-3 print:text-[11px] print:shadow-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 8% 8%, rgba(20, 184, 166, 0.075), transparent 32%), radial-gradient(ellipse at 92% 48%, rgba(56, 189, 248, 0.055), transparent 35%), radial-gradient(ellipse at 60% 100%, rgba(99, 102, 241, 0.035), transparent 32%)",
        }}
      >
        {/* Doctor / Clinic Header */}
        <div className="flex items-start justify-between gap-4 rounded-t-lg border-b-2 border-teal-600 bg-gradient-to-r from-teal-50 via-white to-sky-50 px-3 py-3 sm:px-4 print:rounded-none print:px-1 print:py-2">
          <div className="min-w-0">
            <h1 className="break-words text-lg font-bold text-teal-900 sm:text-xl">
              {doctorProfile?.doctorName || "Doctor Name"}
            </h1>

            {doctorProfile?.specialty && (
              <p className="mt-0.5 text-xs font-semibold text-gray-700 sm:text-sm">
                {doctorProfile.specialty}
              </p>
            )}

            {doctorProfile?.qualification && (
              <p className="mt-0.5 text-[11px] text-gray-600 sm:text-xs">
                {doctorProfile.qualification}
              </p>
            )}

            {prescriptionSettings.showRegistrationNumber &&
              doctorProfile?.registrationNumber && (
                <p className="text-[11px] text-gray-600 sm:text-xs">
                  Reg. No: {doctorProfile.registrationNumber}
                </p>
              )}

            {prescriptionSettings.showDoctorPhone && doctorProfile?.phone && (
              <p className="text-[11px] text-gray-600 sm:text-xs">
                Phone: {doctorProfile.phone}
              </p>
            )}
          </div>

          <div className="min-w-0 shrink-0 text-right">
            {doctorProfile?.clinicName && (
              <p className="break-words text-sm font-bold text-gray-900">
                {doctorProfile.clinicName}
              </p>
            )}

            {prescriptionSettings.showClinicAddress &&
              doctorProfile?.clinicAddress && (
                <p className="max-w-56 break-words text-[11px] text-gray-500">
                  {doctorProfile.clinicAddress}
                </p>
              )}

            {prescriptionSettings.showDoctorEmail && doctorProfile?.email && (
              <p className="break-words text-[11px] text-gray-500">
                {doctorProfile.email}
              </p>
            )}
          </div>
        </div>

        {/* Patient & Vital Signs Info Strip */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-teal-100 bg-white/65 py-3 text-xs sm:grid-cols-3 sm:gap-x-5 sm:text-sm lg:grid-cols-4">
          <p className="min-w-0 break-words">
            <span className="text-gray-500">Patient:</span>{" "}
            <span className="font-semibold text-gray-900">
              {patient.name}
            </span>
          </p>

          {prescriptionSettings.showPatientId && (
            <p className="min-w-0 break-words">
              <span className="text-gray-500">ID:</span>{" "}
              <span className="font-medium text-gray-900">
                {patient.patientId}
              </span>
            </p>
          )}

          <p>
            <span className="text-gray-500">Age:</span>{" "}
            <span className="font-medium text-gray-900">
              {visit.ageAtVisit} yrs
            </span>
          </p>

          <p>
            <span className="text-gray-500">Date:</span>{" "}
            <span className="font-medium text-gray-900">
              {new Date(prescription.prescriptionDate).toLocaleDateString(
                "en-GB",
              )}
            </span>
          </p>

          <p>
            <span className="text-gray-500">Weight:</span>{" "}
            <span className="font-medium text-gray-900">
              {visit.vitalSigns?.weight !== null &&
              visit.vitalSigns?.weight !== undefined
                ? `${visit.vitalSigns.weight} kg`
                : "—"}
            </span>
          </p>

          <p>
            <span className="text-gray-500">Height:</span>{" "}
            <span className="font-medium text-gray-900">
              {visit.vitalSigns?.height !== null &&
              visit.vitalSigns?.height !== undefined
                ? `${visit.vitalSigns.height} cm`
                : "—"}
            </span>
          </p>

          <p>
            <span className="text-gray-500">BP:</span>{" "}
            <span className="font-medium text-gray-900">
              {visit.vitalSigns?.bloodPressure || "—"}
            </span>
          </p>

          <p className="min-w-0 break-words">
            <span className="text-gray-500">Referred By:</span>{" "}
            <span className="font-medium text-gray-900">
              {patient.referredBy?.name || "—"}
            </span>
          </p>
        </div>

        {/* Prescription Body */}
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-white/45 py-3 sm:grid-cols-12 sm:gap-5">
          {/* Left Column */}
          <div className="space-y-4 sm:col-span-4 sm:border-r sm:border-gray-200 sm:pr-4">
            {/* Diagnosis */}
            {prescriptionSettings.showDiagnosis && (
              <div>
                <h3 className="rounded-r-md border-l-2 border-teal-500 bg-teal-50/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-800">
                  Diagnosis
                </h3>

                <p className="mt-1 whitespace-pre-line text-xs text-gray-800 sm:text-sm">
                  {visit.diagnosis || "—"}
                </p>
              </div>
            )}

            {/* Spectacle Prescription */}
            {shouldShowSpectaclePrescription && (
              <div>
                <h3 className="rounded-r-md border-l-2 border-sky-500 bg-sky-50/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
                  Spectacle Rx
                </h3>

                <table className="mt-1.5 w-full border-collapse text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-teal-200 bg-teal-50/80 text-left text-teal-800">
                      <th className="py-1 pr-1 font-medium">Eye</th>
                      <th className="py-1 pr-1 font-medium">SPH</th>
                      <th className="py-1 pr-1 font-medium">CYL</th>
                      <th className="py-1 pr-1 font-medium">AXIS</th>
                      <th className="py-1 font-medium">VA</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Right Eye */}
                    <tr className="border-b border-gray-100">
                      <td className="py-1 pr-1 font-semibold text-gray-900">
                        R
                      </td>
                      <td className="py-1 pr-1 text-gray-700">
                        {prescription.spectaclePrescription.right.sph || "—"}
                      </td>
                      <td className="py-1 pr-1 text-gray-700">
                        {prescription.spectaclePrescription.right.cyl || "—"}
                      </td>
                      <td className="py-1 pr-1 text-gray-700">
                        {prescription.spectaclePrescription.right.axis || "—"}
                      </td>
                      <td className="py-1 text-gray-700">
                        {prescription.spectaclePrescription.right.visualAcuity ||
                          "—"}
                      </td>
                    </tr>

                    {/* Left Eye */}
                    <tr>
                      <td className="py-1 pr-1 font-semibold text-gray-900">
                        L
                      </td>
                      <td className="py-1 pr-1 text-gray-700">
                        {prescription.spectaclePrescription.left.sph || "—"}
                      </td>
                      <td className="py-1 pr-1 text-gray-700">
                        {prescription.spectaclePrescription.left.cyl || "—"}
                      </td>
                      <td className="py-1 pr-1 text-gray-700">
                        {prescription.spectaclePrescription.left.axis || "—"}
                      </td>
                      <td className="py-1 text-gray-700">
                        {prescription.spectaclePrescription.left.visualAcuity ||
                          "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-gray-700 sm:text-xs">
                  <p>
                    <span className="text-gray-500">Add:</span>{" "}
                    {prescription.spectaclePrescription.nearAddition || "—"}
                  </p>

                  <p>
                    <span className="text-gray-500">PD:</span>{" "}
                    {prescription.spectaclePrescription.pd
                      ? `${prescription.spectaclePrescription.pd} mm`
                      : "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="sm:col-span-8">
            <h3 className="flex items-baseline gap-1.5 rounded-md border-l-2 border-teal-600 bg-gradient-to-r from-teal-50/90 to-white px-2 py-1 text-sm font-bold text-teal-900 sm:text-base">
              <span className="text-lg font-bold sm:text-xl">℞</span>
              <span className="sr-only">Medicines</span>
            </h3>

            {prescription.medicines.length > 0 ? (
              <ol className="mt-1 space-y-2">
                {prescription.medicines.map((medicine, index) => (
                  <li key={medicine.id} className="flex gap-2">
                    <span className="w-4 shrink-0 text-right text-xs font-semibold text-gray-500 sm:text-sm">
                      {index + 1}.
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 sm:text-sm">
                        {medicine.name}

                        {medicine.strength && (
                          <span className="font-normal text-gray-600">
                            {" "}
                            ({medicine.strength})
                          </span>
                        )}

                        {medicine.form && (
                          <span className="font-normal text-gray-500">
                            {" "}
                            — {medicine.form}
                          </span>
                        )}
                      </p>

                      {(medicine.dose ||
                        medicine.frequency ||
                        medicine.duration) && (
                        <p className="text-[11px] text-gray-700 sm:text-xs">
                          {[
                            medicine.dose,
                            medicine.frequency,
                            medicine.duration,
                          ]
                            .filter(Boolean)
                            .join("  —  ")}
                        </p>
                      )}

                      {medicine.instructions && (
                        <p className="text-[11px] italic text-gray-500 sm:text-xs">
                          {medicine.instructions}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                No medicines added.
              </p>
            )}
          </div>
        </div>

        {/* Investigations Advised */}
        {visitInvestigations.length > 0 && (
          <div className="rounded-lg border border-sky-100 bg-sky-50/55 px-3 py-3">
            <h3 className="rounded-r-md border-l-2 border-sky-500 bg-sky-100/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-900">
              Investigations Advised
            </h3>

            <ol className="mt-1.5 space-y-1">
              {visitInvestigations.map((investigation, index) => (
                <li
                  key={investigation._id}
                  className="flex gap-2 text-xs text-gray-800 sm:text-sm"
                >
                  <span className="w-4 shrink-0 text-right font-semibold text-gray-500">
                    {index + 1}.
                  </span>

                  <span>
                    {investigation.testName}

                    {investigation.eye !== "NA" && (
                      <span className="ml-1 font-medium text-gray-600">
                        ({investigation.eye})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Advice & Follow-up */}
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50/55 via-white to-teal-50/55 p-3 sm:grid-cols-2">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-teal-800">
              Advice
            </h3>

            <p className="mt-1 whitespace-pre-line text-xs text-gray-800 sm:text-sm">
              {prescription.advice || "—"}
            </p>
          </div>

          <div className="sm:border-l sm:border-gray-200 sm:pl-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-indigo-800">
              Follow-up
            </h3>

            <p className="mt-1 text-xs text-gray-800 sm:text-sm">
              {prescription.followUp || "—"}
            </p>
          </div>
        </div>

        {/* Footer / Signature */}
        <div className="prescription-signature mt-5 border-t-2 border-teal-700 pt-4">
          {/* Doctor Signature - controlled independently */}
          {prescriptionSettings.showSignature && (
            <div className="flex items-end justify-between gap-4 pb-4">
              <p className="max-w-[55%] text-[10px] text-gray-400">
                Generated by QuickRx — not valid without signature
              </p>

              <div className="w-40 max-w-[45%] text-right">
                <div className="mb-1 h-8 border-b border-gray-400" />

                <p className="text-xs font-semibold text-gray-900 sm:text-sm">
                  {doctorProfile?.doctorName || "Doctor Name"}
                </p>

                {doctorProfile?.qualification && (
                  <p className="text-[11px] text-gray-500">
                    {doctorProfile.qualification}
                  </p>
                )}

                {prescriptionSettings.showRegistrationNumber &&
                  doctorProfile?.registrationNumber && (
                    <p className="text-[10px] text-gray-500">
                      Reg. No: {doctorProfile.registrationNumber}
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Dynamic Bangla Chamber Information Footer */}
          {showChamberFooter && (
            <div className="overflow-hidden rounded-lg border border-teal-200 print:rounded-none">
              <div className="bg-teal-700 px-3 py-2 text-center text-white print:bg-teal-700 print:print-color-adjust-exact">
                <p className="text-sm font-bold sm:text-base">
                  {footerHeading}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 bg-teal-50 p-3 sm:grid-cols-3 sm:gap-2 print:grid-cols-3 print:gap-2 print:bg-teal-50 print:print-color-adjust-exact">
                {/* Visiting Hours */}
                <div className="flex items-center gap-2 sm:justify-center">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 print:bg-white"
                    aria-hidden="true"
                  >
                    ◷
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-teal-800 sm:text-xs">
                      সাক্ষাতের সময়
                    </p>

                    <p className="whitespace-pre-line break-words text-xs font-medium text-gray-800 sm:text-sm">
                      {visitingHours}
                    </p>
                  </div>
                </div>

                {/* Serial Booking */}
                <div className="flex items-center gap-2 border-t border-teal-100 pt-3 sm:justify-center sm:border-l sm:border-t-0 sm:pt-0 sm:pl-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 print:bg-white"
                    aria-hidden="true"
                  >
                    ☎
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-teal-800 sm:text-xs">
                      সিরিয়ালের জন্য ফোন করুন
                    </p>

                    <p className="break-words text-sm font-bold tracking-wide text-teal-800 sm:text-base">
                      {serialBookingPhone}
                    </p>
                  </div>
                </div>

                {/* Weekly Closing */}
                <div className="flex items-center gap-2 border-t border-teal-100 pt-3 sm:justify-center sm:border-l sm:pt-0 sm:pl-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-red-600 print:bg-white"
                    aria-hidden="true"
                  >
                    ✕
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-teal-800 sm:text-xs">
                      সাপ্তাহিক বন্ধ
                    </p>

                    <p className="break-words text-xs font-bold text-red-700 sm:text-sm">
                      {weeklyClosingDay}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrescriptionPreview;
