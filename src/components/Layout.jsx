import { NavLink, useLocation } from "react-router-dom";

const PAGES = [
  { path: "/",         icon: "📊", label: "Dashboard",     section: "Main"           },
  { path: "/projects", icon: "📁", label: "Projects",      section: "Main"           },
  { path: "/tasks",    icon: "📋", label: "Tasks",         section: "Main", badge: true },
  { path: "/activity", icon: "🗂️", label: "Activity Log",  section: "Main"           },
  { path: "/reports",  icon: "📝", label: "Daily Reports", section: "Reports"        },
  { path: "/team",     icon: "👥", label: "Team Members",  section: "Administration" },
];

const titleMap = {
  "/":         "📊 Dashboard",
  "/projects": "📁 Projects",
  "/tasks":    "📋 Tasks",
  "/reports":  "📝 Daily Reports",
  "/team":     "👥 Team Members",
  "/activity": "🗂️ Activity Log",
};

export default function Layout({ taskCount, onLogout, user, children }) {
  const location = useLocation();               // ← replaces activePage prop
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
  const sections = [...new Set(PAGES.map((p) => p.section))];

  return (
    <div className="app">
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <img src="../src/assets/logo.png" alt="Logo" style={{ width: "32px", height: "32px" }} />
          </div>
          <h2>Happy Family</h2>
          <p>Internal Management System</p>
        </div>
        <nav className="sidebar-nav">
          {sections.map((sec) => (
            <div className="nav-section" key={sec}>
              <div className="nav-label">{sec}</div>
              {PAGES.filter((p) => p.section === sec).map((p) => (
                <NavLink
                  key={p.path}
                  to={p.path}
                  end={p.path === "/"}           // exact match for root only
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <span className="icon">{p.icon}</span>
                  {p.label}
                  {p.badge && (
                    <span className="nav-badge">{taskCount ?? "—"}</span>
                  )}
                </NavLink>
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

      <div className="main">
        <header className="topbar">
          <div
            className="topbar-title"
            dangerouslySetInnerHTML={{
              __html: titleMap[location.pathname] || location.pathname,
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