import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PatientForm from "../components/PatientForm";

import type {
  CreatePatientInput,
  Patient,
} from "../types/patient";

import {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<Patient | undefined>();
  const [isLoading, setIsLoading] = useState(true);
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

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase();

    return (
      patient.name.toLowerCase().includes(search) ||
      patient.patientId.toLowerCase().includes(search) ||
      patient.phone.toLowerCase().includes(search)
    );
  });

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
        const updatedPatient =
          await updatePatient(
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
        const newPatient =
          await createPatient(data);

        setPatients((currentPatients) => [
          newPatient,
          ...currentPatients,
        ]);

        setIsModalOpen(false);
        setEditingPatient(undefined);

        await showSuccess(
          "Patient added successfully.",
        );
      }
    } catch (error) {
      console.error(
        "Failed to save patient:",
        error,
      );

      await showError(
        error instanceof Error
          ? error.message
          : "Failed to save patient.",
      );
    }
  };

  const handleDeletePatient = async (
    patient: Patient,
  ) => {
    const confirmed =
      await showDeleteConfirmation(
        `Are you sure you want to delete ${patient.name}? This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deletePatient(patient.id);

      setPatients((currentPatients) =>
        currentPatients.filter(
          (currentPatient) =>
            currentPatient.id !== patient.id,
        ),
      );

      await showSuccess(
        "Patient deleted successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to delete patient:",
        error,
      );

      await showError(
        error instanceof Error
          ? error.message
          : "Failed to delete patient.",
      );
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
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Patient
        </button>
      </div>

      {/* Initial page-load error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by name, patient ID, or phone..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
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
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50"
                  >
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
                            navigate(
                              `/patients/${patient.id}`,
                            )
                          }
                          className="rounded-md px-3 py-1.5 text-blue-600 hover:bg-blue-50"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEditPatient(
                              patient,
                            )
                          }
                          className="rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeletePatient(
                              patient,
                            )
                          }
                          className="rounded-md px-3 py-1.5 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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