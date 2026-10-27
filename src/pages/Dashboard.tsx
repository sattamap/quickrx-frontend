import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import { getPatients } from "../services/patientApi";
import { getVisits } from "../services/visitApi";
import { getPrescriptions } from "../services/prescriptionApi";
import { useAsyncData } from "../hooks/useAsyncData";
import DoctorQueue from "../components/booking/DoctorQueue";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, error } = useAsyncData(async () => {
    const [patients, visits, prescriptions] = await Promise.all([
      getPatients(),
      getVisits(),
      getPrescriptions(),
    ]);

    return {
      patients,
      visits,
      prescriptions,
    };
  }, []);

  const todayVisitCount = useMemo(() => {
    if (!data) return 0;

    const today = new Date();

    return data.visits.filter((visit) => {
      const visitDate = new Date(visit.visitDate);

      return (
        visitDate.getFullYear() === today.getFullYear() &&
        visitDate.getMonth() === today.getMonth() &&
        visitDate.getDate() === today.getDate()
      );
    }).length;
  }, [data]);

  const recentPatients = useMemo(() => {
    if (!data) return [];

    return [...data.patients]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4)
      .map((patient) => {
        const patientVisits = data.visits
          .filter((visit) => visit.patientId === patient.id)
          .sort(
            (a, b) =>
              new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(),
          );

        return {
          ...patient,
          lastVisit: patientVisits[0]?.visitDate ?? null,
        };
      });
  }, [data]);

  const formatDate = (date: string | null) => {
    if (!date) {
      return "No visits";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    const today = new Date();

    const isToday =
      parsedDate.getFullYear() === today.getFullYear() &&
      parsedDate.getMonth() === today.getMonth() &&
      parsedDate.getDate() === today.getDate();

    if (isToday) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday =
      parsedDate.getFullYear() === yesterday.getFullYear() &&
      parsedDate.getMonth() === yesterday.getMonth() &&
      parsedDate.getDate() === yesterday.getDate();

    if (isYesterday) {
      return "Yesterday";
    }

    return parsedDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const stats = [
    {
      title: "Total Patients",
      value: data ? data.patients.length : "—",
      description: "Registered patients",
    },
    {
      title: "Today's Visits",
      value: data ? todayVisitCount : "—",
      description: "Visits recorded today",
    },
    {
      title: "Prescriptions",
      value: data ? data.prescriptions.length : "—",
      description: "Total prescriptions",
    },
  ];

  const doctorName = user?.name?.trim() || "Doctor";

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, Dr. {doctorName}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your practice today.
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-800">
            Unable to load dashboard
          </h2>

          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, Dr. {doctorName}
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
              {isLoading ? "..." : stat.value}
            </p>

            <p className="mt-1 text-xs text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Today's Patient Queue */}
      <DoctorQueue />

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
            onClick={() => navigate("/patients")}
            className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <p className="font-semibold text-gray-900">Start New Visit</p>

            <p className="mt-1 text-sm text-gray-500">
              Select a patient and begin a new examination.
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
              Recently registered patients
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

        {isLoading ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">
            Loading patients...
          </div>
        ) : recentPatients.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-500">No patients found.</p>

            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Add your first patient
            </button>
          </div>
        ) : (
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
                  <tr
                    key={patient.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <td className="px-5 py-4 font-medium text-gray-700">
                      {patient.patientId}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900">
                        {patient.name}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-gray-600">{patient.age}</td>

                    <td className="px-5 py-4 capitalize text-gray-600">
                      {patient.gender}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(patient.lastVisit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
