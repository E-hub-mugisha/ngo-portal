// ─────────────────────────────────────────────────────────────
//  NGO MANAGER — GAS API Layer
//  Replace GAS_URL with your deployed Web App URL
// ─────────────────────────────────────────────────────────────

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyS4MWPP6I_dalhVN3yUHPit0Sh0LwdNRiZvRpi_C0xWjGNnMJBZgpcc6sawyAq-fVS/exec';

// Generic GET request — appends ?api=1&action=xxx&...params
async function gasGet(action, params = {}) {
    const query = new URLSearchParams({ api: '1', action, ...params }).toString();
    const res = await fetch(`${GAS_URL}?${query}`);
    const json = await res.json();
    if (!json.success && json.error) throw new Error(json.error);
    return json;
}

// Generic POST request — sends JSON body
async function gasPost(payload) {
    const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // text/plain avoids CORS preflight
        body: JSON.stringify({ api: '1', ...payload }),
    });
    const json = await res.json();
    if (!json.success && json.error) throw new Error(json.error);
    return json;
}

// ─── Projects ────────────────────────────────────────────────
export const getProjects = () => gasGet('getProjects');
export const createProject = (data) => gasPost({ action: 'createProject', ...data });
export const updateProjStatus = (id, s) => gasPost({ action: 'updateProjectStatus', projectId: id, newStatus: s });

// ─── Tasks ───────────────────────────────────────────────────
export const getTasks = (projectId = null) => gasGet('getTasks', projectId ? { projectId } : {});
export const createTask = (data) => gasPost({ action: 'createTask', ...data });
export const updateTaskStatus = (id, s) => gasPost({ action: 'updateTaskStatus', taskId: id, newStatus: s });

// ─── Team ────────────────────────────────────────────────────
export const getTeamMembers = () => gasGet('getTeamMembers');
export const addTeamMember = (data) => gasPost({ action: 'addTeamMember', ...data });
export const removeTeamMember = (id) => gasPost({ action: 'removeTeamMember', memberId: id });

// ─── Daily Reports ───────────────────────────────────────────
export const getDailyReports = (date = null) => gasGet('getDailyReports', date ? { date } : {});
export const submitDailyReport = (data) => gasPost({ action: 'submitDailyReport', ...data });

// ─── Dashboard Stats ─────────────────────────────────────────
export const getSummaryStats = () => gasGet('getSummaryStats');

// ─── Export ──────────────────────────────────────────────────
export const exportProject = (projectId, format) => gasPost({ action: 'exportProject', projectId, format });
export const exportProjectDocx = (projectId) => gasPost({ action: 'exportProjectDocx', projectId });
export const getProjectList = () => gasGet('getProjectList');

// ─── Activities ──────────────────────────────────────────────
export const getActivities = (date = null) => gasGet('getActivities', date ? { date } : {});
export const submitActivity = (data) => gasPost({ action: 'submitActivity', ...data });