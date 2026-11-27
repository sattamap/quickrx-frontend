import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { getPatientById } from "../services/patientApi.ts";

import { getVisitById } from "../services/visitApi.ts";

import {
  createPrescription,
  getPrescriptionByVisitId,
  updatePrescription,
} from "../services/prescriptionApi.ts";

import type { Patient } from "../types/patient.ts";

import type { Visit } from "../types/visit.ts";

import type {
  Prescription,
  PrescriptionMedicine,
  SpectaclePrescription,
} from "../types/prescription.ts";

import { getPrescriptionSettings } from "../services/prescriptionSettingsApi.ts";

import {
  createInvestigation,
  getPatientInvestigations,
  updateInvestigation,
  deleteInvestigation,
  type Investigation,
  type InvestigationEye,
} from "../services/investigationApi.ts";

import { searchMedicines, type Medicine } from "../utils/medicineData.ts";

import {
  showError,
  showSuccess,
  showWarning,
  showDeleteConfirmation,
} from "../utils/alert.ts";

const emptySpectaclePrescription: SpectaclePrescription = {
  right: {
    sph: "",
    cyl: "",
    axis: "",
    visualAcuity: "",
  },

  left: {
    sph: "",
    cyl: "",
    axis: "",
    visualAcuity: "",
  },

  nearAddition: "",
  pd: "",
};

interface MedicineForm {
  name: string;
  strength: string;
  form: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const emptyMedicineForm: MedicineForm = {
  name: "",
  strength: "",
  form: "",
  dose: "",
  frequency: "",
  duration: "",
  instructions: "",
};

const prescriptionSuggestions = {
  investigations: [
    {
      category: "Basic Ophthalmology Examinations",
      items: [
        "Visual Acuity Test",
        "Refraction",
        "Slit Lamp Examination",
        "Intraocular Pressure (IOP) Measurement",
        "Fundus Examination",
        "Dilated Fundus Examination",
      ],
    },
    {
      category: "Retinal and Optic Nerve Investigations",
      items: [
        "OCT Macula",
        "OCT RNFL",
        "OCT Optic Nerve Head",
        "Fundus Photography",
        "Fundus Fluorescein Angiography (FFA)",
        "Visual Field Test (Perimetry)",
        "B-Scan Ultrasonography",
        "A-Scan Biometry",
      ],
    },
    {
      category: "Cornea, Glaucoma and Other Eye Investigations",
      items: [
        "Pachymetry",
        "Gonioscopy",
        "Corneal Topography",
        "Keratometry",
        "Specular Microscopy",
        "Schirmer Test",
        "Tear Film Break-Up Time (TBUT)",
        "Dry Eye Assessment",
        "Color Vision Test",
        "Amsler Grid Test",
      ],
    },
    {
      category: "General Blood and Laboratory Investigations",
      items: [
        "Complete Blood Count (CBC)",
        "ESR (Erythrocyte Sedimentation Rate)",
        "CRP (C-Reactive Protein)",
        "Blood Grouping and Rh Typing",
      ],
    },
    {
      category: "Blood Glucose / Diabetes Investigations",
      items: [
        "Fasting Blood Glucose (FBS)",
        "Random Blood Glucose (RBS)",
        "2-Hour Postprandial Blood Glucose (2HPP / PPBS)",
        "HbA1c (Glycated Hemoglobin)",
        "Oral Glucose Tolerance Test (OGTT)",
      ],
    },
    {
      category: "Lipid and Metabolic Investigations",
      items: [
        "Lipid Profile",
        "Serum Uric Acid",
        "Thyroid Function Test (TFT)",
      ],
    },
    {
      category: "Kidney and Liver Investigations",
      items: [
        "Renal Function Test (RFT)",
        "Serum Creatinine",
        "Blood Urea",
        "Serum Electrolytes",
        "Liver Function Test (LFT)",
        "Urine R/E (Routine Examination)",
      ],
    },
    {
      category: "Cardiac and General Investigations",
      items: ["ECG (Electrocardiogram)", "Chest X-Ray (CXR)"],
    },
  ],

  advice: [
    "Avoid rubbing your eyes",
    "চোখ ঘষা থেকে বিরত থাকুন",
    "Maintain proper eye hygiene",
    "চোখের পরিষ্কার-পরিচ্ছন্নতা বজায় রাখুন",
    "Wash hands before applying eye drops",
    "ড্রপ ব্যবহারের আগে হাত ধুয়ে নিন",
    "Avoid dust and smoke",
    "ধুলাবালি ও ধোঁয়া এড়িয়ে চলুন",
    "Wear protective eyewear when needed",
    "প্রয়োজনে চোখের সুরক্ষামূলক চশমা ব্যবহার করুন",
    "Take regular breaks during screen use",
    "দীর্ঘক্ষণ স্ক্রিন ব্যবহারের মাঝে বিরতি নিন",
    "Use prescribed medicines as directed",
    "চিকিৎসকের নির্দেশ অনুযায়ী ওষুধ ব্যবহার করুন",
  ],

  followUp: [
    "Follow up after 1 week",
    "Follow up after 2 weeks",
    "Follow up after 3 weeks",
    "Follow up after 4 weeks",
    "Follow up after 6 weeks",
    "Follow up after 2 months",
    "Follow up after 3 months",
    "১ সপ্তাহ পর পুনরায় দেখাবেন",
    "২ সপ্তাহ পর পুনরায় দেখাবেন",
    "৩ সপ্তাহ পর পুনরায় দেখাবেন",
    "৪ সপ্তাহ পর পুনরায় দেখাবেন",
    "৬ সপ্তাহ পর পুনরায় দেখাবেন",
    "২ মাস পর পুনরায় দেখাবেন",
    "৩ মাস পর পুনরায় দেখাবেন",
    "আগে সমস্যা হলে দ্রুত যোগাযোগ করবেন",
  ],
};

const medicineSuggestions = {
  form: [
    "Eye Drop",
    "চোখের ড্রপ",
    "Eye Ointment",
    "চোখের মলম",
    "Tablet",
    "ট্যাবলেট",
    "Capsule",
    "ক্যাপসুল",
    "Syrup",
    "সিরাপ",
    "Gel",
    "জেল",
    "Other",
    "অন্যান্য",
  ],

  dose: [
    "1 drop",
    "2 drops",
    "১ ফোঁটা",
    "২ ফোঁটা",
    "1 tablet",
    "2 tablets",
    "১টি ট্যাবলেট",
    "২টি ট্যাবলেট",
    "1 capsule",
    "১টি ক্যাপসুল",
    "5 ml",
    "10 ml",
    "৫ মি.লি.",
    "১০ মি.লি.",
    "Apply a thin layer",
    "পাতলা করে লাগাতে হবে",
  ],

  frequency: [
    "1+0+0",
    "0+1+0",
    "0+0+1",
    "1+1+0",
    "1+0+1",
    "0+1+1",
    "1+1+1",
    "1+1+1+1",
    "Once daily",
    "দিনে ১ বার",
    "Twice daily",
    "দিনে ২ বার",
    "Three times daily",
    "দিনে ৩ বার",
    "Four times daily",
    "দিনে ৪ বার",
    "Every 2 hours",
    "প্রতি ২ ঘণ্টা পরপর",
    "Every 4 hours",
    "প্রতি ৪ ঘণ্টা পরপর",
    "At bedtime",
    "রাতে ঘুমানোর আগে",
    "As needed",
    "প্রয়োজন অনুযায়ী",
    "As directed",
    "নির্দেশ অনুযায়ী",
  ],

  duration: [
    "3 days",
    "5 days",
    "7 days",
    "10 days",
    "14 days",
    "21 days",
    "1 month",
    "2 months",
    "3 months",
    "৩ দিন",
    "৫ দিন",
    "৭ দিন",
    "১০ দিন",
    "১৪ দিন",
    "১ মাস",
    "২ মাস",
    "৩ মাস",
    "Continue until review",
    "পরবর্তী ফলোআপ পর্যন্ত",
  ],

  instructions: [
    "Shake well before use",
    "ব্যবহারের আগে ভালোভাবে ঝাঁকিয়ে নিন",
    "Apply to affected eye",
    "আক্রান্ত চোখে ব্যবহার করুন",
    "For both eyes",
    "উভয় চোখে ব্যবহার করুন",
    "For right eye",
    "ডান চোখে ব্যবহার করুন",
    "For left eye",
    "বাম চোখে ব্যবহার করুন",
    "Close eyes for 1 minute after instillation",
    "ড্রপ দেওয়ার পর ১ মিনিট চোখ বন্ধ রাখুন",
    "Do not touch the dropper tip",
    "ড্রপারের মুখ চোখে বা অন্য কোথাও স্পর্শ করাবেন না",
    "Apply at bedtime",
    "রাতে ঘুমানোর আগে ব্যবহার করুন",
    "Use as directed",
    "চিকিৎসকের নির্দেশ অনুযায়ী ব্যবহার করুন",
  ],
};

type MedicineChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement>;

const formatDateTime = (value: string): string => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${formattedDate}, ${formattedTime}`;
};

function PrescriptionBuilder() {
  const navigate = useNavigate();

  const { patientId, visitId } = useParams<{
    patientId: string;
    visitId: string;
  }>();

  const [patient, setPatient] = useState<Patient | null>(null);

  const [visit, setVisit] = useState<Visit | null>(null);

  const [existingPrescription, setExistingPrescription] =
    useState<Prescription | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [loadError, setLoadError] = useState("");

  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);

  const [medicineForm, setMedicineForm] =
    useState<MedicineForm>(emptyMedicineForm);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const medicineInputRef = useRef<HTMLInputElement | null>(null);

  const [spectaclePrescription, setSpectaclePrescription] =
    useState<SpectaclePrescription>(emptySpectaclePrescription);

  const [advice, setAdvice] = useState("");

  const [followUp, setFollowUp] = useState("");

  interface InvestigationDraft {
    localId: string;
    investigationId?: string;
    testName: string;
    eye: InvestigationEye;
    status?: Investigation["status"];
    result?: string;
    testDate?: string;
  }

  const [investigations, setInvestigations] = useState<InvestigationDraft[]>(
    [],
  );

  const [originalInvestigationIds, setOriginalInvestigationIds] = useState<
    string[]
  >([]);

  const [investigationTestName, setInvestigationTestName] = useState("");
  const [showInvestigationSuggestions, setShowInvestigationSuggestions] =
    useState(false);
  const filteredInvestigationGroups = prescriptionSuggestions.investigations
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.toLowerCase().includes(investigationTestName.trim().toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const [investigationEye, setInvestigationEye] =
    useState<InvestigationEye>("OU");

  /*
   * Load patient, visit, existing prescription,
   * prescription settings, and investigations.
   */
  useEffect(() => {
    const loadData = async () => {
      if (!patientId || !visitId) {
        setLoadError("Patient or visit information is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const [
          patientData,
          visitData,
          prescriptionData,
          prescriptionSettings,
          investigationData,
        ] = await Promise.all([
          getPatientById(patientId),
          getVisitById(visitId),
          getPrescriptionByVisitId(visitId),
          getPrescriptionSettings(),
          getPatientInvestigations(patientId),
        ]);

        /*
         * Verify that the requested visit belongs
         * to the requested patient.
         */
        if (visitData.patientId !== patientData.id) {
          throw new Error("This visit does not belong to this patient.");
        }

        /*
         * Only investigations ordered from this visit
         * belong in this Prescription Builder.
         */
        const visitInvestigations = investigationData.filter(
          (investigation) =>
            investigation.orderedVisitId === visitId &&
            investigation.status !== "cancelled",
        );

        setInvestigations(
          visitInvestigations.map((investigation) => ({
            localId: investigation._id,
            investigationId: investigation._id,
            testName: investigation.testName,
            eye: investigation.eye,
            status: investigation.status,
            result: investigation.result,
            testDate: investigation.testDate,
          })),
        );

        setOriginalInvestigationIds(
          visitInvestigations.map((investigation) => investigation._id),
        );

        setPatient(patientData);

        setVisit(visitData);

        setExistingPrescription(prescriptionData);

        /*
         * Hydrate the form directly from the API result.
         */
        if (prescriptionData) {
          setMedicines(prescriptionData.medicines);

          setSpectaclePrescription(prescriptionData.spectaclePrescription);

          setAdvice(prescriptionData.advice);

          setFollowUp(prescriptionData.followUp);
        } else {
          setMedicines([]);

          setSpectaclePrescription(emptySpectaclePrescription);

          setAdvice(prescriptionSettings.defaultAdvice);

          setFollowUp(prescriptionSettings.defaultFollowUp);
        }
      } catch (error) {
        console.error("Failed to load prescription builder data:", error);

        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load prescription data.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [patientId, visitId]);

  /*
   * Medicine form change handler.
   *
   * Supports BOTH:
   *
   * 1. Direct field/value:
   *    handleMedicineFormChange("name", value)
   *
   * 2. React onChange:
   *    onChange={handleMedicineFormChange}
   */
  const handleMedicineFormChange = (
    fieldOrEvent: keyof MedicineForm | MedicineChangeEvent,
    value?: string,
  ) => {
    if (typeof fieldOrEvent === "string") {
      setMedicineForm((current) => ({
        ...current,
        [fieldOrEvent]: value ?? "",
      }));

      return;
    }

    const { name, value: eventValue } = fieldOrEvent.target;

    if (
      name !== "name" &&
      name !== "strength" &&
      name !== "form" &&
      name !== "dose" &&
      name !== "frequency" &&
      name !== "duration" &&
      name !== "instructions"
    ) {
      return;
    }

    setMedicineForm((current) => ({
      ...current,
      [name]: eventValue,
    }));
  };

  /*
   * Search the real medicine database.
   */
  const filteredMedicineSuggestions = searchMedicines(medicineForm.name, 20);

  /*
   * Select medicine from medicine database.
   *
   * Automatically fills:
   * - Name
   * - Strength
   *
   * The doctor still chooses/enters:
   * - Form
   * - Dose
   * - Frequency
   * - Duration
   * - Instructions
   */
  const handleSelectMedicineSuggestion = (medicine: Medicine) => {
    setMedicineForm((current) => ({
      ...current,
      name: medicine.name,
      strength: medicine.strength,
    }));

    setShowSuggestions(false);

    setTimeout(() => {
      medicineInputRef.current?.focus();
    }, 0);
  };

  const handleAddMedicine = async () => {
    if (!medicineForm.name.trim()) {
      await showWarning("Please enter or select a medicine name.");

      return;
    }

    const medicine: PrescriptionMedicine = {
      id: crypto.randomUUID(),
      name: medicineForm.name.trim(),
      strength: medicineForm.strength.trim(),
      form: medicineForm.form.trim(),
      dose: medicineForm.dose.trim(),
      frequency: medicineForm.frequency.trim(),
      duration: medicineForm.duration.trim(),
      instructions: medicineForm.instructions.trim(),
    };

    setMedicines((current) => [...current, medicine]);

    setMedicineForm(emptyMedicineForm);

    setShowSuggestions(false);
  };

  const handleRemoveMedicine = async (id: string) => {
    const medicine = medicines.find((item) => item.id === id);

    const confirmed = await showDeleteConfirmation(
      medicine
        ? `Remove "${medicine.name}" from this prescription?`
        : "Remove this medicine from the prescription?",
    );

    if (!confirmed) {
      return;
    }

    setMedicines((current) => current.filter((item) => item.id !== id));
  };

  /*
   * Spectacle prescription handler.
   */
  const handleSpectacleChange = (
    section: "right" | "left" | "nearAddition" | "pd",
    field: keyof SpectaclePrescription["right"] | null,
    value: string,
  ) => {
    setSpectaclePrescription((current) => {
      if (section === "right" || section === "left") {
        if (!field) {
          return current;
        }

        return {
          ...current,

          [section]: {
            ...current[section],
            [field]: value,
          },
        };
      }

      return {
        ...current,
        [section]: value,
      };
    });
  };

  /*
   * Add a new investigation to the current prescription.
   *
   * This is only a local draft at this stage.
   * The investigation is created in MongoDB when
   * the prescription is saved.
   */
  const handleAddInvestigation = async () => {
    const testName = investigationTestName.trim();

    if (!testName) {
      await showWarning("Please enter an investigation/test name.");

      return;
    }

    const alreadyExists = investigations.some(
      (investigation) =>
        investigation.testName.toLowerCase() === testName.toLowerCase() &&
        investigation.eye === investigationEye,
    );

    if (alreadyExists) {
      await showWarning(
        "This investigation has already been added for this eye.",
      );

      return;
    }

    setInvestigations((current) => [
      ...current,
      {
        localId: crypto.randomUUID(),
        testName,
        eye: investigationEye,
        status: "ordered",
      },
    ]);

    setInvestigationTestName("");

    setInvestigationEye("OU");
  };

  /*
   * Remove an investigation from the current prescription.
   *
   * Completed/reviewed investigations cannot be removed
   * from this builder.
   */
  const handleRemoveInvestigation = async (
    investigation: InvestigationDraft,
  ) => {
    if (
      investigation.status === "completed" ||
      investigation.status === "reviewed"
    ) {
      await showWarning(
        "Completed or reviewed investigations cannot be removed here.",
      );

      return;
    }

    const confirmed = await showDeleteConfirmation(
      `Remove "${investigation.testName}" from the advised investigations?`,
    );

    if (!confirmed) {
      return;
    }

    setInvestigations((current) =>
      current.filter((item) => item.localId !== investigation.localId),
    );
  };

  /*
   * Save / update prescription.
   */
  const handleSavePrescription = async () => {
    const wasExistingPrescription = Boolean(existingPrescription?.id);

    if (!patient || !visit) {
      await showError("Patient or visit information is missing.");

      return;
    }

    try {
      setIsSaving(true);

      setLoadError("");

      const prescriptionData = {
        patientId: patient.id,

        visitId: visit.id,

        prescriptionDate:
          existingPrescription?.prescriptionDate ?? new Date().toISOString(),

        medicines,

        spectaclePrescription,

        advice: advice.trim(),

        followUp: followUp.trim(),
      };

      let savedPrescription: Prescription;

      if (existingPrescription?.id) {
        savedPrescription = await updatePrescription(
          existingPrescription.id,
          prescriptionData,
        );
      } else {
        savedPrescription = await createPrescription(prescriptionData);
      }

      // Preserve the saved ID if a later investigation request fails.
      setExistingPrescription(savedPrescription);

      /*
       * Synchronize investigations for this visit.
       *
       * New investigations are created.
       * Existing editable investigations are updated.
       * Removed investigations are permanently deleted.
       * Completed/reviewed investigations remain unchanged.
       */

      const currentInvestigationIds = investigations
        .map((investigation) => investigation.investigationId)
        .filter((id): id is string => Boolean(id));

      const removedInvestigationIds = originalInvestigationIds.filter(
        (id) => !currentInvestigationIds.includes(id),
      );

      /*
       * Permanently delete investigations removed from the builder.
       *
       * Process sequentially so successful deletions are reflected
       * in state before attempting the next deletion.
       */
      for (const investigationId of removedInvestigationIds) {
        await deleteInvestigation(investigationId);

        setOriginalInvestigationIds((current) =>
          current.filter((id) => id !== investigationId),
        );
      }

      /*
       * Create/update current investigations.
       *
       * IMPORTANT:
       *
       * Newly-created investigations are returned from
       * the API and their MongoDB IDs are stored in the
       * local state.
       *
       * This prevents duplicate investigation creation
       * when the prescription is saved again.
       */
      const savedInvestigations: InvestigationDraft[] = [];

      for (const investigation of investigations) {
        // Update an existing investigation.
        if (investigation.investigationId) {
          // Completed/reviewed investigations remain unchanged.
          if (
            investigation.status === "completed" ||
            investigation.status === "reviewed"
          ) {
            savedInvestigations.push(investigation);
            continue;
          }

          const updatedInvestigation = await updateInvestigation(
            investigation.investigationId,
            {
              testName: investigation.testName.trim(),
              eye: investigation.eye,
            },
          );

          const updatedDraft: InvestigationDraft = {
            ...investigation,
            testName: updatedInvestigation.testName,
            eye: updatedInvestigation.eye,
            status: updatedInvestigation.status,
          };

          savedInvestigations.push(updatedDraft);

          // Preserve the successful update if a later request fails.
          setInvestigations((current) =>
            current.map((item) =>
              item.localId === updatedDraft.localId ? updatedDraft : item,
            ),
          );

          continue;
        }

        // Create a new investigation.
        const createdInvestigation = await createInvestigation({
          patientId: patient.id,
          orderedVisitId: visit.id,
          testName: investigation.testName.trim(),
          eye: investigation.eye,
          orderedDate: visit.visitDate,
          result: "",
          notes: "",
          status: "ordered",
        });

        const createdDraft: InvestigationDraft = {
          ...investigation,
          localId: createdInvestigation._id,
          investigationId: createdInvestigation._id,
          status: createdInvestigation.status,
          result: createdInvestigation.result,
          testDate: createdInvestigation.testDate,
        };

        savedInvestigations.push(createdDraft);

        // Store the real database ID immediately.
        setInvestigations((current) =>
          current.map((item) =>
            item.localId === investigation.localId ? createdDraft : item,
          ),
        );

        setOriginalInvestigationIds((current) =>
          current.includes(createdInvestigation._id)
            ? current
            : [...current, createdInvestigation._id],
        );
      }

      /*
       * Keep the investigation state synchronized with
       * the database after all requests succeed.
       */
      setInvestigations(savedInvestigations);

      setOriginalInvestigationIds(
        savedInvestigations
          .map((investigation) => investigation.investigationId)
          .filter((id): id is string => Boolean(id)),
      );

      await showSuccess(
        wasExistingPrescription
          ? "Prescription updated successfully."
          : "Prescription saved successfully.",
      );

      navigate(
        `/patients/${patient.id}/visits/${visit.id}/prescription/preview`,
      );
    } catch (error) {
      console.error("Failed to save prescription:", error);

      const message =
        error instanceof Error ? error.message : "Failed to save prescription.";

      setLoadError(message);

      await showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * Navigate back to the visit details page.
   */
  const handleBack = () => {
    if (!patient || !visit) {
      navigate(-1);
      return;
    }

    navigate(`/patients/${patient.id}/visits/${visit.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading prescription builder...
        </div>
      </div>
    );
  }

  if (loadError && (!patient || !visit)) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-semibold text-red-700">
            Unable to load prescription
          </h2>

          <p className="mt-1 whitespace-pre-line text-sm text-red-600">
            {loadError}
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!patient || !visit) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Back
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Prescription Builder
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create prescription for {patient.name}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
            <span>
              Patient ID:{" "}
              <span className="font-medium text-slate-900">
                {patient.patientId}
              </span>
            </span>

            <span>
              Visit Date:{" "}
              <span className="font-medium text-slate-900">
                {formatDateTime(visit.visitDate)}
              </span>
            </span>

            {existingPrescription && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Existing prescription
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSavePrescription}
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? "Saving..."
            : existingPrescription
              ? "Update Prescription"
              : "Save Prescription"}
        </button>
      </div>

      {loadError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="whitespace-pre-line text-sm text-red-600">
            {loadError}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Patient / Visit Summary */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Patient & Visit
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
            {/* Patient */}
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Patient
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                {patient.name}
              </p>
            </div>

            {/* Age */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Age
              </p>
              <p className="mt-1 text-sm text-slate-700">{patient.age}</p>
            </div>

            {/* Gender */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Gender
              </p>
              <p className="mt-1 text-sm capitalize text-slate-700">
                {patient.gender}
              </p>
            </div>

            {/* Visit Date */}
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Visit Date
              </p>
              <p className="mt-1 break-words text-sm text-slate-700">
                {formatDateTime(visit.visitDate)}
              </p>
            </div>

            {/* Referred By */}
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Referred By
              </p>
              <p className="mt-1 break-words text-sm font-medium text-slate-900">
                {patient.referredBy?.name || "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Medicines */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Medicines</h2>

            <p className="mt-1 text-sm text-gray-500">
              Add prescribed medicines and instructions.
            </p>
          </div>

          {/* Medicine Form */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Medicine Name */}
              <div className="relative lg:col-span-2">
                <label
                  htmlFor="medicine-name"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Medicine Name
                </label>

                <input
                  ref={medicineInputRef}
                  id="medicine-name"
                  name="name"
                  type="text"
                  value={medicineForm.name}
                  onChange={(event) => {
                    handleMedicineFormChange("name", event.target.value);

                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search medicine name or generic..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {showSuggestions &&
                  medicineForm.name.trim() &&
                  filteredMedicineSuggestions.length > 0 && (
                    <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {filteredMedicineSuggestions.map((medicine) => (
                        <li key={medicine.id}>
                          <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() =>
                              handleSelectMedicineSuggestion(medicine)
                            }
                            className="w-full px-3 py-2.5 text-left hover:bg-gray-50"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {medicine.name}{" "}
                              {medicine.strength && (
                                <span className="font-normal text-gray-500">
                                  ({medicine.strength})
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-gray-500">
                              {medicine.generic} · {medicine.company}
                              {medicine.price !== null &&
                                ` · ৳${medicine.price}`}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                {showSuggestions &&
                  medicineForm.name.trim() &&
                  filteredMedicineSuggestions.length === 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-500 shadow-lg">
                      No matching medicines found.
                    </div>
                  )}
              </div>

              {/* Strength */}
              <div>
                <label
                  htmlFor="medicine-strength"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Strength
                </label>

                <input
                  id="medicine-strength"
                  name="strength"
                  type="text"
                  value={medicineForm.strength}
                  onChange={(event) =>
                    handleMedicineFormChange("strength", event.target.value)
                  }
                  placeholder="e.g. 0.5%"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Form */}
              <div>
                <label
                  htmlFor="medicine-form"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Form
                </label>

                <input
                  id="medicine-form"
                  name="form"
                  type="text"
                  list="medicine-form-options"
                  value={medicineForm.form}
                  onChange={(event) =>
                    handleMedicineFormChange("form", event.target.value)
                  }
                  placeholder="Select or type form"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <datalist id="medicine-form-options">
                  {medicineSuggestions.form.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              {/* Dose */}
              <div>
                <label
                  htmlFor="medicine-dose"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Dose
                </label>

                <input
                  id="medicine-dose"
                  name="dose"
                  type="text"
                  list="medicine-dose-options"
                  value={medicineForm.dose}
                  onChange={(event) =>
                    handleMedicineFormChange("dose", event.target.value)
                  }
                  placeholder="Select or type dose"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <datalist id="medicine-dose-options">
                  {medicineSuggestions.dose.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              {/* Frequency */}
              <div>
                <label
                  htmlFor="medicine-frequency"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Frequency
                </label>

                <input
                  id="medicine-frequency"
                  name="frequency"
                  type="text"
                  list="medicine-frequency-options"
                  value={medicineForm.frequency}
                  onChange={(event) =>
                    handleMedicineFormChange("frequency", event.target.value)
                  }
                  placeholder="Select or type frequency"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <datalist id="medicine-frequency-options">
                  {medicineSuggestions.frequency.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
              {/* Duration */}
              <div>
                <label
                  htmlFor="medicine-duration"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Duration
                </label>

                <input
                  id="medicine-duration"
                  name="duration"
                  type="text"
                  list="medicine-duration-options"
                  value={medicineForm.duration}
                  onChange={(event) =>
                    handleMedicineFormChange("duration", event.target.value)
                  }
                  placeholder="Select or type duration"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <datalist id="medicine-duration-options">
                  {medicineSuggestions.duration.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              {/* Instructions */}
              <div className="lg:col-span-2">
                <label
                  htmlFor="medicine-instructions"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Instructions
                </label>

                <input
                  id="medicine-instructions"
                  name="instructions"
                  type="text"
                  list="medicine-instructions-options"
                  value={medicineForm.instructions}
                  onChange={(event) =>
                    handleMedicineFormChange("instructions", event.target.value)
                  }
                  placeholder="Select or type instructions"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <datalist id="medicine-instructions-options">
                  {medicineSuggestions.instructions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleAddMedicine}
                disabled={!medicineForm.name.trim()}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Add Medicine
              </button>
            </div>
          </div>

          {/* Medicine List */}
          {medicines.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Medicine
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Strength
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Dose
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Frequency
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Duration
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {medicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {medicine.name}
                          </p>

                          {medicine.form && (
                            <p className="text-xs text-gray-500">
                              {medicine.form}
                            </p>
                          )}

                          {medicine.instructions && (
                            <p className="mt-1 text-xs text-gray-500">
                              {medicine.instructions}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {medicine.strength || "—"}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {medicine.dose || "—"}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {medicine.frequency || "—"}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {medicine.duration || "—"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(medicine.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="text-sm text-gray-500">No medicines added yet.</p>
            </div>
          )}
        </section>

        {/* Spectacle Prescription */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Spectacle Prescription
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the spectacle prescription for both eyes.
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Eye
                  </th>

                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    SPH
                  </th>

                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    CYL
                  </th>

                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Axis
                  </th>

                  <th className="border border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Visual Acuity
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-900">
                    Right (OD)
                  </td>

                  <td className="border border-slate-200 p-2">
                    <input
                      type="text"
                      value={spectaclePrescription.right.sph}
                      onChange={(event) =>
                        handleSpectacleChange(
                          "right",
                          "sph",
                          event.target.value,
                        )
                      }
                      placeholder="SPH"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </td>

                  <td className="border border-slate-200 p-2">
                    <input
                      type="text"
                      value={spectaclePrescription.right.cyl}
                      onChange={(event) =>
                        handleSpectacleChange(
                          "right",
                          "cyl",
                          event.target.value,
                        )
                      }
                      placeholder="CYL"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </td>

                  <td className="border border-slate-200 p-2">
                    <input
                      type="text"
                      value={spectaclePrescription.right.axis}
                      onChange={(event) =>
                        handleSpectacleChange(
                          "right",
                          "axis",
                          event.target.value,
                        )
                      }
                      placeholder="Axis"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </td>

                  <td className="border border-slate-200 p-2">
                    <input
                      type="text"
                      value={spectaclePrescription.right.visualAcuity}
                      onChange={(event) =>
                        handleSpectacleChange(
                          "right",
                          "visualAcuity",
                          event.target.value,
                        )
                      }
                      placeholder="6/6"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-900">
                    Left (OS)
                  </td>

                  <td className="border border-slate-200 p-2">
                    <input
                      type="text"
                      value={spectaclePrescription.left.sph}
                      onChange={(event) =>
                        handleSpectacleChange("left", "sph", event.target.value)
                      }
                      placeholder="SPH"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </td>

                  <td className="border border-slate-200 p-2">
                    <input
                      type="text"
                      value={spectaclePrescription.left.cyl}
                      onChange={(event) =>
                        handleSpectacleChange("left", "cyl", event.target.value)
                      }
                      placeholder="CYL"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </td>

                  <td className="border border-slate-200 p-2">
                    <input
                      type="text"
                      value={spectaclePrescription.left.axis}
                      onChange={(event) =>
                        handleSpectacleChange(
                          "left",
                          "axis",
                          event.target.value,
                        )
                      }
                      placeholder="Axis"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </td>

                  <td className="border border-slate-200 p-2">
                    <input
                      type="text"
                      value={spectaclePrescription.left.visualAcuity}
                      onChange={(event) =>
                        handleSpectacleChange(
                          "left",
                          "visualAcuity",
                          event.target.value,
                        )
                      }
                      placeholder="6/6"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="near-addition"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Near Addition
              </label>

              <input
                id="near-addition"
                type="text"
                value={spectaclePrescription.nearAddition}
                onChange={(event) =>
                  handleSpectacleChange(
                    "nearAddition",
                    null,
                    event.target.value,
                  )
                }
                placeholder="e.g. +2.00"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="pd"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                PD
              </label>

              <input
                id="pd"
                type="text"
                value={spectaclePrescription.pd}
                onChange={(event) =>
                  handleSpectacleChange("pd", null, event.target.value)
                }
                placeholder="e.g. 62 mm"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Investigations */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Investigations Advised
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add investigations or tests advised during this visit.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {investigations.length} test
              {investigations.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Add Investigation */}
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label
                  htmlFor="investigation-test-name"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Investigation / Test
                </label>

                <div className="relative">
                  <input
                    id="investigation-test-name"
                    type="text"
                    value={investigationTestName}
                    onChange={(event) => {
                      setInvestigationTestName(event.target.value);
                      setShowInvestigationSuggestions(true);
                    }}
                    onFocus={() => setShowInvestigationSuggestions(true)}
                    onBlur={() => {
                      // Delay closing so a suggestion can be clicked first.
                      window.setTimeout(() => {
                        setShowInvestigationSuggestions(false);
                      }, 150);
                    }}
                    placeholder="Search or type investigation/test..."
                    autoComplete="off"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  {showInvestigationSuggestions && (
                    <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
                      {filteredInvestigationGroups.length > 0 ? (
                        filteredInvestigationGroups.map((group) => (
                          <div key={group.category}>
                            {/* Non-selectable category heading */}
                            <div className="sticky top-0 border-y border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                              {group.category}
                            </div>

                            {/* Selectable investigation names */}
                            {group.items.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  setInvestigationTestName(item);
                                  setShowInvestigationSuggestions(false);
                                }}
                                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-sm text-slate-500">
                          No matching suggestions. You can enter a custom test
                          name.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="investigation-eye"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Eye
                </label>

                <select
                  id="investigation-eye"
                  value={investigationEye}
                  onChange={(event) =>
                    setInvestigationEye(event.target.value as InvestigationEye)
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="OD">OD — Right Eye</option>

                  <option value="OS">OS — Left Eye</option>

                  <option value="OU">OU — Both Eyes</option>

                  <option value="NA">N/A</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleAddInvestigation}
                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                + Add Investigation
              </button>
            </div>
          </div>

          {/* Investigation List */}
          {investigations.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Investigation
                    </th>

                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Eye
                    </th>

                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Result
                    </th>

                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Test Date
                    </th>

                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {investigations.map((investigation) => (
                    <tr key={investigation.localId}>
                      <td className="px-3 py-3 text-sm font-medium text-slate-900">
                        {investigation.testName}
                      </td>

                      <td className="px-3 py-3 text-sm text-slate-600">
                        {investigation.eye}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            investigation.status === "reviewed"
                              ? "bg-emerald-50 text-emerald-700"
                              : investigation.status === "completed"
                                ? "bg-blue-50 text-blue-700"
                                : investigation.status === "cancelled"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {investigation.status === "reviewed"
                            ? "Reviewed"
                            : investigation.status === "completed"
                              ? "Completed"
                              : investigation.status === "cancelled"
                                ? "Cancelled"
                                : "Ordered"}
                        </span>
                      </td>

                      <td className="max-w-xs px-3 py-3 text-sm text-slate-600">
                        {investigation.result || "Pending"}
                      </td>

                      <td className="px-3 py-3 text-sm text-slate-600">
                        {investigation.testDate || "—"}
                      </td>

                      <td className="px-3 py-3 text-right">
                        {investigation.status !== "completed" &&
                          investigation.status !== "reviewed" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveInvestigation(investigation)
                              }
                              className="text-sm font-medium text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}

                        {(investigation.status === "completed" ||
                          investigation.status === "reviewed") && (
                          <span className="text-xs text-slate-400">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No investigations advised for this visit.
            </div>
          )}

          <div className="mt-4 rounded-md bg-blue-50 p-3 text-xs leading-5 text-blue-700">
            Investigations advised here will be linked to this visit. Results
            can be entered later from a subsequent visit.
          </div>
        </section>

        {/* Advice */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Advice</h2>

          <p className="mt-1 text-sm text-slate-500">
            Add general advice for the patient.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {prescriptionSuggestions.advice.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setAdvice((current) =>
                    current.trim() ? `${current.trim()}\n${item}` : item,
                  )
                }
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-100"
              >
                + {item}
              </button>
            ))}
          </div>

          <textarea
            value={advice}
            onChange={(event) => setAdvice(event.target.value)}
            rows={5}
            placeholder="Enter or edit patient advice..."
            className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </section>

        {/* Follow-up */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Follow-up</h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter follow-up instructions.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {prescriptionSuggestions.followUp.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFollowUp(item)}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-100"
              >
                {item}
              </button>
            ))}
          </div>

          <textarea
            value={followUp}
            onChange={(event) => setFollowUp(event.target.value)}
            rows={3}
            placeholder="Select a suggestion or enter custom follow-up instructions..."
            className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </section>

        {/* Bottom Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSavePrescription}
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? "Saving..."
              : existingPrescription
                ? "Update Prescription"
                : "Save Prescription"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionBuilder;
