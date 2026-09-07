import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { initialPatients } from "../data/patients";

function Patients() {
  const navigate = useNavigate();

  const [patients] = useState(initialPatients);
  const [search, setSearch] = useState("");

  const filteredPatients = patients.filter((patient) => {
    const searchTerm = search.toLowerCase();

    return (
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.patientId.toLowerCase().includes(searchTerm) ||
      patient.phone.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Patients
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your patients and their medical records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/patients/new")}
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
          <h2 className="font-semibold text-gray-900">
            Patient List
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {filteredPatients.length} patient
            {filteredPatients.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">
                  Patient ID
                </th>

                <th className="px-5 py-3 font-medium">
                  Patient
                </th>

                <th className="px-5 py-3 font-medium">
                  Age
                </th>

                <th className="px-5 py-3 font-medium">
                  Gender
                </th>

                <th className="px-5 py-3 font-medium">
                  Phone
                </th>

                <th className="px-5 py-3 font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-gray-50"
                >
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
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/patients/${patient.id}`)
                      }
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="font-medium text-gray-900">
              No patients found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try a different search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Patients;