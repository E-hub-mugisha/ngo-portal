const API_URL = "/api/exec";

// GET REQUESTS
export async function getProjects() {
    const res = await fetch(`${API_URL}?action=projects`);
    return res.json();
}

export async function getTasks(projectId = "") {
    const res = await fetch(
        `${API_URL}?action=tasks&projectId=${projectId}`
    );
    return res.json();
}

export async function getStats() {
    const res = await fetch(`${API_URL}?action=stats`);
    return res.json();
}


// POST REQUESTS
export async function createProject(data) {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "createProject",
            ...data,
        }),
    });

    return res.json();
}

export async function createTask(data) {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "createTask",
            ...data,
        }),
    });

    return res.json();
}