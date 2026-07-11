const BASE_URL = "/api/admin";

async function handle(res) {
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Fehler ${res.status}`);
  }
  return body;
}

export function login(email, password) {
  return fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(handle);
}

export function getTenants() {
  return fetch(`${BASE_URL}/tenants`).then(handle);
}

export function getTenant(id) {
  return fetch(`${BASE_URL}/tenants/${id}`).then(handle);
}

export function createTenant(data) {
  return fetch(`${BASE_URL}/tenants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updateTenant(id, data) {
  return fetch(`${BASE_URL}/tenants/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function getTenantWines(tenantId) {
  return fetch(`${BASE_URL}/tenants/${tenantId}/wines`).then(handle);
}

export function getWine(id) {
  return fetch(`${BASE_URL}/wines/${id}`).then(handle);
}

export function createWine(tenantId, data) {
  return fetch(`${BASE_URL}/tenants/${tenantId}/wines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updateWine(id, data) {
  return fetch(`${BASE_URL}/wines/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function deleteWine(id) {
  return fetch(`${BASE_URL}/wines/${id}`, { method: "DELETE" }).then(handle);
}

export function importWinesCSV(tenantId, csvText) {
  return fetch(`${BASE_URL}/tenants/${tenantId}/wines/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csv: csvText }),
  }).then(handle);
}

export function getAnalytics(tenantId) {
  return fetch(`${BASE_URL}/tenants/${tenantId}/analytics`).then(handle);
}
