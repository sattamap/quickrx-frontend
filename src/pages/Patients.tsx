import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createPatient,
  deletePatient,
  getPatients,
  updatePatient,
} from "../services/Patientservice";
import { useAsyncData } from "../hooks/useAsyncData";
import PatientForm from "../components/PatientForm";

import type { CreatePatientInput, Patient } from "../types/patient";

function Patients() {
  const navigate = useNavigate();

  const {
    data: patients,
    isLoading,
    error,
    reload,
  } = useAsyncData(getPatients, []);

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPatients = (patients ?? []).filter((patient) => {
    const searchTerm = search.toLowerCase();

    return (
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.patientId.toLowerCase().includes(searchTerm) ||
      patient.phone.includes(searchTerm)
    );
  });

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const handleSubmit = async (data: CreatePatientInput) => {
    setIsSubmitting(true);

    try {
      if (editingPatient) {
        await updatePatient({ ...editingPatient, ...data });
      } else {
        await createPatient(data);
      }

      reload();
      handleCloseModal();
    } catch (submitError) {
      console.error("Failed to save patient:", submitError);
      window.alert("Unable to save patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${patient.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deletePatient(patient.id);
      reload();
    } catch (deleteError) {
      console.error("Failed to delete patient:", deleteError);
      window.alert("Unable to delete patient. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your patients and their medical records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by patient name, ID or phone..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Patient Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Patient List</h2>

          <p className="mt-1 text-xs text-gray-500">
            {isLoading
              ? "Loading..."
              : `${filteredPatients.length} patient${
                  filteredPatients.length !== 1 ? "s" : ""
                } found`}
          </p>
        </div>

        {isLoading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">
            Loading patients...
          </div>
        ) : error ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={reload}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Patient ID</th>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Age</th>
                    <th className="px-5 py-3 font-medium">Gender</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-700">
                        {patient.patientId}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {patient.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {patient.address}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {patient.age}
                      </td>

                      <td className="px-5 py-4 capitalize text-gray-600">
                        {patient.gender}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {patient.phone}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/patients/${patient.id}`)}
                            className="font-medium text-blue-600 hover:text-blue-700"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(patient)}
                            className="font-medium text-gray-600 hover:text-gray-900"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePatient(patient)}
                            className="font-medium text-red-600 hover:text-red-700"
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

            {filteredPatients.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="font-medium text-gray-900">No patients found</p>

                <p className="mt-1 text-sm text-gray-500">
                  Try a different search term.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingPatient ? "Edit Patient" : "Add New Patient"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {editingPatient
                    ? "Update patient information."
                    : "Create a new patient record."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="text-2xl leading-none text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-5">
              <PatientForm
                initialData={editingPatient ?? undefined}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;