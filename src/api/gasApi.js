// ─────────────────────────────────────────────────────────────
//  NGO MANAGER — Laravel API Layer
// ─────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:8000/api

function getToken() {
    return localStorage.getItem('ngo_token');
}

async function http(method, path, data = null) {
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (data) opts.body = JSON.stringify(data);

    const res = await fetch(`${BASE}${path}`, opts);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.message || 'Request failed');
    return json;
}

const get  = (path, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return http('GET', qs ? `${path}?${qs}` : path);
};
const post   = (path, data) => http('POST',   path, data);
const put    = (path, data) => http('PUT',    path, data);
const patch  = (path, data) => http('PATCH',  path, data);
const del    = (path)       => http('DELETE', path);

// ─── Auth ────────────────────────────────────────────────────
export const registerUser = (data)  => post('/register', data);
export const loginUser    = (data)  => post('/login',    data);
export const logoutUser   = ()      => post('/logout');

// ─── Projects ────────────────────────────────────────────────
export const getProjects      = ()          => get('/projects');
export const createProject    = (data)      => post('/projects', data);
export const updateProject    = (id, data)  => put(`/projects/${id}`, data);
export const updateProjStatus = (id, status)=> patch(`/projects/${id}/status`, { status });
export const deleteProject    = (id)        => del(`/projects/${id}`);
export const getProjectList   = ()          => get('/project-list');

// ─── Tasks ───────────────────────────────────────────────────
export const getTasks       = (projectId = null) => get('/tasks', projectId ? { projectId } : {});
export const createTask     = (data)             => post('/tasks', data);
export const updateTaskStatus = (id, status)     => patch(`/tasks/${id}/status`, { status });

// ─── Team ────────────────────────────────────────────────────
export const getTeamMembers  = ()     => get('/team');
export const addTeamMember   = (data) => post('/team', data);
export const removeTeamMember = (id)  => del(`/team/${id}`);

// ─── Daily Reports ───────────────────────────────────────────
export const getDailyReports  = (date = null) => get('/daily-reports', date ? { date } : {});
export const submitDailyReport = (data)       => post('/daily-reports', data);

// ─── Activities ──────────────────────────────────────────────
export const getActivities  = (date = null) => get('/activities', date ? { date } : {});
export const submitActivity = (data)        => post('/activities', data);

// ─── Dashboard ───────────────────────────────────────────────
export const getSummaryStats = () => get('/stats');

// ─── Export ──────────────────────────────────────────────────
export const exportProject     = (projectId, format) => post('/export', { projectId, format });
export const exportProjectDocx = (projectId)         => post('/export', { projectId, format: 'docx' });