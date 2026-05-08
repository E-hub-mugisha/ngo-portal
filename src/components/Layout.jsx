const PAGES = [
  { id: "dashboard", icon: "📊", label: "Dashboard", section: "Main" },
  { id: "projects", icon: "📁", label: "Projects", section: "Main" },
  { id: "tasks", icon: "📋", label: "Tasks", section: "Main", badge: true },
  { id: 'activity',  icon: '🗂️', label: 'Activity Log',  section: 'Main'           },
  { id: "reports", icon: "📝", label: "Daily Reports", section: "Reports" },
  { id: "team", icon: "👥", label: "Team Members", section: "Administration" },
];

export default function Layout({
  activePage,
  onNavigate,
  taskCount,
  children,
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const titleMap = {
    dashboard: "📊 Dashboard",
    projects: "📁 Projects",
    tasks: "📋 Tasks",
    reports: "📝 Daily Reports",
    team: "👥 Team Members",
    activity: "🗂️ Activity Log",
  };

  const sections = [...new Set(PAGES.map((p) => p.section))];

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🌍</div>
          <h2>NGO Manager</h2>
          <p>Project Management System</p>
        </div>
        <nav className="sidebar-nav">
          {sections.map((sec) => (
            <div className="nav-section" key={sec}>
              <div className="nav-label">{sec}</div>
              {PAGES.filter((p) => p.section === sec).map((p) => (
                <button
                  key={p.id}
                  className={`nav-item ${activePage === p.id ? "active" : ""}`}
                  onClick={() => onNavigate(p.id)}
                >
                  <span className="icon">{p.icon}</span>
                  {p.label}
                  {p.badge && (
                    <span className="nav-badge">{taskCount ?? "—"}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">N</div>
            <div className="user-info">
              <div className="name">NGO Admin</div>
              <div className="role">Project Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main">
        <header className="topbar">
          <div
            className="topbar-title"
            dangerouslySetInnerHTML={{
              __html: titleMap[activePage] || activePage,
            }}
          />
          <div className="topbar-actions">
            <span className="topbar-date">{today}</span>
            {children?.actions}
          </div>
        </header>
        <main className="content">{children?.content}</main>
      </div>
    </div>
  );
}
