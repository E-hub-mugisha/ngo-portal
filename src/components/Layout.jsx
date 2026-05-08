const PAGES = [
  { id: "dashboard", icon: "📊", label: "Dashboard", section: "Main" },
  { id: "projects", icon: "📁", label: "Projects", section: "Main" },
  { id: "tasks", icon: "📋", label: "Tasks", section: "Main", badge: true },
  { id: "activity", icon: "🗂️", label: "Activity Log", section: "Main" },
  { id: "reports", icon: "📝", label: "Daily Reports", section: "Reports" },
  { id: "team", icon: "👥", label: "Team Members", section: "Administration" },
];

export default function Layout({
  activePage,
  onNavigate,
  taskCount,
  onLogout,
  user,
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
          <div className="logo-icon">
            <img
              src="../src/assets/logo.png"
              alt="Logo"
              style={{ width: "32px", height: "32px" }}
            />
          </div>
          <h2>Happy Family</h2>
          <p>Internal Management System</p>
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
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-info">
              <div className="name">{user?.name || "User"}</div>
              <div className="role">{user?.role || "Staff"}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onLogout}
            style={{ width: "100%", marginTop: 8, justifyContent: "center" }}
          >
            🚪 Logout
          </button>
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
