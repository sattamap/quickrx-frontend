import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getPatientById } from "../services/patientApi.ts";
import { getVisitById } from "../services/visitApi.ts";
import {
  createPrescription,
  getPrescriptionByVisitId,
  updatePrescription,
} from "../services/prescriptionApi.ts";

import type { Patient } from "../types/patient.ts";
import type { Visit } from "../types/visit.ts";
import type {
  Prescription,
  PrescriptionMedicine,
  SpectaclePrescription,
} from "../types/prescription.ts";

import { getPrescriptionSettings } from "../services/prescriptionSettingsApi.ts";

import { searchMedicines, type Medicine } from "../utils/medicineData.ts";

const emptySpectaclePrescription: SpectaclePrescription = {
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
  nearAddition: "",
  pd: "",
};

interface MedicineForm {
  name: string;
  strength: string;
  form: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const emptyMedicineForm: MedicineForm = {
  name: "",
  strength: "",
  form: "",
  dose: "",
  frequency: "",
  duration: "",
  instructions: "",
};

type MedicineChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement>;

function PrescriptionBuilder() {
  const navigate = useNavigate();

  const { patientId, visitId } = useParams<{
    patientId: string;
    visitId: string;
  }>();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);

  const [existingPrescription, setExistingPrescription] =
    useState<Prescription | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);

  const [medicineForm, setMedicineForm] =
    useState<MedicineForm>(emptyMedicineForm);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const medicineInputRef = useRef<HTMLInputElement | null>(null);

  const [spectaclePrescription, setSpectaclePrescription] =
    useState<SpectaclePrescription>(emptySpectaclePrescription);

  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState("");

  /*
   * Load patient, visit, and existing prescription.
   */
  useEffect(() => {
    const loadData = async () => {
      if (!patientId || !visitId) {
        setLoadError("Patient or visit information is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const [patientData, visitData, prescriptionData, prescriptionSettings] =
          await Promise.all([
            getPatientById(patientId),
            getVisitById(visitId),
            getPrescriptionByVisitId(visitId),
            getPrescriptionSettings(),
          ]);

        if (visitData.patientId !== patientData.id) {
          throw new Error("This visit does not belong to this patient.");
        }

        setPatient(patientData);
        setVisit(visitData);
        setExistingPrescription(prescriptionData);

        /*
         * Hydrate the form directly from the API result.
         */
        if (prescriptionData) {
          setMedicines(prescriptionData.medicines);

          setSpectaclePrescription(prescriptionData.spectaclePrescription);

          setAdvice(prescriptionData.advice);
          setFollowUp(prescriptionData.followUp);
        } else {
          setMedicines([]);

          setSpectaclePrescription({
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
            nearAddition: "",
            pd: "",
          });

          setAdvice(prescriptionSettings.defaultAdvice);
          setFollowUp(prescriptionSettings.defaultFollowUp);
        }
      } catch (error) {
        console.error("Failed to load prescription builder data:", error);

        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load prescription data.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [patientId, visitId]);

  /*
   * Medicine form change handler.
   *
   * Supports BOTH:
   *
   * 1. Direct field/value:
   *    handleMedicineFormChange("name", value)
   *
   * 2. React onChange:
   *    onChange={handleMedicineFormChange}
   *
   * This allows the same handler to work with
   * both input and select elements.
   */
  const handleMedicineFormChange = (
    fieldOrEvent: keyof MedicineForm | MedicineChangeEvent,
    value?: string,
  ) => {
    if (typeof fieldOrEvent === "string") {
      setMedicineForm((current) => ({
        ...current,
        [fieldOrEvent]: value ?? "",
      }));

      return;
    }

    const { name, value: eventValue } = fieldOrEvent.target;

    if (
      name !== "name" &&
      name !== "strength" &&
      name !== "form" &&
      name !== "dose" &&
      name !== "frequency" &&
      name !== "duration" &&
      name !== "instructions"
    ) {
      return;
    }

    setMedicineForm((current) => ({
      ...current,
      [name]: eventValue,
    }));
  };

  /*
   * Search the real medicine database.
   */
  const filteredMedicineSuggestions = searchMedicines(medicineForm.name, 20);

  /*
   * Select medicine from medicine database.
   *
   * Automatically fills:
   * - Name
   * - Strength
   *
   * The doctor still chooses/enters:
   * - Form
   * - Dose
   * - Frequency
   * - Duration
   * - Instructions
   */
  const handleSelectMedicineSuggestion = (medicine: Medicine) => {
    setMedicineForm((current) => ({
      ...current,
      name: medicine.name,
      strength: medicine.strength,
    }));

    setShowSuggestions(false);

    setTimeout(() => {
      medicineInputRef.current?.focus();
    }, 0);
  };

  const handleAddMedicine = () => {
    if (!medicineForm.name.trim()) {
      return;
    }

    const medicine: PrescriptionMedicine = {
      id: crypto.randomUUID(),
      name: medicineForm.name.trim(),
      strength: medicineForm.strength.trim(),
      form: medicineForm.form.trim(),
      dose: medicineForm.dose.trim(),
      frequency: medicineForm.frequency.trim(),
      duration: medicineForm.duration.trim(),
      instructions: medicineForm.instructions.trim(),
    };

    setMedicines((current) => [...current, medicine]);

    setMedicineForm(emptyMedicineForm);
    setShowSuggestions(false);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines((current) => current.filter((medicine) => medicine.id !== id));
  };

  /*
   * Spectacle prescription handler.
   */
  const handleSpectacleChange = (
    section: "right" | "left" | "nearAddition" | "pd",
    field: keyof SpectaclePrescription["right"] | null,
    value: string,
  ) => {
    setSpectaclePrescription((current) => {
      if (section === "right" || section === "left") {
        if (!field) {
          return current;
        }

        return {
          ...current,
          [section]: {
            ...current[section],
            [field]: value,
          },
        };
      }

      return {
        ...current,
        [section]: value,
      };
    });
  };

  /*
   * Save / update prescription.
   */
  const handleSavePrescription = async () => {
    if (!patient || !visit) {
      return;
    }

    try {
      setIsSaving(true);
      setLoadError("");

      const prescriptionData = {
        patientId: patient.id,
        visitId: visit.id,
        prescriptionDate:
          existingPrescription?.prescriptionDate ?? new Date().toISOString(),
        medicines,
        spectaclePrescription,
        advice: advice.trim(),
        followUp: followUp.trim(),
      };

      let savedPrescription: Prescription;

      if (existingPrescription?.id) {
        savedPrescription = await updatePrescription(
          existingPrescription.id,
          prescriptionData,
        );
      } else {
        savedPrescription = await createPrescription(prescriptionData);
      }

      setExistingPrescription(savedPrescription);

      navigate(
        `/patients/${patient.id}/visits/${visit.id}/prescription/preview`,
      );
    } catch (error) {
      console.error("Failed to save prescription:", error);

      setLoadError(
        error instanceof Error ? error.message : "Failed to save prescription.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!patient || !visit) {
      navigate("/patients");
      return;
    }

    navigate(`/patients/${patient.id}/visits/${visit.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-sm text-gray-500">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (loadError && (!patient || !visit)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">
          Unable to load prescription
        </h2>

        <p className="mt-2 text-sm text-red-700">{loadError}</p>

        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  if (!patient || !visit) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={handleCancel}
            className="mb-2 text-sm text-blue-600 hover:text-blue-800"
          >
            ← Back to Visit
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            {existingPrescription ? "Edit Prescription" : "New Prescription"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create prescription for {patient.name}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSavePrescription}
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Prescription"}
          </button>
        </div>
      </div>

      {/* Error */}
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Patient / Visit Information */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Patient & Visit Information
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Patient ID
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {patient.patientId}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Patient Name
            </p>

            <p className="mt-1 font-medium text-gray-900">{patient.name}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Age</p>

            <p className="mt-1 font-medium text-gray-900">
              {visit.ageAtVisit} years
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Visit Date
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {new Date(visit.visitDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      {/* Medicines */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Medicines</h2>

          <p className="mt-1 text-sm text-gray-500">
            Add prescribed medicines and instructions.
          </p>
        </div>

        {/* Medicine Form */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Medicine Name */}
            <div className="relative lg:col-span-2">
              <label
                htmlFor="medicine-name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Medicine Name
              </label>

              <input
                ref={medicineInputRef}
                id="medicine-name"
                name="name"
                type="text"
                value={medicineForm.name}
                onChange={(event) => {
                  handleMedicineFormChange("name", event.target.value);

                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search medicine name or generic..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {showSuggestions &&
                medicineForm.name.trim() &&
                filteredMedicineSuggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredMedicineSuggestions.map((medicine) => (
                      <li key={medicine.id}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() =>
                            handleSelectMedicineSuggestion(medicine)
                          }
                          className="w-full px-3 py-2.5 text-left hover:bg-gray-50"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {medicine.name}{" "}
                            {medicine.strength && (
                              <span className="font-normal text-gray-500">
                                ({medicine.strength})
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-gray-500">
                            {medicine.generic} · {medicine.company}
                            {medicine.price !== null && ` · ৳${medicine.price}`}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

              {showSuggestions &&
                medicineForm.name.trim() &&
                filteredMedicineSuggestions.length === 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-500 shadow-lg">
                    No matching medicines found.
                  </div>
                )}
            </div>

            {/* Strength */}
            <div>
              <label
                htmlFor="medicine-strength"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Strength
              </label>

              <input
                id="medicine-strength"
                name="strength"
                type="text"
                value={medicineForm.strength}
                onChange={(event) =>
                  handleMedicineFormChange("strength", event.target.value)
                }
                placeholder="e.g. 0.5%"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Form */}
            <div>
              <label
                htmlFor="medicine-form"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Form
              </label>

              <select
                id="medicine-form"
                name="form"
                value={medicineForm.form}
                onChange={handleMedicineFormChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select form</option>

                <option value="Eye Drop">Eye Drop</option>

                <option value="Eye Ointment">Eye Ointment</option>

                <option value="Tablet">Tablet</option>

                <option value="Capsule">Capsule</option>

                <option value="Syrup">Syrup</option>

                <option value="Other">Other</option>
              </select>
            </div>

            {/* Dose */}
            <div>
              <label
                htmlFor="medicine-dose"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Dose
              </label>

              <input
                id="medicine-dose"
                name="dose"
                type="text"
                value={medicineForm.dose}
                onChange={(event) =>
                  handleMedicineFormChange("dose", event.target.value)
                }
                placeholder="e.g. 1 drop"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Frequency */}
            <div>
              <label
                htmlFor="medicine-frequency"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Frequency
              </label>

              <select
                id="medicine-frequency"
                name="frequency"
                value={medicineForm.frequency}
                onChange={handleMedicineFormChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select frequency</option>

                <optgroup label="Prescription Pattern">
                  <option value="1+0+0">1+0+0</option>

                  <option value="0+1+0">0+1+0</option>

                  <option value="0+0+1">0+0+1</option>

                  <option value="1+1+0">1+1+0</option>

                  <option value="1+0+1">1+0+1</option>

                  <option value="0+1+1">0+1+1</option>

                  <option value="1+1+1">1+1+1</option>

                  <option value="1+1+1+1">1+1+1+1</option>
                </optgroup>

                <optgroup label="Standard Frequency">
                  <option value="Once daily">Once daily</option>

                  <option value="Twice daily">Twice daily</option>

                  <option value="Three times daily">Three times daily</option>

                  <option value="Four times daily">Four times daily</option>

                  <option value="Every 2 hours">Every 2 hours</option>

                  <option value="Every 4 hours">Every 4 hours</option>

                  <option value="At bedtime">At bedtime</option>

                  <option value="As directed">As directed</option>
                </optgroup>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="medicine-duration"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Duration
              </label>

              <input
                id="medicine-duration"
                name="duration"
                type="text"
                value={medicineForm.duration}
                onChange={(event) =>
                  handleMedicineFormChange("duration", event.target.value)
                }
                placeholder="e.g. 7 days"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Instructions */}
            <div className="lg:col-span-2">
              <label
                htmlFor="medicine-instructions"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Instructions
              </label>

              <input
                id="medicine-instructions"
                name="instructions"
                type="text"
                value={medicineForm.instructions}
                onChange={(event) =>
                  handleMedicineFormChange("instructions", event.target.value)
                }
                placeholder="e.g. Shake well before use"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAddMedicine}
              disabled={!medicineForm.name.trim()}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add Medicine
            </button>
          </div>
        </div>

        {/* Medicine List */}
        {medicines.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Medicine
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Strength
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Dose
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Frequency
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Duration
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {medicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {medicine.name}
                        </p>

                        {medicine.form && (
                          <p className="text-xs text-gray-500">
                            {medicine.form}
                          </p>
                        )}

                        {medicine.instructions && (
                          <p className="mt-1 text-xs text-gray-500">
                            {medicine.instructions}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {medicine.strength || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {medicine.dose || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {medicine.frequency || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {medicine.duration || "—"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(medicine.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-gray-500">No medicines added yet.</p>
          </div>
        )}
      </section>

      {/* Spectacle Prescription */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Spectacle Prescription
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the spectacle prescription for each eye.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                  Eye
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                  SPH
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                  CYL
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                  AXIS
                </th>

                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                  Visual Acuity
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Right Eye */}
              <tr className="border-b border-gray-100">
                <td className="px-3 py-3 font-medium text-gray-900">
                  Right Eye
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={spectaclePrescription.right.sph}
                    onChange={(event) =>
                      handleSpectacleChange("right", "sph", event.target.value)
                    }
                    placeholder="SPH"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={spectaclePrescription.right.cyl}
                    onChange={(event) =>
                      handleSpectacleChange("right", "cyl", event.target.value)
                    }
                    placeholder="CYL"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={spectaclePrescription.right.axis}
                    onChange={(event) =>
                      handleSpectacleChange("right", "axis", event.target.value)
                    }
                    placeholder="AXIS"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={spectaclePrescription.right.visualAcuity}
                    onChange={(event) =>
                      handleSpectacleChange(
                        "right",
                        "visualAcuity",
                        event.target.value,
                      )
                    }
                    placeholder="6/6"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>
              </tr>

              {/* Left Eye */}
              <tr>
                <td className="px-3 py-3 font-medium text-gray-900">
                  Left Eye
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={spectaclePrescription.left.sph}
                    onChange={(event) =>
                      handleSpectacleChange("left", "sph", event.target.value)
                    }
                    placeholder="SPH"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={spectaclePrescription.left.cyl}
                    onChange={(event) =>
                      handleSpectacleChange("left", "cyl", event.target.value)
                    }
                    placeholder="CYL"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={spectaclePrescription.left.axis}
                    onChange={(event) =>
                      handleSpectacleChange("left", "axis", event.target.value)
                    }
                    placeholder="AXIS"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={spectaclePrescription.left.visualAcuity}
                    onChange={(event) =>
                      handleSpectacleChange(
                        "left",
                        "visualAcuity",
                        event.target.value,
                      )
                    }
                    placeholder="6/6"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Near Addition / PD */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="near-addition"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Near Addition
            </label>

            <input
              id="near-addition"
              type="text"
              value={spectaclePrescription.nearAddition}
              onChange={(event) =>
                handleSpectacleChange("nearAddition", null, event.target.value)
              }
              placeholder="e.g. +1.50"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="pd"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              PD
            </label>

            <input
              id="pd"
              type="text"
              value={spectaclePrescription.pd}
              onChange={(event) =>
                handleSpectacleChange("pd", null, event.target.value)
              }
              placeholder="e.g. 64 mm"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      {/* Advice */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Advice</h2>

        <textarea
          value={advice}
          onChange={(event) => setAdvice(event.target.value)}
          rows={5}
          placeholder="Enter advice for the patient..."
          className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </section>

      {/* Follow Up */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Follow-up</h2>

        <textarea
          value={followUp}
          onChange={(event) => setFollowUp(event.target.value)}
          rows={3}
          placeholder="e.g. Follow up after 2 weeks"
          className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </section>

      {/* Bottom Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSavePrescription}
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : existingPrescription
              ? "Update Prescription"
              : "Save Prescription"}
        </button>
      </div>
    </div>
  );
}

export default PrescriptionBuilder;
