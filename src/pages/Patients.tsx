
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PatientForm from "../components/PatientForm";

import type {
  CreatePatientInput,
  Patient,
} from "../types/patient";

import {
  bulkDeletePatients,
  createPatient,
  deletePatient,
  getPatients,
  updatePatient,
} from "../services/patientApi";

import {
  showDeleteConfirmation,
  showError,
  showSuccess,
} from "../utils/alert";

function Patients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<Patient | undefined>();

  const [isLoading, setIsLoading] = useState(true);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getPatients();

        setPatients(data);
      } catch (error) {
        console.error("Failed to load patients:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load patients.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, []);

  // Filter patients by name, patient ID, or phone.
  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      patient.name.toLowerCase().includes(search) ||
      patient.patientId.toLowerCase().includes(search) ||
      patient.phone.toLowerCase().includes(search)
    );
  });

  // Check whether every currently visible patient is selected.
  const allVisibleSelected =
    filteredPatients.length > 0 &&
    filteredPatients.every((patient) =>
      selectedPatientIds.includes(patient.id),
    );

  const handleTogglePatient = (patientId: string) => {
    setSelectedPatientIds((currentIds) =>
      currentIds.includes(patientId)
        ? currentIds.filter((id) => id !== patientId)
        : [...currentIds, patientId],
    );
  };

  // Select or deselect all currently filtered patients.
  const handleToggleSelectAll = (checked: boolean) => {
    const visibleIds = filteredPatients.map((patient) => patient.id);

    setSelectedPatientIds((currentIds) => {
      if (checked) {
        return [...new Set([...currentIds, ...visibleIds])];
      }

      return currentIds.filter((id) => !visibleIds.includes(id));
    });
  };

  const handleClearSelection = () => {
    setSelectedPatientIds([]);
  };

  const handleAddPatient = () => {
    setEditingPatient(undefined);
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleSubmit = async (
    data: CreatePatientInput,
  ) => {
    try {
      setError("");

      if (editingPatient) {
        const updatedPatient = await updatePatient(
          editingPatient.id,
          data,
        );

        setPatients((currentPatients) =>
          currentPatients.map((patient) =>
            patient.id === updatedPatient.id
              ? updatedPatient
              : patient,
          ),
        );

        setIsModalOpen(false);
        setEditingPatient(undefined);

        await showSuccess(
          "Patient information updated successfully.",
        );
      } else {
        const newPatient = await createPatient(data);

        setPatients((currentPatients) => [
          newPatient,
          ...currentPatients,
        ]);

        setIsModalOpen(false);
        setEditingPatient(undefined);

        await showSuccess("Patient added successfully.");
      }
    } catch (error) {
      console.error("Failed to save patient:", error);

      await showError(
        error instanceof Error
          ? error.message
          : "Failed to save patient.",
      );
    }
  };

  // Delete one patient.
  const handleDeletePatient = async (patient: Patient) => {
    const confirmed = await showDeleteConfirmation(
      `Are you sure you want to delete ${patient.name}? This will also permanently delete their visits, prescriptions, and investigations.`,
    );

    if (!confirmed) return;

    try {
      setError("");

      await deletePatient(patient.id);

      setPatients((currentPatients) =>
        currentPatients.filter(
          (currentPatient) => currentPatient.id !== patient.id,
        ),
      );

      setSelectedPatientIds((currentIds) =>
        currentIds.filter((id) => id !== patient.id),
      );

      await showSuccess("Patient deleted successfully.");
    } catch (error) {
      console.error("Failed to delete patient:", error);

      await showError(
        error instanceof Error
          ? error.message
          : "Failed to delete patient.",
      );
    }
  };

  // Delete all selected patients.
  const handleBulkDeletePatients = async () => {
    if (selectedPatientIds.length === 0 || isBulkDeleting) {
      return;
    }

    const selectedCount = selectedPatientIds.length;

    const confirmed = await showDeleteConfirmation(
      `Are you sure you want to delete ${selectedCount} selected patient(s)? This will permanently delete their visits, prescriptions, and investigations as well. This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setIsBulkDeleting(true);

      const result = await bulkDeletePatients(selectedPatientIds);

      // Remove only the IDs confirmed as deleted by the backend.
      const deletedIds = new Set(result.deletedIds);

      setPatients((currentPatients) =>
        currentPatients.filter(
          (patient) => !deletedIds.has(patient.id),
        ),
      );

      setSelectedPatientIds((currentIds) =>
        currentIds.filter((id) => !deletedIds.has(id)),
      );

      await showSuccess(
        `${result.deletedCount} patient(s) and their related medical records deleted successfully.`,
      );
    } catch (error) {
      console.error("Failed to bulk delete patients:", error);

      await showError(
        error instanceof Error
          ? error.message
          : "Failed to delete selected patients.",
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Patients
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your patient records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddPatient}
          disabled={isBulkDeleting}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Patient
        </button>
      </div>

      {/* Initial page-load error */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Search and selection summary */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, patient ID, or phone..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {filteredPatients.length} patient(s) found

            {selectedPatientIds.length > 0 && (
              <span className="ml-2 font-semibold text-blue-600">
                • {selectedPatientIds.length} selected
              </span>
            )}
          </div>

          {selectedPatientIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={isBulkDeleting}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Clear Selection
              </button>

              <button
                type="button"
                onClick={() => void handleBulkDeletePatients()}
                disabled={isBulkDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBulkDeleting
                  ? "Deleting..."
                  : `Delete Selected (${selectedPatientIds.length})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Patient table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No patients found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Select All */}
                  <th className="w-12 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(event) =>
                        handleToggleSelectAll(event.target.checked)
                      }
                      disabled={isBulkDeleting}
                      aria-label="Select all visible patients"
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Patient ID
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Name
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Age
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Gender
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Phone
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredPatients.map((patient) => {
                  const isSelected = selectedPatientIds.includes(
                    patient.id,
                  );

                  return (
                    <tr
                      key={patient.id}
                      className={`hover:bg-gray-50 ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      {/* Patient Checkbox */}
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            handleTogglePatient(patient.id)
                          }
                          disabled={isBulkDeleting}
                          aria-label={`Select ${patient.name}`}
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                        />
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">
                        {patient.patientId}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {patient.name}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {patient.age}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-600">
                        {patient.gender}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {patient.phone || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/patients/${patient.id}`)
                            }
                            disabled={isBulkDeleting}
                            className="rounded-md px-3 py-1.5 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditPatient(patient)}
                            disabled={isBulkDeleting}
                            className="rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDeletePatient(patient)
                            }
                            disabled={isBulkDeleting}
                            className="rounded-md px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient modal */}
      {isModalOpen && (
        <PatientForm
          initialData={editingPatient}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPatient(undefined);
          }}
        />
      )}
    </div>
  );
}

export default Patients;
