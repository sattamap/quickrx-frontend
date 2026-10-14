import { useState } from "react";
import type { CreatePatientInput, Patient } from "../types/patient";

interface PatientFormProps {
  initialData?: Patient;
  onSubmit: (data: CreatePatientInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function PatientForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PatientFormProps) {
  const [formData, setFormData] = useState<CreatePatientInput>({
    name: initialData?.name ?? "",
    age: initialData?.age ?? 0,
    dateOfBirth: initialData?.dateOfBirth ?? "",
    gender: initialData?.gender ?? "male",
    phone: initialData?.phone ?? "",
    address: initialData?.address ?? "",
    allergies: initialData?.allergies ?? "",
    notes: initialData?.notes ?? "",
    referredBy: {
      name: initialData?.referredBy?.name ?? "",
      designation: initialData?.referredBy?.designation ?? "",
      organization: initialData?.referredBy?.organization ?? "",
      phone: initialData?.referredBy?.phone ?? "",
    },
  });

  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "age" ? Number(value) : value,
    }));

    setError("");
  };

  const handleReferralChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      referredBy: {
        ...previous.referredBy,
        [name]: value,
      },
    }));

    setError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Patient name is required.");
      return;
    }

    if (
      !Number.isInteger(formData.age) ||
      formData.age < 0 ||
      formData.age > 150
    ) {
      setError("Please enter a valid age.");
      return;
    }

    const referredBy = {
      name: formData.referredBy?.name?.trim() ?? "",
      designation: formData.referredBy?.designation?.trim() ?? "",
      organization: formData.referredBy?.organization?.trim() ?? "",
      phone: formData.referredBy?.phone?.trim() ?? "",
    };

    const hasReferralInformation = Object.values(referredBy).some(
      (value) => value !== "",
    );

    onSubmit({
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      allergies: formData.allergies.trim(),
      notes: formData.notes.trim(),
      referredBy: hasReferralInformation ? referredBy : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Enter the patient's basic information.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Patient ID */}
          {initialData && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Patient ID
              </label>

              <input
                type="text"
                value={initialData.patientId}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
              />
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter patient name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Age <span className="text-red-500">*</span>
            </label>

            <input
              type="number"
              name="age"
              min="0"
              max="150"
              value={formData.age || ""}
              onChange={handleChange}
              placeholder="Enter age"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Date of Birth
            </label>

            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth ?? ""}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Gender <span className="text-red-500">*</span>
            </label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Phone
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01712345678"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Contact Information
        </h2>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Address
          </label>

          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            placeholder="Enter patient address"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Referral Information */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900">Referred By</h2>

        <p className="mt-1 text-sm text-gray-500">
          Record the doctor, person, or organization that referred the patient
          to your clinic. All fields are optional.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Referring Doctor / Person */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Doctor / Person Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.referredBy?.name ?? ""}
              onChange={handleReferralChange}
              placeholder="e.g. Dr. Rahman"
              maxLength={150}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Designation
            </label>

            <input
              type="text"
              name="designation"
              value={formData.referredBy?.designation ?? ""}
              onChange={handleReferralChange}
              placeholder="e.g. Consultant Ophthalmologist"
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Hospital / Organization
            </label>

            <input
              type="text"
              name="organization"
              value={formData.referredBy?.organization ?? ""}
              onChange={handleReferralChange}
              placeholder="e.g. City Eye Hospital"
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Referral Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Contact Number
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.referredBy?.phone ?? ""}
              onChange={handleReferralChange}
              placeholder="Referrer's phone number"
              maxLength={30}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Medical Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Record important medical history and allergy information that may be
          relevant to the patient's care.
        </p>

        <div className="mt-4 space-y-4">
          {/* Allergies */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Allergies
            </label>

            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g. Penicillin, Aspirin, Sulfa drugs, food allergies, or None known"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Include known drug, food, or other allergies. If there are no
              known allergies, enter "None known".
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Notes
            </label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="e.g. Previous eye surgery, chronic diseases, current medications, relevant medical history, family history, or other important information"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Add important background information that may help during future
              visits. Avoid entering detailed examination findings here; record
              visit-specific findings in the Visit section.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? "Saving..." : "Save Patient"}
        </button>
      </div>
    </form>
  );
}

export default PatientForm;
