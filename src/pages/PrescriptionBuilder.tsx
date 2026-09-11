import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { initialPatients } from "../data/patients";
import { getVisits } from "../utils/visitStorage";
import {
  getPrescriptionByVisitId,
  savePrescription,
  updatePrescription,
} from "../utils/prescriptionStorage";

import type {
  Prescription,
  PrescriptionMedicine,
  SpectaclePrescription,
} from "../types/prescription";

function PrescriptionBuilder() {
  const navigate = useNavigate();
  const { patientId, visitId } = useParams<{
    patientId: string;
    visitId: string;
  }>();

  /*
   * Find patient and visit
   */
  const patient = initialPatients.find(
    (currentPatient) => currentPatient.id === patientId,
  );

  const visit = getVisits().find(
    (currentVisit) =>
      currentVisit.id === visitId &&
      currentVisit.patientId === patientId,
  );

  /*
   * Load existing prescription, if this visit already has one.
   *
   * This replaces the previous useEffect-based state synchronization.
   */
  const existingPrescription = visitId
    ? getPrescriptionByVisitId(visitId)
    : undefined;

  /*
   * Prescription editing state
   */
  const [editingPrescriptionId] = useState<string | undefined>(
    existingPrescription?.id,
  );

  /*
   * Medicine state
   */
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>(
    existingPrescription?.medicines ?? [],
  );

  const [medicineForm, setMedicineForm] = useState({
    name: "",
    strength: "",
    form: "",
    dose: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  /*
   * Spectacle prescription state
   */
  const [spectaclePrescription, setSpectaclePrescription] =
    useState<SpectaclePrescription>(
      existingPrescription?.spectaclePrescription ?? {
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
      },
    );

  /*
   * Advice and follow-up
   */
  const [advice, setAdvice] = useState(
    existingPrescription?.advice ?? "",
  );

  const [followUp, setFollowUp] = useState(
    existingPrescription?.followUp ?? "",
  );

  /*
   * If patient or visit cannot be found
   */
  if (!patient || !visit) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">
          Prescription unavailable
        </h1>

        <p className="mt-2 text-sm text-red-700">
          The patient or visit record could not be found.
        </p>

        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  /*
   * Medicine handlers
   */
  const handleMedicineChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setMedicineForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddMedicine = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!medicineForm.name.trim()) {
      window.alert("Please enter a medicine name.");
      return;
    }

    const newMedicine: PrescriptionMedicine = {
      id: crypto.randomUUID(),
      name: medicineForm.name.trim(),
      strength: medicineForm.strength.trim(),
      form: medicineForm.form.trim(),
      dose: medicineForm.dose.trim(),
      frequency: medicineForm.frequency.trim(),
      duration: medicineForm.duration.trim(),
      instructions: medicineForm.instructions.trim(),
    };

    setMedicines((current) => [...current, newMedicine]);

    setMedicineForm({
      name: "",
      strength: "",
      form: "",
      dose: "",
      frequency: "",
      duration: "",
      instructions: "",
    });
  };

  const handleRemoveMedicine = (medicineId: string) => {
    setMedicines((current) =>
      current.filter((medicine) => medicine.id !== medicineId),
    );
  };

  /*
   * Spectacle prescription handlers
   */
  const handleSpectacleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    const [eye, field] = name.split(".") as [
      "right" | "left",
      "sph" | "cyl" | "axis" | "visualAcuity",
    ];

    if (eye !== "right" && eye !== "left") {
      return;
    }

    setSpectaclePrescription((current) => ({
      ...current,
      [eye]: {
        ...current[eye],
        [field]: value,
      },
    }));
  };

  const handleSpectacleGeneralChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setSpectaclePrescription((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
   * Save or update prescription
   */
  const handleSavePrescription = () => {
    if (!patient || !visit) {
      window.alert(
        "Patient or visit record could not be found.",
      );
      return;
    }

    if (medicines.length === 0) {
      window.alert("Please add at least one medicine.");
      return;
    }

    const prescription: Prescription = {
      id: editingPrescriptionId ?? crypto.randomUUID(),
      patientId: patient.id,
      visitId: visit.id,
      prescriptionDate:
        existingPrescription?.prescriptionDate ??
        new Date().toISOString().split("T")[0],
      medicines,
      spectaclePrescription,
      advice: advice.trim(),
      followUp: followUp.trim(),
      createdAt:
        existingPrescription?.createdAt ??
        new Date().toISOString(),
    };

    try {
      if (editingPrescriptionId) {
        updatePrescription(prescription);

        window.alert(
          "Prescription updated successfully.",
        );
      } else {
        savePrescription(prescription);

        window.alert(
          "Prescription saved successfully.",
        );
      }

      navigate(
        `/patients/${patient.id}/visits/${visit.id}/prescription/preview`,
      );
    } catch (error) {
      console.error(
        "Failed to save prescription:",
        error,
      );

      window.alert(
        "Unable to save prescription. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/patients/${patient.id}/visits/${visit.id}`,
              )
            }
            className="mb-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Visit
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            {editingPrescriptionId
              ? "Edit Prescription"
              : "New Prescription"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a prescription for this patient visit.
          </p>
        </div>
      </div>

      {/* Patient & Visit Summary */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Patient & Visit
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Patient
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {patient.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Patient ID
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {patient.patientId}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Visit Date
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {visit.visitDate}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Age
            </p>
            <p className="mt-1 text-sm text-gray-900">
              {visit.ageAtVisit} years
            </p>
          </div>
        </div>
      </section>

      {/* Medicines */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Medicines
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add one or more medicines to the prescription.
          </p>
        </div>

        <form
          onSubmit={handleAddMedicine}
          className="mt-5 space-y-5"
        >
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {/* Medicine Name */}
            <div>
              <label
                htmlFor="medicine-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Medicine Name
              </label>

              <input
                id="medicine-name"
                name="name"
                type="text"
                value={medicineForm.name}
                onChange={handleMedicineChange}
                placeholder="e.g. Moxifloxacin"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Strength */}
            <div>
              <label
                htmlFor="medicine-strength"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Strength
              </label>

              <input
                id="medicine-strength"
                name="strength"
                type="text"
                value={medicineForm.strength}
                onChange={handleMedicineChange}
                placeholder="e.g. 0.5%"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                onChange={handleMedicineChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select form</option>
                <option value="Eye Drop">Eye Drop</option>
                <option value="Eye Ointment">
                  Eye Ointment
                </option>
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
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Dose
              </label>

              <input
                id="medicine-dose"
                name="dose"
                type="text"
                value={medicineForm.dose}
                onChange={handleMedicineChange}
                placeholder="e.g. 1 drop"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                onChange={handleMedicineChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select frequency</option>
                <option value="Once daily">
                  Once daily
                </option>
                <option value="Twice daily">
                  Twice daily
                </option>
                <option value="Three times daily">
                  Three times daily
                </option>
                <option value="Four times daily">
                  Four times daily
                </option>
                <option value="Every 2 hours">
                  Every 2 hours
                </option>
                <option value="Every 4 hours">
                  Every 4 hours
                </option>
                <option value="At bedtime">
                  At bedtime
                </option>
                <option value="As directed">
                  As directed
                </option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label
                htmlFor="medicine-duration"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Duration
              </label>

              <input
                id="medicine-duration"
                name="duration"
                type="text"
                value={medicineForm.duration}
                onChange={handleMedicineChange}
                placeholder="e.g. 7 days"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label
              htmlFor="medicine-instructions"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Instructions
            </label>

            <input
              id="medicine-instructions"
              name="instructions"
              type="text"
              value={medicineForm.instructions}
              onChange={handleMedicineChange}
              placeholder="e.g. Shake well before use"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Medicine
          </button>
        </form>

        {/* Added Medicines */}
        {medicines.length > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold text-gray-900">
              Added Medicines
            </h3>

            <div className="mt-3 space-y-3">
              {medicines.map((medicine, index) => (
                <div
                  key={medicine.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {index + 1}. {medicine.name}
                      </p>

                      <div className="mt-2 grid gap-2 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                        {medicine.strength && (
                          <p>
                            <span className="font-medium">
                              Strength:
                            </span>{" "}
                            {medicine.strength}
                          </p>
                        )}

                        {medicine.form && (
                          <p>
                            <span className="font-medium">
                              Form:
                            </span>{" "}
                            {medicine.form}
                          </p>
                        )}

                        {medicine.dose && (
                          <p>
                            <span className="font-medium">
                              Dose:
                            </span>{" "}
                            {medicine.dose}
                          </p>
                        )}

                        {medicine.frequency && (
                          <p>
                            <span className="font-medium">
                              Frequency:
                            </span>{" "}
                            {medicine.frequency}
                          </p>
                        )}

                        {medicine.duration && (
                          <p>
                            <span className="font-medium">
                              Duration:
                            </span>{" "}
                            {medicine.duration}
                          </p>
                        )}

                        {medicine.instructions && (
                          <p className="sm:col-span-2 lg:col-span-3">
                            <span className="font-medium">
                              Instructions:
                            </span>{" "}
                            {medicine.instructions}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveMedicine(medicine.id)
                      }
                      className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Spectacle Prescription */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Spectacle Prescription
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Enter the spectacle prescription for each eye.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[700px] w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-3 py-3 text-sm font-semibold text-gray-700">
                  Eye
                </th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-700">
                  SPH
                </th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-700">
                  CYL
                </th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-700">
                  AXIS
                </th>
                <th className="px-3 py-3 text-sm font-semibold text-gray-700">
                  Visual Acuity
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-3 py-3 text-sm font-medium text-gray-900">
                  Right Eye
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="right.sph"
                    value={spectaclePrescription.right.sph}
                    onChange={handleSpectacleChange}
                    placeholder="SPH"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="right.cyl"
                    value={spectaclePrescription.right.cyl}
                    onChange={handleSpectacleChange}
                    placeholder="CYL"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="right.axis"
                    value={spectaclePrescription.right.axis}
                    onChange={handleSpectacleChange}
                    placeholder="AXIS"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="right.visualAcuity"
                    value={
                      spectaclePrescription.right.visualAcuity
                    }
                    onChange={handleSpectacleChange}
                    placeholder="6/6"
                    className="w-full min-w-[120px] rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>
              </tr>

              <tr>
                <td className="px-3 py-3 text-sm font-medium text-gray-900">
                  Left Eye
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="left.sph"
                    value={spectaclePrescription.left.sph}
                    onChange={handleSpectacleChange}
                    placeholder="SPH"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="left.cyl"
                    value={spectaclePrescription.left.cyl}
                    onChange={handleSpectacleChange}
                    placeholder="CYL"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="left.axis"
                    value={spectaclePrescription.left.axis}
                    onChange={handleSpectacleChange}
                    placeholder="AXIS"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="left.visualAcuity"
                    value={
                      spectaclePrescription.left.visualAcuity
                    }
                    onChange={handleSpectacleChange}
                    placeholder="6/6"
                    className="w-full min-w-[120px] rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Near Addition */}
          <div>
            <label
              htmlFor="near-addition"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Near Addition
            </label>

            <input
              id="near-addition"
              type="text"
              name="nearAddition"
              value={spectaclePrescription.nearAddition}
              onChange={handleSpectacleGeneralChange}
              placeholder="e.g. +2.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* PD */}
          <div>
            <label
              htmlFor="pd"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              PD
            </label>

            <input
              id="pd"
              type="text"
              name="pd"
              value={spectaclePrescription.pd}
              onChange={handleSpectacleGeneralChange}
              placeholder="e.g. 62 mm"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      {/* Advice & Follow-up */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Advice & Follow-up
        </h2>

        <div className="mt-5 space-y-5">
          {/* Advice */}
          <div>
            <label
              htmlFor="advice"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Advice
            </label>

            <textarea
              id="advice"
              value={advice}
              onChange={(event) =>
                setAdvice(event.target.value)
              }
              rows={4}
              placeholder="Enter patient advice..."
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Follow-up */}
          <div>
            <label
              htmlFor="follow-up"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Follow-up
            </label>

            <input
              id="follow-up"
              type="text"
              value={followUp}
              onChange={(event) =>
                setFollowUp(event.target.value)
              }
              placeholder="e.g. Follow up after 2 weeks"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      {/* Bottom Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/patients/${patient.id}/visits/${visit.id}`,
            )
          }
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSavePrescription}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          {editingPrescriptionId
            ? "Update Prescription"
            : "Save Prescription"}
        </button>
      </div>
    </div>
  );
}

export default PrescriptionBuilder;