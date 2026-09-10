import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import NewVisit from "./pages/NewVisit";
import Prescription from "./pages/Prescription";
import Settings from "./pages/Settings";
import VisitDetails from "./pages/VisitDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetails />} />
          <Route path="/patients/:id/new-visit" element={<NewVisit />} />
          <Route
            path="/patients/:patientId/visits/:visitId"
            element={<VisitDetails />}
          />

          <Route path="/prescriptions" element={<Prescription />} />

          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
