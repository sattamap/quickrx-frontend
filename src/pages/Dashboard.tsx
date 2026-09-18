import { useNavigate } from "react-router-dom";

const stats = [
  {
    title: "Total Patients",
    value: "248",
    description: "Registered patients",
  },
  {
    title: "Today's Visits",
    value: "12",
    description: "Scheduled today",
  },
  {
    title: "Prescriptions",
    value: "326",
    description: "Total prescriptions",
  },
];

const recentPatients = [
  {
    id: "PAT-001",
    name: "Rahim Ahmed",
    age: 45,
    gender: "Male",
    lastVisit: "Today",
  },
  {
    id: "PAT-002",
    name: "Nusrat Jahan",
    age: 32,
    gender: "Female",
    lastVisit: "Yesterday",
  },
  {
    id: "PAT-003",
    name: "Karim Hasan",
    age: 58,
    gender: "Male",
    lastVisit: "Aug 20, 2026",
  },
  {
    id: "PAT-004",
    name: "Sadia Akter",
    age: 27,
    gender: "Female",
    lastVisit: "Aug 19, 2026",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, Dr. Romel
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your practice today.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{stat.title}</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>

            <p className="mt-1 text-xs text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/patients")}
            className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <p className="font-semibold text-gray-900">Add New Patient</p>

            <p className="mt-1 text-sm text-gray-500">
              Register a new patient in QuickRx.
            </p>
          </button>

          <button
            type="button"
            className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <p className="font-semibold text-gray-900">Start New Visit</p>

            <p className="mt-1 text-sm text-gray-500">
              Begin an examination and create a prescription.
            </p>
          </button>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">Recent Patients</h2>

            <p className="mt-1 text-xs text-gray-500">
              Recently visited patients
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/patients")}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Patient ID</th>

                <th className="px-5 py-3 font-medium">Patient</th>

                <th className="px-5 py-3 font-medium">Age</th>

                <th className="px-5 py-3 font-medium">Gender</th>

                <th className="px-5 py-3 font-medium">Last Visit</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {recentPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-700">
                    {patient.id}
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-900">
                      {patient.name}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-gray-600">{patient.age}</td>

                  <td className="px-5 py-4 text-gray-600">{patient.gender}</td>

                  <td className="px-5 py-4 text-gray-600">
                    {patient.lastVisit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
