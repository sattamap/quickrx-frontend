import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import NewVisit from "./pages/NewVisit";
import Prescription from "./pages/Prescription";
import Settings from "./pages/Settings";
import VisitDetails from "./pages/VisitDetails";
import PrescriptionBuilder from "./pages/PrescriptionBuilder";
import PrescriptionPreview from "./pages/PrescriptionPreview";
import EditVisit from "./pages/EditVisit";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected application routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/patients" element={<Patients />} />

            <Route path="/patients/:id" element={<PatientDetails />} />

            <Route path="/patients/:id/new-visit" element={<NewVisit />} />

            <Route
              path="/patients/:patientId/visits/:visitId"
              element={<VisitDetails />}
            />

            <Route
              path="/patients/:patientId/visits/:visitId/edit"
              element={<EditVisit />}
            />

            <Route
              path="/patients/:patientId/visits/:visitId/prescription"
              element={<PrescriptionBuilder />}
            />

            <Route
              path="/patients/:patientId/visits/:visitId/prescription/preview"
              element={<PrescriptionPreview />}
            />

            <Route path="/prescriptions" element={<Prescription />} />

            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
