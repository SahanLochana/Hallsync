/**
 * Hall Controller — controllers/hallController.js
 * All business logic for the Hall Management page.
 * The View (HallsPage.jsx) calls these functions.
 */

const BASE_URL = "http://localhost:8000/api/halls";

// ── Mapping helpers ────────────────────────────────────────────────────────────

/**
 * Maps a raw API hall document to the frontend hall shape.
 * @param {Object} h — raw document from the backend
 * @returns {Object} frontend hall object
 */
function mapHall(h) {
  return {
    id: h.hallId,
    hallId: h.hallId,
    name: h.name,
    capacity: h.capacity,
    availability: h.availability,
    latitude: h.latitude ?? null,
    longitude: h.longitude ?? null,
  };
}

// ── Data Fetching ──────────────────────────────────────────────────────────────

/**
 * Fetches all halls from the backend.
 * @param {Function} setHalls     — React state setter
 * @param {Function} setIsLoading — React state setter
 * @param {Function} setError     — React state setter
 */
export async function fetchHalls(setHalls, setIsLoading, setError) {
  setIsLoading(true);
  setError(null);
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    setHalls((data.response || []).map(mapHall));
  } catch (err) {
    setError(err?.message || "Failed to load halls.");
  } finally {
    setIsLoading(false);
  }
}

// ── Filtering ─────────────────────────────────────────────────────────────────

/**
 * Filters halls by search term (hallId or name) and availability.
 * Pure function — no side effects.
 * @param {Array}  halls        — full list from state
 * @param {string} search       — search term
 * @param {string} availability — "All" | "Available" | "Unavailable"
 * @returns {Array} filtered list
 */
export function filterHalls(halls, search, availability) {
  const q = search.toLowerCase().trim();
  return halls.filter((h) => {
    const matchSearch =
      !q ||
      h.hallId.toLowerCase().includes(q) ||
      h.name.toLowerCase().includes(q);

    const matchAvailability =
      availability === "All" ||
      (availability === "Available" && h.availability) ||
      (availability === "Unavailable" && !h.availability);

    return matchSearch && matchAvailability;
  });
}

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Validates the Add Hall form.
 * @param {Object} form — { hallId, name, capacity, availability }
 * @returns {Object} error map (empty object = valid)
 */
export function validateHallForm(form) {
  const errors = {};
  if (!form.hallId?.trim()) errors.hallId = "Hall ID is required.";
  if (!form.name?.trim()) errors.name = "Hall name is required.";
  if (form.capacity === "" || form.capacity === null || form.capacity === undefined) {
    errors.capacity = "Capacity is required.";
  } else if (isNaN(Number(form.capacity)) || Number(form.capacity) < 1) {
    errors.capacity = "Capacity must be a positive number.";
  }
  return errors;
}

/**
 * Validates location fields (optional — only when both must be present or absent together).
 * @param {Object} form — { latitude, longitude }
 * @returns {Object} error map
 */
export function validateLocationForm(form) {
  const errors = {};
  const hasLat = form.latitude !== "" && form.latitude !== null && form.latitude !== undefined;
  const hasLng = form.longitude !== "" && form.longitude !== null && form.longitude !== undefined;

  if (hasLat && isNaN(Number(form.latitude))) {
    errors.latitude = "Latitude must be a number.";
  } else if (hasLat && (Number(form.latitude) < -90 || Number(form.latitude) > 90)) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }

  if (hasLng && isNaN(Number(form.longitude))) {
    errors.longitude = "Longitude must be a number.";
  } else if (hasLng && (Number(form.longitude) < -180 || Number(form.longitude) > 180)) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  return errors;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Creates a new hall via the API and prepends it to the halls list.
 * @param {Array}    halls    — current list from state
 * @param {Object}   form     — { hallId, name, capacity, availability, latitude, longitude }
 * @param {Function} setHalls — React state setter
 */
export async function addHall(halls, form, setHalls) {
  const payload = {
    hallId: form.hallId.trim(),
    name: form.name.trim(),
    capacity: Number(form.capacity),
    availability: form.availability,
    latitude: form.latitude !== "" && form.latitude !== null ? Number(form.latitude) : null,
    longitude: form.longitude !== "" && form.longitude !== null ? Number(form.longitude) : null,
  };

  const response = await fetch(`${BASE_URL}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to create hall.");
  }

  const created = await response.json();
  setHalls([mapHall(created), ...halls]);
  return mapHall(created);
}

/**
 * Updates an existing hall. Sends only the changed fields.
 * @param {Array}    halls       — current list from state
 * @param {string}   hallId      — the hall's hallId
 * @param {Object}   updateForm  — fields to update
 * @param {Function} setHalls    — React state setter
 */
export async function editHall(halls, hallId, updateForm, setHalls) {
  const payload = {};
  if (updateForm.name !== undefined) payload.name = updateForm.name.trim();
  if (updateForm.capacity !== undefined) payload.capacity = Number(updateForm.capacity);
  if (updateForm.availability !== undefined) payload.availability = updateForm.availability;
  if (updateForm.latitude !== undefined) {
    payload.latitude = updateForm.latitude !== "" && updateForm.latitude !== null
      ? Number(updateForm.latitude)
      : null;
  }
  if (updateForm.longitude !== undefined) {
    payload.longitude = updateForm.longitude !== "" && updateForm.longitude !== null
      ? Number(updateForm.longitude)
      : null;
  }

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(hallId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to update hall.");
  }

  const updated = await response.json();
  const frontendHall = mapHall(updated);
  setHalls(halls.map((h) => (h.hallId === hallId ? frontendHall : h)));
  return frontendHall;
}

/**
 * Deletes a hall by hallId.
 * @param {Array}    halls    — current list from state
 * @param {string}   hallId   — the hall to remove
 * @param {Function} setHalls — React state setter
 */
export async function removeHall(halls, hallId, setHalls) {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(hallId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to delete hall.");
  }

  setHalls(halls.filter((h) => h.hallId !== hallId));
}
