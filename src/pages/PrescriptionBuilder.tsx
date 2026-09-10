import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { initialPatients } from "../data/patients";
import { getVisits } from "../utils/visitStorage";
import type { Prescription, PrescriptionMedicine } from "../types/prescription";
import { savePrescription } from "../utils/prescriptionStorage";

function PrescriptionBuilder() {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);

  const [medicineForm, setMedicineForm] = useState({
    name: "",
    strength: "",
    form: "",
    dose: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  const [spectaclePrescription, setSpectaclePrescription] = useState({
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

  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState("");

  const handleMedicineChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setMedicineForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddMedicine = (event: React.FormEvent<HTMLFormElement>) => {
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

  const handleSpectacleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    const [eye, field] = name.split(".") as [
      "right" | "left",
      "sph" | "cyl" | "axis" | "visualAcuity",
    ];

    if (eye === "right" || eye === "left") {
      setSpectaclePrescription((current) => ({
        ...current,
        [eye]: {
          ...current[eye],
          [field]: value,
        },
      }));
    }
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

const handleSavePrescription = () => {
  if (!patient || !visit) {
    window.alert("Patient or visit record could not be found.");
    return;
  }

  if (medicines.length === 0) {
    window.alert("Please add at least one medicine.");
    return;
  }

  const prescription: Prescription = {
    id: crypto.randomUUID(),
    patientId: patient.id,
    visitId: visit.id,
    prescriptionDate: new Date().toISOString().split("T")[0],
    medicines,
    spectaclePrescription,
    advice: advice.trim(),
    followUp: followUp.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    savePrescription(prescription);

    window.alert("Prescription saved successfully.");

    navigate(`/patients/${patient.id}/visits/${visit.id}`);
  } catch (error) {
    console.error("Failed to save prescription:", error);
    window.alert("Unable to save prescription. Please try again.");
  }
};
  const patient = initialPatients.find(
    (currentPatient) => currentPatient.id === patientId,
  );

  const visit = getVisits().find(
    (currentVisit) =>
      currentVisit.id === visitId && currentVisit.patientId === patientId,
  );

  if (!patient || !visit) {
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
            Prescription context not found
          </h1>

          <p className="mt-1 text-sm text-red-600">
            The patient or visit record could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate(`/patients/${patient.id}/visits/${visit.id}`)}
          className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Visit
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Prescription</h1>

          <p className="mt-1 text-sm text-gray-500">
            Create prescription for {patient.name} ({patient.patientId})
          </p>
        </div>
      </div>

      {/* Patient & Visit Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Patient & Visit</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Patient
            </p>

            <p className="mt-1 text-sm font-medium text-gray-900">
              {patient.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Patient ID
            </p>

            <p className="mt-1 text-sm text-gray-700">{patient.patientId}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Visit Date
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {new Date(visit.visitDate).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Diagnosis
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {visit.diagnosis || "Not recorded"}
            </p>
          </div>
        </div>
      </div>

      {/* Medicines */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Medicines</h2>

          <p className="mt-1 text-sm text-gray-500">
            Add medicines to this prescription.
          </p>
        </div>

        {/* Add Medicine Form */}
        <form
          onSubmit={handleAddMedicine}
          className="mt-5 rounded-lg bg-gray-50 p-4"
        >
          <h3 className="text-sm font-semibold text-gray-900">Add Medicine</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Medicine Name */}
            <div className="lg:col-span-2">
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
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Four times daily">Four times daily</option>
                <option value="Every 2 hours">Every 2 hours</option>
                <option value="Every 4 hours">Every 4 hours</option>
                <option value="At bedtime">At bedtime</option>
                <option value="As directed">As directed</option>
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
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Instructions */}
            <div className="md:col-span-2 lg:col-span-3">
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
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Add Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Add Medicine
              </button>
            </div>
          </div>
        </form>

        {/* Medicine List */}
        {medicines.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Added Medicines
            </h3>

            {medicines.map((medicine, index) => (
              <div
                key={medicine.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {index + 1}. {medicine.name}
                      {medicine.strength && ` ${medicine.strength}`}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {medicine.form || "—"} · {medicine.dose || "—"} ·{" "}
                      {medicine.frequency || "—"} · {medicine.duration || "—"}
                    </p>

                    {medicine.instructions && (
                      <p className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Instructions:</span>{" "}
                        {medicine.instructions}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(medicine.id)}
                    className="self-start text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Spectacle Prescription */}
      <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Spectacle Prescription
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Enter the spectacle prescription for each eye.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-3 font-medium">Eye</th>

                <th className="px-3 py-3 font-medium">SPH</th>

                <th className="px-3 py-3 font-medium">CYL</th>

                <th className="px-3 py-3 font-medium">AXIS</th>

                <th className="px-3 py-3 font-medium">VA</th>
              </tr>
            </thead>

            <tbody>
              {/* Right Eye */}
              <tr className="border-b border-gray-100">
                <td className="px-3 py-3 font-medium text-gray-900">Right</td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="right.sph"
                    value={spectaclePrescription.right.sph}
                    onChange={handleSpectacleChange}
                    placeholder="-1.50"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="right.cyl"
                    value={spectaclePrescription.right.cyl}
                    onChange={handleSpectacleChange}
                    placeholder="-0.50"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="right.axis"
                    value={spectaclePrescription.right.axis}
                    onChange={handleSpectacleChange}
                    placeholder="180"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="right.visualAcuity"
                    value={spectaclePrescription.right.visualAcuity}
                    onChange={handleSpectacleChange}
                    placeholder="6/6"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>
              </tr>

              {/* Left Eye */}
              <tr>
                <td className="px-3 py-3 font-medium text-gray-900">Left</td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="left.sph"
                    value={spectaclePrescription.left.sph}
                    onChange={handleSpectacleChange}
                    placeholder="-1.25"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="left.cyl"
                    value={spectaclePrescription.left.cyl}
                    onChange={handleSpectacleChange}
                    placeholder="-0.25"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="left.axis"
                    value={spectaclePrescription.left.axis}
                    onChange={handleSpectacleChange}
                    placeholder="170"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-3 py-3">
                  <input
                    type="text"
                    name="left.visualAcuity"
                    value={spectaclePrescription.left.visualAcuity}
                    onChange={handleSpectacleChange}
                    placeholder="6/6"
                    className="w-full min-w-[100px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Near Addition and PD */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="nearAddition"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Near Addition
            </label>

            <input
              id="nearAddition"
              name="nearAddition"
              type="text"
              value={spectaclePrescription.nearAddition}
              onChange={handleSpectacleGeneralChange}
              placeholder="e.g. +1.50"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="pd"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Pupillary Distance (PD)
            </label>

            <input
              id="pd"
              name="pd"
              type="text"
              value={spectaclePrescription.pd}
              onChange={handleSpectacleGeneralChange}
              placeholder="e.g. 64 mm"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Advice & Follow-up */}
      <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Advice & Follow-up
        </h2>

        <div className="mt-5 space-y-5">
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
              onChange={(event) => setAdvice(event.target.value)}
              rows={4}
              placeholder="Enter advice for the patient..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="followUp"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Follow-up
            </label>

            <input
              id="followUp"
              type="text"
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
              placeholder="e.g. Review after 4 weeks"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate(`/patients/${patient.id}/visits/${visit.id}`)}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSavePrescription}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Save Prescription
        </button>
      </div>
    </div>
  );
}

export default PrescriptionBuilder;
