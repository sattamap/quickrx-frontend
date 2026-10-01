import { useEffect, useState } from "react";

import {
  getDoctorProfile,
  updateDoctorProfile,
} from "../services/doctorProfileApi";

import {
  getPrescriptionSettings,
  updatePrescriptionSettings,
} from "../services/prescriptionSettingsApi";

import type { DoctorProfile } from "../types/doctorProfile";
import type { PrescriptionSettings } from "../types/prescriptionSettings";

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

const defaultPrescriptionSettings: PrescriptionSettings = {
  defaultAdvice: "",
  defaultFollowUp: "",

  showDoctorPhone: true,
  showDoctorEmail: false,
  showRegistrationNumber: true,
  showClinicAddress: true,

  showPatientId: true,
  showDiagnosis: true,
  showSpectaclePrescription: true,
  showSignature: true,
};

function Settings() {
  const [profile, setProfile] =
    useState<DoctorProfile>(emptyProfile);

  const [prescriptionSettings, setPrescriptionSettings] =
    useState<PrescriptionSettings>(
      defaultPrescriptionSettings,
    );

  const [isLoading, setIsLoading] = useState(true);

  const [isSavingProfile, setIsSavingProfile] =
    useState(false);

  const [isSavingPrescriptionSettings, setIsSavingPrescriptionSettings] =
    useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [savedProfile, savedPrescriptionSettings] =
          await Promise.all([
            getDoctorProfile(),
            getPrescriptionSettings(),
          ]);

        if (savedProfile) {
          setProfile(savedProfile);
        }

        if (savedPrescriptionSettings) {
          setPrescriptionSettings(
            savedPrescriptionSettings,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load settings:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load settings.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const handleProfileChange = (
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

  const handlePrescriptionSettingChange = (
    field: keyof PrescriptionSettings,
    value: string | boolean,
  ) => {
    setPrescriptionSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccessMessage("");
    setError("");
  };

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!profile.doctorName.trim()) {
      setError("Doctor name is required.");
      setSuccessMessage("");
      return;
    }

    try {
      setIsSavingProfile(true);
      setError("");
      setSuccessMessage("");

      const savedProfile =
        await updateDoctorProfile({
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
      console.error(
        "Failed to save doctor profile:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save doctor profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePrescriptionSettingsSubmit =
    async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      try {
        setIsSavingPrescriptionSettings(true);
        setError("");
        setSuccessMessage("");

        const savedSettings =
          await updatePrescriptionSettings({
            ...prescriptionSettings,
            defaultAdvice:
              prescriptionSettings.defaultAdvice.trim(),
            defaultFollowUp:
              prescriptionSettings.defaultFollowUp.trim(),
          });

        setPrescriptionSettings(savedSettings);

        setSuccessMessage(
          "Prescription settings saved successfully.",
        );
      } catch (error) {
        console.error(
          "Failed to save prescription settings:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to save prescription settings.",
        );
      } finally {
        setIsSavingPrescriptionSettings(false);
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
            Manage your doctor, clinic, and prescription
            settings.
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
          Manage your doctor, clinic, and prescription
          settings.
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

      {/* =====================================================
          DOCTOR PROFILE
          ===================================================== */}
      <form
        onSubmit={handleProfileSubmit}
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
                handleProfileChange(
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
                  handleProfileChange(
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
                  handleProfileChange(
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
                handleProfileChange(
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
                  handleProfileChange(
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
                  handleProfileChange(
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
                handleProfileChange(
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
                handleProfileChange(
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

        {/* Doctor Profile Footer */}
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
            disabled={isSavingProfile}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingProfile
              ? "Saving..."
              : "Save Doctor Profile"}
          </button>
        </div>
      </form>

      {/* =====================================================
          PRESCRIPTION SETTINGS
          ===================================================== */}
      <form
        onSubmit={handlePrescriptionSettingsSubmit}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Prescription Settings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Configure default prescription text and
            control which information appears on printed
            prescriptions.
          </p>
        </div>

        <div className="space-y-6 p-5">
          {/* Default Advice */}
          <div>
            <label
              htmlFor="defaultAdvice"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Default Advice
            </label>

            <textarea
              id="defaultAdvice"
              value={
                prescriptionSettings.defaultAdvice
              }
              onChange={(event) =>
                handlePrescriptionSettingChange(
                  "defaultAdvice",
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Example: Use medicines as prescribed and follow the instructions carefully."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              This will be used as the default advice when
              creating a new prescription.
            </p>
          </div>

          {/* Default Follow-up */}
          <div>
            <label
              htmlFor="defaultFollowUp"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Default Follow-up
            </label>

            <input
              id="defaultFollowUp"
              type="text"
              value={
                prescriptionSettings.defaultFollowUp
              }
              onChange={(event) =>
                handlePrescriptionSettingChange(
                  "defaultFollowUp",
                  event.target.value,
                )
              }
              placeholder="Example: Follow up after 2 weeks."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              This will be used as the default follow-up
              when creating a new prescription.
            </p>
          </div>

          {/* Doctor / Clinic Display */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Doctor &amp; Clinic Information
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Choose which doctor and clinic details should
              appear on the printed prescription.
            </p>

            <div className="mt-4 space-y-3">
              <ToggleSetting
                label="Show Doctor Phone"
                description="Display the doctor's phone number."
                checked={
                  prescriptionSettings.showDoctorPhone
                }
                onChange={(checked) =>
                  handlePrescriptionSettingChange(
                    "showDoctorPhone",
                    checked,
                  )
                }
              />

              <ToggleSetting
                label="Show Doctor Email"
                description="Display the doctor's email address."
                checked={
                  prescriptionSettings.showDoctorEmail
                }
                onChange={(checked) =>
                  handlePrescriptionSettingChange(
                    "showDoctorEmail",
                    checked,
                  )
                }
              />

              <ToggleSetting
                label="Show Registration Number"
                description="Display the doctor's registration number."
                checked={
                  prescriptionSettings.showRegistrationNumber
                }
                onChange={(checked) =>
                  handlePrescriptionSettingChange(
                    "showRegistrationNumber",
                    checked,
                  )
                }
              />

              <ToggleSetting
                label="Show Clinic Address"
                description="Display the clinic/chamber address."
                checked={
                  prescriptionSettings.showClinicAddress
                }
                onChange={(checked) =>
                  handlePrescriptionSettingChange(
                    "showClinicAddress",
                    checked,
                  )
                }
              />
            </div>
          </div>

          {/* Prescription Content Display */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Prescription Content
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Choose which patient and clinical information
              should appear on the printed prescription.
            </p>

            <div className="mt-4 space-y-3">
              <ToggleSetting
                label="Show Patient ID"
                description="Display the patient's QuickRx ID."
                checked={
                  prescriptionSettings.showPatientId
                }
                onChange={(checked) =>
                  handlePrescriptionSettingChange(
                    "showPatientId",
                    checked,
                  )
                }
              />

              <ToggleSetting
                label="Show Diagnosis"
                description="Display the visit diagnosis."
                checked={
                  prescriptionSettings.showDiagnosis
                }
                onChange={(checked) =>
                  handlePrescriptionSettingChange(
                    "showDiagnosis",
                    checked,
                  )
                }
              />

              <ToggleSetting
                label="Show Spectacle Prescription"
                description="Display the spectacle/refraction prescription when available."
                checked={
                  prescriptionSettings.showSpectaclePrescription
                }
                onChange={(checked) =>
                  handlePrescriptionSettingChange(
                    "showSpectaclePrescription",
                    checked,
                  )
                }
              />

              <ToggleSetting
                label="Show Signature"
                description="Display the doctor's signature area."
                checked={
                  prescriptionSettings.showSignature
                }
                onChange={(checked) =>
                  handlePrescriptionSettingChange(
                    "showSignature",
                    checked,
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Prescription Settings Footer */}
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
            disabled={isSavingPrescriptionSettings}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingPrescriptionSettings
              ? "Saving..."
              : "Save Prescription Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: ToggleSettingProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />

      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-800">
          {label}
        </span>

        <span className="mt-0.5 block text-xs text-gray-500">
          {description}
        </span>
      </span>
    </label>
  );
}

export default Settings;