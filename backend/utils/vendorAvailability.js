/**
 * vendorAvailability.js
 * ─────────────────────────────────────────────────────────────
 * Utility functions for the Rapido-style broadcast booking system.
 *
 * Core logic:
 *   A vendor is UNAVAILABLE for a requested slot if they have
 *   any CONFIRMED booking within ±1 hour of that slot.
 *
 *   Example: User requests 4:00 PM
 *   → Vendor blocked if they have an approved/confirmed booking
 *     anywhere between 3:00 PM and 5:00 PM on the same date.
 *
 * Usage:
 *   const { getAvailableVendors } = require('../utils/vendorAvailability');
 *   const vendors = await getAvailableVendors(pool, serviceCategory, date, time);
 * ─────────────────────────────────────────────────────────────
 */

const { pool } = require('../config/db');

/**
 * Convert a "HH:MM" or "HH:MM:SS" time string + date string
 * into a single JavaScript Date object for arithmetic.
 */
function toDateTime(dateStr, timeStr) {
  // dateStr: "2025-07-15"  timeStr: "16:00" or "16:00:00"
  return new Date(`${dateStr}T${timeStr.length === 5 ? timeStr + ':00' : timeStr}`);
}

/**
 * getAvailableVendors
 * ─────────────────────────────────────────────────────────────
 * Find all approved vendors for a service category who have
 * NO confirmed booking within ±60 minutes of the requested slot.
 *
 * @param {string} serviceCategory  - e.g. "Electrician", "Plumber"
 * @param {string} requestedDate    - "YYYY-MM-DD"
 * @param {string} requestedTime    - "HH:MM"
 * @returns {Array} - Array of available vendor rows
 */
async function getAvailableVendors(serviceCategory, requestedDate, requestedTime) {
  // Build the ±1 hour window as time strings
  const requestedDT  = toDateTime(requestedDate, requestedTime);
  const windowStart  = new Date(requestedDT.getTime() - 60 * 60 * 1000); // -1 hour
  const windowEnd    = new Date(requestedDT.getTime() + 60 * 60 * 1000); // +1 hour

  // Format back to "HH:MM" for SQL comparison
  const fmt = (dt) =>
    `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

  const windowStartTime = fmt(windowStart);
  const windowEndTime   = fmt(windowEnd);

  /**
   * Strategy:
   * 1. Get all approved vendors for this service category
   * 2. Exclude any vendor who has an approved/confirmed booking
   *    on the SAME date with time falling inside our ±1hr window
   *
   * We handle the midnight-crossing edge case by also checking
   * the previous/next date if the window crosses 00:00.
   */

  // Does the window stay within the same day?
  const crossesMidnightStart = windowStart.getDate() !== requestedDT.getDate();
  const crossesMidnightEnd   = windowEnd.getDate()   !== requestedDT.getDate();

  let busyVendorIds;

  if (!crossesMidnightStart && !crossesMidnightEnd) {
    // Simple case: entire window is within the same day
    const { rows } = await pool.query(
      `SELECT DISTINCT vendor_id
       FROM bookings
       WHERE date = $1
         AND time::time >= $2::time
         AND time::time <= $3::time
         AND status::text IN ('approved', 'confirmed', 'pending')
         AND vendor_id IS NOT NULL`,
      [requestedDate, windowStartTime, windowEndTime]
    );
    busyVendorIds = rows.map(r => r.vendor_id);

  } else {
    // Window crosses midnight — check two dates
    const prevDate = new Date(requestedDT);
    prevDate.setDate(prevDate.getDate() - 1);
    const nextDate = new Date(requestedDT);
    nextDate.setDate(nextDate.getDate() + 1);

    const fmtDate = (dt) => dt.toISOString().split('T')[0];

    const { rows } = await pool.query(
      `SELECT DISTINCT vendor_id
       FROM bookings
       WHERE (
         (date = $1 AND time::time >= $2::time)
         OR
         (date = $3 AND time::time <= $4::time)
         OR
         (date = $5 AND time::time >= $6::time AND time::time <= $7::time)
       )
         AND status IN ('approved', 'confirmed', 'pending')
         AND vendor_id IS NOT NULL`,
      [
        fmtDate(prevDate), windowStartTime,
        fmtDate(nextDate), windowEndTime,
        requestedDate,     windowStartTime, windowEndTime,
      ]
    );
    busyVendorIds = rows.map(r => r.vendor_id);
  }

  // Build exclusion clause
  const excludeClause = busyVendorIds.length > 0
    ? `AND v.id != ALL($2)`
    : '';

  const queryParams = busyVendorIds.length > 0
    ? [serviceCategory, busyVendorIds]
    : [serviceCategory];

  // Fetch available vendors (approved, matching category, not busy)
  // Also fetch vendors whose category CONTAINS the service name (case-insensitive)
  const { rows: availableVendors } = await pool.query(
    `SELECT
       v.id,
       v.business_name,
       v.owner_name,
       v.phone,
       v.email,
       v.city,
       v.service_category,
       v.pricing,
       v.description,
       COALESCE(AVG(r.rating), 0) AS average_rating
     FROM vendors v
     LEFT JOIN reviews r ON r.vendor_id = v.id
     WHERE v.is_approved = true
       AND (
         LOWER(v.service_category) = LOWER($1)
         OR LOWER(v.service_category) LIKE LOWER('%' || $1 || '%')
         OR LOWER($1) LIKE LOWER('%' || v.service_category || '%')
       )
       ${excludeClause}
     GROUP BY v.id
     ORDER BY average_rating DESC`,
    queryParams
  );

  return availableVendors;
}

/**
 * isVendorAvailable
 * ─────────────────────────────────────────────────────────────
 * Check if a SINGLE vendor is available for a given slot.
 * Used during the accept flow to re-validate before locking.
 *
 * @param {number} vendorId
 * @param {string} date       - "YYYY-MM-DD"
 * @param {string} time       - "HH:MM"
 * @param {number} excludeBookingId - the current booking being accepted (exclude self)
 * @returns {boolean}
 */
async function isVendorAvailable(vendorId, date, time, excludeBookingId = null) {
  const requestedDT = toDateTime(date, time);
  const windowStart = new Date(requestedDT.getTime() - 60 * 60 * 1000);
  const windowEnd   = new Date(requestedDT.getTime() + 60 * 60 * 1000);

  const fmt = (dt) =>
    `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

  const params = [
    vendorId,
    date,
    fmt(windowStart),
    fmt(windowEnd),
  ];

  let excludeClause = '';
  if (excludeBookingId) {
    params.push(excludeBookingId);
    excludeClause = `AND id != $${params.length}`;
  }

  const { rows } = await pool.query(
    `SELECT id FROM bookings
     WHERE vendor_id = $1
       AND date = $2
       AND time::time >= $3::time
       AND time::time <= $4::time
       AND status::text IN ('approved', 'confirmed', 'pending')
       ${excludeClause}
     LIMIT 1`,
    params
  );

  return rows.length === 0; // true = available
}

/**
 * getVendorSocketIds
 * ─────────────────────────────────────────────────────────────
 * Helper to get socket room names for a list of vendor IDs.
 * Convention: each vendor joins room "vendor:{id}" on connection.
 *
 * @param {Array<number>} vendorIds
 * @returns {Array<string>} - e.g. ["vendor:5", "vendor:12"]
 */
function getVendorRooms(vendorIds) {
  return vendorIds.map(id => `vendor:${id}`);
}

module.exports = {
  getAvailableVendors,
  isVendorAvailable,
  getVendorRooms,
};