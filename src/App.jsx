import { useState, useCallback, useEffect } from "react"; // ← added useEffect
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

// Modals
import ProjectModal from "./modals/ProjectModal";
import TaskModal from "./modals/TaskModal";
import ReportModal from "./modals/ReportModal";
import TeamModal from "./modals/TeamModal";
import ExportModal from "./modals/ExportModal";
import ActivityModal from "./modals/ActivityModal";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [exportPreset, setExportPreset] = useState(null);
  const [taskCount, setTaskCount] = useState(null);

  // ── Must be declared BEFORE useEffect that references it ──
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

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

  // Modal visibility
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

  function openExport(presetId = null) {
    setExportPreset(presetId || null);
    openModal("export");
  }

  // Action buttons shown in topbar depend on current page
  const topbarActions = (
    <>
      {page === "dashboard" && (
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
      {page === "activity" && (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => openModal("activity")}
        >
          ✏️ Log Activity
        </button>
      )}
    </>
  );

  // Render active page
  const pageContent = (() => {
    const common = { toast }; // ← remove key from here
    switch (page) {
      case "dashboard":
        return (
          <Dashboard
            key={refreshKey}
            {...common}
            onNavigate={setPage}
            onOpenModal={openModal}
          />
        );
      case "projects":
        return (
          <Projects
            key={refreshKey}
            {...common}
            onOpenModal={openModal}
            onOpenExport={openExport}
          />
        );
      case "tasks":
        return <Tasks key={refreshKey} {...common} onOpenModal={openModal} />;
      case "reports":
        return <Reports key={refreshKey} {...common} onOpenModal={openModal} />;
      case "team":
        return <Team key={refreshKey} {...common} onOpenModal={openModal} />;
      case "activity":
        return (
          <Activity key={refreshKey} {...common} onOpenModal={openModal} />
        );
      default:
        return null;
    }
  })();

  return (
    <>
      <ToastContainer toasts={toasts} />

      <Layout activePage={page} onNavigate={setPage} taskCount={taskCount}>
        {{ actions: topbarActions, content: pageContent }}
      </Layout>

      {/* ── Modals ── */}
      <ProjectModal
        open={modals.project}
        onClose={() => closeModal("project")}
        onSaved={refresh}
        toast={toast}
      />
      <TaskModal
        open={modals.task}
        onClose={() => closeModal("task")}
        onSaved={refresh}
        toast={toast}
      />
      <ReportModal
        open={modals.report}
        onClose={() => closeModal("report")}
        onSaved={refresh}
        toast={toast}
      />
      <TeamModal
        open={modals.team}
        onClose={() => closeModal("team")}
        onSaved={refresh}
        toast={toast}
      />
      <ExportModal
        open={modals.export}
        onClose={() => closeModal("export")}
        presetId={exportPreset}
        toast={toast}
      />
      <ActivityModal
        open={modals.activity}
        onClose={() => closeModal("activity")}
        onSaved={refresh}
        toast={toast}
      />
    </>
  );
}
