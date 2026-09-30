import { useEffect, useState} from "react";

import {
  getDoctorProfile,
  updateDoctorProfile,
} from "../services/doctorProfileApi";

import type { DoctorProfile } from "../types/doctorProfile";

const emptyProfile: DoctorProfile = {
  doctorName: "",
  qualification: "",
  specialty: "Ophthalmology",
  registrationNumber: "",
  phone: "",
  email: "",
  clinicName: "",
  clinicAddress: "",
};

function Settings() {
  const [profile, setProfile] =
    useState<DoctorProfile>(emptyProfile);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");

        const savedProfile = await getDoctorProfile();

        if (savedProfile) {
          setProfile(savedProfile);
        }
      } catch (error) {
        console.error("Failed to load doctor profile:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load doctor profile.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleChange = (
    field: keyof DoctorProfile,
    value: string,
  ) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccessMessage("");
    setError("");
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!profile.doctorName.trim()) {
      setError("Doctor name is required.");
      setSuccessMessage("");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");

      const savedProfile = await updateDoctorProfile({
        ...profile,
        doctorName: profile.doctorName.trim(),
        qualification: profile.qualification.trim(),
        specialty: profile.specialty.trim(),
        registrationNumber:
          profile.registrationNumber.trim(),
        phone: profile.phone.trim(),
        email: profile.email.trim(),
        clinicName: profile.clinicName.trim(),
        clinicAddress: profile.clinicAddress.trim(),
      });

      setProfile(savedProfile);

      setSuccessMessage(
        "Doctor profile saved successfully.",
      );
    } catch (error) {
      console.error("Failed to save doctor profile:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save doctor profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your doctor and clinic information.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your doctor and clinic information.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Doctor Profile */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Doctor Profile
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            This information will be used on patient
            prescriptions.
          </p>
        </div>

        <div className="space-y-5 p-5">
          {/* Doctor Name */}
          <div>
            <label
              htmlFor="doctorName"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Doctor Name
            </label>

            <input
              id="doctorName"
              type="text"
              value={profile.doctorName}
              onChange={(event) =>
                handleChange(
                  "doctorName",
                  event.target.value,
                )
              }
              placeholder="Dr. Your Name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Qualification + Specialty */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="qualification"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Qualification
              </label>

              <input
                id="qualification"
                type="text"
                value={profile.qualification}
                onChange={(event) =>
                  handleChange(
                    "qualification",
                    event.target.value,
                  )
                }
                placeholder="MBBS, FCPS"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="specialty"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Specialty
              </label>

              <input
                id="specialty"
                type="text"
                value={profile.specialty}
                onChange={(event) =>
                  handleChange(
                    "specialty",
                    event.target.value,
                  )
                }
                placeholder="Ophthalmology"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Registration Number */}
          <div>
            <label
              htmlFor="registrationNumber"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Registration Number
            </label>

            <input
              id="registrationNumber"
              type="text"
              value={profile.registrationNumber}
              onChange={(event) =>
                handleChange(
                  "registrationNumber",
                  event.target.value,
                )
              }
              placeholder="BMDC registration number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Phone + Email */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Phone
              </label>

              <input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(event) =>
                  handleChange(
                    "phone",
                    event.target.value,
                  )
                }
                placeholder="01XXXXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(event) =>
                  handleChange(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="doctor@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Clinic Name */}
          <div>
            <label
              htmlFor="clinicName"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Clinic / Chamber Name
            </label>

            <input
              id="clinicName"
              type="text"
              value={profile.clinicName}
              onChange={(event) =>
                handleChange(
                  "clinicName",
                  event.target.value,
                )
              }
              placeholder="Clinic or chamber name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Clinic Address */}
          <div>
            <label
              htmlFor="clinicAddress"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Clinic Address
            </label>

            <textarea
              id="clinicAddress"
              value={profile.clinicAddress}
              onChange={(event) =>
                handleChange(
                  "clinicAddress",
                  event.target.value,
                )
              }
              rows={3}
              placeholder="Clinic address"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {successMessage && (
              <p className="text-sm font-medium text-green-600">
                {successMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;