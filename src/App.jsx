import { useState, useCallback, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import { ToastContainer, useToast } from "./components/Toast";
import { getTasks } from "./api/gasApi";

// Pages
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Team from "./pages/Team";
import Activity from "./pages/Activity";
import Login from "./pages/Login";

// Modals
import ProjectModal from "./modals/ProjectModal";
import TaskModal from "./modals/TaskModal";
import ReportModal from "./modals/ReportModal";
import TeamModal from "./modals/TeamModal";
import ExportModal from "./modals/ExportModal";
import ActivityModal from "./modals/ActivityModal";

export default function App() {
  const location = useLocation();                         // ✅ replaces page state
  const [exportPreset, setExportPreset] = useState(null);
  const [taskCount, setTaskCount] = useState(null);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const [modals, setModals] = useState({
    project: false,
    task: false,
    report: false,
    team: false,
    export: false,
    activity: false,
  });

  const { toasts, toast } = useToast();

  const openModal = useCallback(
    (name) => setModals((m) => ({ ...m, [name]: true })),
    [],
  );
  const closeModal = useCallback(
    (name) => setModals((m) => ({ ...m, [name]: false })),
    [],
  );

  useEffect(() => {
    const saved = localStorage.getItem("ngo_user");
    if (saved) setUser(JSON.parse(saved));
    setChecking(false);
  }, []);

  useEffect(() => {
    getTasks()
      .then((res) => {
        const pending = res.data.filter(
          (t) => t.status !== "Completed" && t.status !== "Cancelled",
        ).length;
        setTaskCount(pending);
      })
      .catch(() => setTaskCount(0));
  }, [refreshKey]);

  function handleLogin(u) {
    setUser(u);
  }

  function handleLogout() {
    localStorage.removeItem("ngo_user");
    localStorage.removeItem("ngo_token");
    setUser(null);
  }

  if (checking) return null;
  if (!user) return <Login onLogin={handleLogin} />;       // ✅ early returns after hooks

  function openExport(presetId = null) {
    setExportPreset(presetId || null);
    openModal("export");
  }

  const common = { toast };

  const topbarActions = (
    <>
      {location.pathname === "/" && (
        <>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => openModal("project")}
          >
            ➕ New Project
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => openModal("task")}
          >
            📋 Assign Task
          </button>
        </>
      )}
      {location.pathname === "/activity" && (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => openModal("activity")}
        >
          ✏️ Log Activity
        </button>
      )}
    </>
  );

  return (
    <>
      <ToastContainer toasts={toasts} />
      <Layout taskCount={taskCount} onLogout={handleLogout} user={user}>
        {{
          actions: topbarActions,
          content: (
            <Routes>
              <Route path="/"         element={<Dashboard key={refreshKey} {...common} onOpenModal={openModal} />} />
              <Route path="/projects" element={<Projects  key={refreshKey} {...common} onOpenModal={openModal} onOpenExport={openExport} />} />
              <Route path="/tasks"    element={<Tasks     key={refreshKey} {...common} onOpenModal={openModal} />} />
              <Route path="/reports"  element={<Reports   key={refreshKey} {...common} onOpenModal={openModal} />} />
              <Route path="/team"     element={<Team      key={refreshKey} {...common} onOpenModal={openModal} />} />
              <Route path="/activity" element={<Activity  key={refreshKey} {...common} onOpenModal={openModal} />} />
              <Route path="*"         element={<Navigate to="/" replace />} />
            </Routes>
          ),
        }}
      </Layout>

      <ProjectModal  open={modals.project}  onClose={() => closeModal("project")}  onSaved={refresh} toast={toast} />
      <TaskModal     open={modals.task}     onClose={() => closeModal("task")}     onSaved={refresh} toast={toast} />
      <ReportModal   open={modals.report}   onClose={() => closeModal("report")}   onSaved={refresh} toast={toast} />
      <TeamModal     open={modals.team}     onClose={() => closeModal("team")}     onSaved={refresh} toast={toast} />
      <ExportModal   open={modals.export}   onClose={() => closeModal("export")}   presetId={exportPreset} toast={toast} />
      <ActivityModal open={modals.activity} onClose={() => closeModal("activity")} onSaved={refresh} toast={toast} />
    </>
  );
}