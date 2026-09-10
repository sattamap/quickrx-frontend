import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { initialPatients } from "../data/patients";
import { getVisits } from "../utils/visitStorage";
import type { PrescriptionMedicine } from "../types/prescription";

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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Spectacle Prescription
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Spectacle prescription fields will be added here.
        </p>
      </div>

      {/* Advice & Follow-up */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Advice & Follow-up
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Advice and follow-up fields will be added here.
        </p>
      </div>
    </div>
  );
}

export default PrescriptionBuilder;
