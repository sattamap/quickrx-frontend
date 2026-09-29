import { useState } from "react";

interface DoctorProfile {
  doctorName: string;
  qualification: string;
  specialty: string;
  registrationNumber: string;
  phone: string;
  email: string;
  clinicName: string;
  clinicAddress: string;
}

const initialProfile: DoctorProfile = {
  doctorName: "Dr. Romel",
  qualification: "MBBS",
  specialty: "Ophthalmology",
  registrationNumber: "",
  phone: "",
  email: "",
  clinicName: "",
  clinicAddress: "",
};

function Settings() {
  const [profile, setProfile] = useState<DoctorProfile>(initialProfile);
  const [saved, setSaved] = useState(false);

  const handleChange = (
    field: keyof DoctorProfile,
    value: string,
  ) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Temporary:
    // We will connect this to the backend later.
    console.log("Doctor profile:", profile);

    setSaved(true);
  };

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
            This information can be used on patient prescriptions.
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
                handleChange("doctorName", event.target.value)
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
                  handleChange("qualification", event.target.value)
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
                  handleChange("specialty", event.target.value)
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
                  handleChange("phone", event.target.value)
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
                  handleChange("email", event.target.value)
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
                handleChange("clinicName", event.target.value)
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
                handleChange("clinicAddress", event.target.value)
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
            {saved && (
              <p className="text-sm font-medium text-green-600">
                Settings saved successfully.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;