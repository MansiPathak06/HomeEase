// /**
//  * broadcastBookingController.js
//  * ─────────────────────────────────────────────────────────────
//  * Rapido/Uber-style booking broadcast system for HomeEase.
//  *
//  * NEW FLOW:
//  *   User submits service request (no vendor selected)
//  *     → System finds available vendors (±1hr slot check)
//  *     → Socket.io broadcasts to each eligible vendor
//  *     → First vendor to accept LOCKS the booking
//  *     → All other vendors receive "booking:locked" event
//  *     → User notified via socket "booking:confirmed"
//  *
//  * EXISTING FLOW (unchanged):
//  *   After acceptance → ₹99 visitation charge → vendor quote
//  *   → user accepts/rejects → payment recording
//  *
//  * Race condition prevention:
//  *   PostgreSQL "SELECT ... FOR UPDATE" ensures only one
//  *   vendor can atomically lock a booking, even if multiple
//  *   accept simultaneously.
//  * ─────────────────────────────────────────────────────────────
//  */

// const { pool }               = require('../config/db');
// const { getAvailableVendors, isVendorAvailable, getVendorRooms } = require('../utils/vendorAvailability');

// // Broadcast expiry window — vendor has 10 minutes to respond
// const BROADCAST_EXPIRY_MINUTES = 10;

// // ─────────────────────────────────────────────────────────────
// //  Helper: get Socket.io instance
// //  getIO() is set once in server.js after socket setup
// // ─────────────────────────────────────────────────────────────
// let _io = null;
// function setIO(ioInstance) { _io = ioInstance; }
// function getIO() { return _io; }

// // ─────────────────────────────────────────────────────────────
// //  POST /api/user/booking/broadcast-request
// //
// //  Body: {
// //    service_name     : "Electrician",
// //    service_category : "Electrician",      // matches vendors.service_category
// //    issue_description: "AC not working",
// //    date             : "2025-07-20",
// //    time             : "16:00",
// //    budget           : 500,
// //    address          : "123 MG Road, Delhi",
// //    notes            : "Please bring tools"
// //  }
// // ─────────────────────────────────────────────────────────────
// exports.createBroadcastRequest = async (req, res) => {
//   const client = await pool.connect(); // use transaction
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

//     const {
//       service_name,
//       service_category,
//       issue_description,
//       date,
//       time,
//       budget,
//       address,
//       notes,
//     } = req.body;

//     // Basic validation
//     if (!service_name || !date || !time || !budget) {
//       return res.status(400).json({
//         success: false,
//         message: 'service_name, date, time, and budget are required',
//       });
//     }

//     if (isNaN(budget) || Number(budget) <= 0) {
//       return res.status(400).json({ success: false, message: 'Budget must be a positive number' });
//     }

//     const broadcastExpiresAt = new Date(Date.now() + BROADCAST_EXPIRY_MINUTES * 60 * 1000);

//     await client.query('BEGIN');

//     // 1. Create booking with no vendor_id (broadcast mode)
//     const { rows: bookingRows } = await client.query(
//       `INSERT INTO bookings (
//          user_id, service_name, date, time,
//          address, message,
//          status, payment_method, amount,
//          budget, issue_description,
//          booking_type, broadcast_status,
//          broadcast_expires_at,
//          advance_amount,
//          created_at, updated_at
//        ) VALUES (
//          $1, $2, $3, $4,
//          $5, $6,
//          'pending', 'cod', 99,
//          $7, $8,
//          'broadcast', 'broadcasted',
//          $9,
//          99,
//          NOW(), NOW()
//        )
//        RETURNING *`,
//       [
//         userId,
//         service_name,
//         date,
//         time,
//         address || '',
//         notes   || '',
//         Number(budget),
//         issue_description || '',
//         broadcastExpiresAt,
//       ]
//     );

//     const booking = bookingRows[0];

//     // 2. Find available vendors for this service + slot
//     const availableVendors = await getAvailableVendors(
//       service_category || service_name,
//       date,
//       time
//     );

//     if (availableVendors.length === 0) {
//       await client.query('ROLLBACK');
//       // Still save the booking but mark as no vendors found
//       // (can retry later or notify admin)
//       return res.status(200).json({
//         success: true,
//         noVendors: true,
//         bookingId: booking.id,
//         message: 'Request saved. No vendors available right now — we will notify you when one accepts.',
//       });
//     }

//     // 3. Create booking_broadcasts rows for each vendor
//     const broadcastInserts = availableVendors.map(v =>
//       client.query(
//         `INSERT INTO booking_broadcasts (booking_id, vendor_id, status, created_at)
//          VALUES ($1, $2, 'pending', NOW())
//          ON CONFLICT (booking_id, vendor_id) DO NOTHING`,
//         [booking.id, v.id]
//       )
//     );
//     await Promise.all(broadcastInserts);

//     await client.query('COMMIT');

//     // 4. Broadcast via Socket.io to each eligible vendor
//     const io = getIO();
//     if (io) {
//       // Fetch user info for the notification card
//       const { rows: userRows } = await pool.query(
//         'SELECT name, phone FROM users WHERE id = $1',
//         [userId]
//       );
//       const user = userRows[0] || {};

//       const broadcastPayload = {
//         type          : 'booking:new_request',
//         bookingId     : booking.id,
//         serviceName   : service_name,
//         issueDescription: issue_description || '',
//         date,
//         time,
//         budget        : Number(budget),
//         address       : address || '',
//         customerName  : user.name  || 'Customer',
//         customerPhone : user.phone || '',
//         expiresAt     : broadcastExpiresAt.toISOString(),
//         advanceCharge : 99,  // existing ₹99 visitation charge info
//       };

//       const vendorRooms = getVendorRooms(availableVendors.map(v => v.id));
//       vendorRooms.forEach(room => {
//         io.to(room).emit('booking:new_request', broadcastPayload);
//       });

//       console.log(`📡 Broadcast sent to ${vendorRooms.length} vendor(s) for booking #${booking.id}`);
//     }

//     // 5. Join user to their booking room (to receive confirmation later)
//     // Users connect via socket on the frontend and join "user:{userId}"

//     res.json({
//       success       : true,
//       bookingId     : booking.id,
//       vendorCount   : availableVendors.length,
//       expiresAt     : broadcastExpiresAt.toISOString(),
//       message       : `Request sent to ${availableVendors.length} available vendor(s)`,
//     });

//   } catch (error) {
//     await client.query('ROLLBACK').catch(() => {});
//     console.error('createBroadcastRequest error:', error);
//     res.status(500).json({ success: false, message: 'Failed to create broadcast request' });
//   } finally {
//     client.release();
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  GET /api/vendor/broadcast-requests
// //  Vendor fetches their active (pending) broadcast requests
// // ─────────────────────────────────────────────────────────────
// exports.getVendorBroadcastRequests = async (req, res) => {
//   try {
//     const vendorId = req.user?.id;

//     const { rows } = await pool.query(
//       `SELECT
//          b.id,
//          b.service_name,
//          b.issue_description,
//          b.date,
//          b.time,
//          b.budget,
//          b.address,
//          b.message AS notes,
//          b.broadcast_expires_at,
//          b.broadcast_status,
//          bb.status AS broadcast_response,
//          u.name  AS customer_name,
//          u.phone AS customer_phone
//        FROM booking_broadcasts bb
//        JOIN bookings b ON b.id = bb.booking_id
//        LEFT JOIN users u ON u.id = b.user_id
//        WHERE bb.vendor_id = $1
//          AND bb.status = 'pending'
//          AND b.broadcast_status = 'broadcasted'
//          AND b.broadcast_expires_at > NOW()
//        ORDER BY b.created_at DESC`,
//       [vendorId]
//     );

//     // Mark as "seen" so vendor can't re-dismiss
//     if (rows.length > 0) {
//       const bookingIds = rows.map(r => r.id);
//       await pool.query(
//         `UPDATE booking_broadcasts
//          SET status = 'seen', seen_at = NOW()
//          WHERE vendor_id = $1
//            AND booking_id = ANY($2)
//            AND status = 'pending'`,
//         [vendorId, bookingIds]
//       );
//     }

//     res.json({ success: true, requests: rows });
//   } catch (error) {
//     console.error('getVendorBroadcastRequests error:', error);
//     res.status(500).json({ success: false, message: 'Failed to fetch requests' });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  POST /api/vendor/broadcast-requests/:bookingId/accept
// //
// //  CRITICAL: Uses SELECT ... FOR UPDATE to prevent race conditions.
// //  Only ONE vendor can successfully lock a booking.
// // ─────────────────────────────────────────────────────────────
// exports.acceptBroadcastRequest = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const vendorId  = req.user?.id;
//     const bookingId = parseInt(req.params.bookingId, 10);

//     await client.query('BEGIN');

//     // STEP 1: Lock the booking row — only one transaction proceeds
//     const { rows: bookingRows } = await client.query(
//       `SELECT * FROM bookings
//        WHERE id = $1
//          AND broadcast_status = 'broadcasted'
//          AND broadcast_expires_at > NOW()
//        FOR UPDATE`,   // ← This is the race condition lock
//       [bookingId]
//     );

//     if (bookingRows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(409).json({
//         success: false,
//         alreadyTaken: true,
//         message: 'This request has already been accepted by another vendor.',
//       });
//     }

//     const booking = bookingRows[0];

//     // STEP 2: Re-check vendor availability (double validation)
//     const available = await isVendorAvailable(vendorId, booking.date, booking.time, bookingId);
//     if (!available) {
//       await client.query('ROLLBACK');
//       return res.status(409).json({
//         success: false,
//         message: 'You have a conflicting booking at this time slot.',
//       });
//     }

//     // STEP 3: Lock the booking → assign this vendor
//     await client.query(
//       `UPDATE bookings SET
//          vendor_id        = $1,
//          broadcast_status = 'accepted',
//          status           = 'pending',
//          accepted_at      = NOW(),
//          updated_at       = NOW()
//        WHERE id = $2`,
//       [vendorId, bookingId]
//     );

//     // STEP 4: Mark this vendor as accepted in broadcasts table
//     await client.query(
//       `UPDATE booking_broadcasts
//        SET status = 'accepted', responded_at = NOW()
//        WHERE booking_id = $1 AND vendor_id = $2`,
//       [bookingId, vendorId]
//     );

//     // STEP 5: Decline all other vendors for this booking
//     await client.query(
//       `UPDATE booking_broadcasts
//        SET status = 'declined', responded_at = NOW()
//        WHERE booking_id = $1 AND vendor_id != $2`,
//       [bookingId, vendorId]
//     );

//     await client.query('COMMIT');

//     // STEP 6: Notify via Socket.io (outside transaction)
//     const io = getIO();
//     if (io) {
//       // Fetch vendor info for user notification
//       const { rows: vendorRows } = await pool.query(
//         `SELECT business_name, phone, city, service_category, pricing
//          FROM vendors WHERE id = $1`,
//         [vendorId]
//       );
//       const vendor = vendorRows[0] || {};

//       // Tell the user: your vendor has been assigned!
//       io.to(`user:${booking.user_id}`).emit('booking:confirmed', {
//         bookingId,
//         vendorName    : vendor.business_name,
//         vendorPhone   : vendor.phone,
//         vendorCity    : vendor.city,
//         serviceCategory: vendor.service_category,
//         pricing       : vendor.pricing,
//         date          : booking.date,
//         time          : booking.time,
//         message       : 'A vendor has accepted your request!',
//       });

//       // Tell all OTHER vendors: request is gone
//       const { rows: otherVendors } = await pool.query(
//         `SELECT vendor_id FROM booking_broadcasts
//          WHERE booking_id = $1 AND vendor_id != $2`,
//         [bookingId, vendorId]
//       );

//       otherVendors.forEach(({ vendor_id }) => {
//         io.to(`vendor:${vendor_id}`).emit('booking:locked', {
//           bookingId,
//           message: 'This request was accepted by another vendor.',
//         });
//       });

//       console.log(`✅ Booking #${bookingId} locked by vendor #${vendorId}`);
//     }

//     res.json({
//       success  : true,
//       message  : 'Booking accepted! Customer has been notified.',
//       bookingId,
//     });

//   } catch (error) {
//     await client.query('ROLLBACK').catch(() => {});
//     console.error('acceptBroadcastRequest error:', error);
//     res.status(500).json({ success: false, message: 'Failed to accept request' });
//   } finally {
//     client.release();
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  POST /api/vendor/broadcast-requests/:bookingId/decline
// // ─────────────────────────────────────────────────────────────
// exports.declineBroadcastRequest = async (req, res) => {
//   try {
//     const vendorId  = req.user?.id;
//     const bookingId = parseInt(req.params.bookingId, 10);

//     await pool.query(
//       `UPDATE booking_broadcasts
//        SET status = 'declined', responded_at = NOW()
//        WHERE booking_id = $1 AND vendor_id = $2`,
//       [bookingId, vendorId]
//     );

//     res.json({ success: true, message: 'Request declined' });
//   } catch (error) {
//     console.error('declineBroadcastRequest error:', error);
//     res.status(500).json({ success: false, message: 'Failed to decline request' });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  POST /api/vendor/broadcast-requests/:bookingId/suggest-slot
// //
// //  Vendor wants to do the job but at a different time.
// //  Body: { suggested_date: "2025-07-21", suggested_time: "18:00" }
// // ─────────────────────────────────────────────────────────────
// exports.suggestSlot = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const vendorId  = req.user?.id;
//     const bookingId = parseInt(req.params.bookingId, 10);
//     const { suggested_date, suggested_time } = req.body;

//     if (!suggested_date || !suggested_time) {
//       return res.status(400).json({ success: false, message: 'suggested_date and suggested_time are required' });
//     }

//     await client.query('BEGIN');

//     // Lock + validate booking is still available
//     const { rows } = await client.query(
//       `SELECT * FROM bookings
//        WHERE id = $1
//          AND broadcast_status = 'broadcasted'
//          AND broadcast_expires_at > NOW()
//        FOR UPDATE`,
//       [bookingId]
//     );

//     if (rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(409).json({
//         success: false,
//         alreadyTaken: true,
//         message: 'This request is no longer available.',
//       });
//     }

//     const booking = rows[0];

//     // Lock it for this vendor (negotiating state)
//     await client.query(
//       `UPDATE bookings SET
//          vendor_id                = $1,
//          broadcast_status         = 'accepted',
//          status                   = 'pending',
//          slot_negotiation_status  = 'vendor_suggested',
//          suggested_slot_date      = $2,
//          suggested_slot_time      = $3,
//          accepted_at              = NOW(),
//          updated_at               = NOW()
//        WHERE id = $4`,
//       [vendorId, suggested_date, suggested_time, bookingId]
//     );

//     // Mark this vendor as accepted, decline others
//     await client.query(
//       `UPDATE booking_broadcasts SET status='accepted', responded_at=NOW()
//        WHERE booking_id=$1 AND vendor_id=$2`,
//       [bookingId, vendorId]
//     );
//     await client.query(
//       `UPDATE booking_broadcasts SET status='declined', responded_at=NOW()
//        WHERE booking_id=$1 AND vendor_id!=$2`,
//       [bookingId, vendorId]
//     );

//     await client.query('COMMIT');

//     // Notify user of the suggested slot
//     const io = getIO();
//     if (io) {
//       const { rows: vendorRows } = await pool.query(
//         'SELECT business_name, phone FROM vendors WHERE id = $1',
//         [vendorId]
//       );
//       const vendor = vendorRows[0] || {};

//       io.to(`user:${booking.user_id}`).emit('slot:suggested', {
//         bookingId,
//         vendorName   : vendor.business_name,
//         vendorPhone  : vendor.phone,
//         originalDate : booking.date,
//         originalTime : booking.time,
//         suggestedDate: suggested_date,
//         suggestedTime: suggested_time,
//         message      : `${vendor.business_name} is available at a different time`,
//       });

//       // Lock others out
//       const { rows: others } = await pool.query(
//         `SELECT vendor_id FROM booking_broadcasts
//          WHERE booking_id=$1 AND vendor_id!=$2`,
//         [bookingId, vendorId]
//       );
//       others.forEach(({ vendor_id }) => {
//         io.to(`vendor:${vendor_id}`).emit('booking:locked', { bookingId });
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Slot suggestion sent to customer. Waiting for their response.',
//     });

//   } catch (error) {
//     await client.query('ROLLBACK').catch(() => {});
//     console.error('suggestSlot error:', error);
//     res.status(500).json({ success: false, message: 'Failed to suggest slot' });
//   } finally {
//     client.release();
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  POST /api/user/booking/:bookingId/respond-slot
// //
// //  User accepts or rejects vendor's suggested alternate slot.
// //  Body: { accept: true/false }
// // ─────────────────────────────────────────────────────────────
// exports.respondToSlotSuggestion = async (req, res) => {
//   try {
//     const userId    = req.user?.id;
//     const bookingId = parseInt(req.params.bookingId, 10);
//     const { accept } = req.body;

//     const { rows } = await pool.query(
//       `SELECT * FROM bookings
//        WHERE id = $1 AND user_id = $2
//          AND slot_negotiation_status = 'vendor_suggested'`,
//       [bookingId, userId]
//     );

//     if (!rows.length) {
//       return res.status(404).json({ success: false, message: 'No pending slot suggestion for this booking' });
//     }

//     const booking = rows[0];

//     if (accept) {
//       // User accepts the vendor's suggested time
//       await pool.query(
//         `UPDATE bookings SET
//            date                     = suggested_slot_date,
//            time                     = suggested_slot_time,
//            slot_negotiation_status  = 'user_accepted',
//            broadcast_status         = 'confirmed',
//            status                   = 'pending',
//            updated_at               = NOW()
//          WHERE id = $1`,
//         [bookingId]
//       );

//       // Notify vendor
//       const io = getIO();
//       if (io && booking.vendor_id) {
//         io.to(`vendor:${booking.vendor_id}`).emit('slot:accepted', {
//           bookingId,
//           newDate: booking.suggested_slot_date,
//           newTime: booking.suggested_slot_time,
//           message: 'Customer accepted your suggested time slot!',
//         });
//       }

//       res.json({ success: true, accepted: true, message: 'Slot confirmed!' });

//     } else {
//       // User rejects — re-open booking for new broadcast
//       await pool.query(
//         `UPDATE bookings SET
//            vendor_id               = NULL,
//            broadcast_status        = 'broadcasted',
//            slot_negotiation_status = 'user_rejected',
//            suggested_slot_date     = NULL,
//            suggested_slot_time     = NULL,
//            accepted_at             = NULL,
//            broadcast_expires_at    = NOW() + INTERVAL '10 minutes',
//            updated_at              = NOW()
//          WHERE id = $1`,
//         [bookingId]
//       );

//       // Reset old vendor's broadcast to declined
//       await pool.query(
//         `UPDATE booking_broadcasts SET status='declined'
//          WHERE booking_id=$1`,
//         [bookingId]
//       );

//       // Notify the vendor their suggestion was rejected
//       const io = getIO();
//       if (io && booking.vendor_id) {
//         io.to(`vendor:${booking.vendor_id}`).emit('slot:rejected', {
//           bookingId,
//           message: 'Customer rejected your suggested time slot.',
//         });
//       }

//       res.json({
//         success : true,
//         accepted: false,
//         message : 'Slot rejected. Request has been re-broadcast to other vendors.',
//       });
//     }

//   } catch (error) {
//     console.error('respondToSlotSuggestion error:', error);
//     res.status(500).json({ success: false, message: 'Failed to process response' });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  GET /api/user/booking/:bookingId/status
// //  User polls / checks current status of their broadcast booking
// // ─────────────────────────────────────────────────────────────
// exports.getBroadcastStatus = async (req, res) => {
//   try {
//     const userId    = req.user?.id;
//     const bookingId = parseInt(req.params.bookingId, 10);

//     const { rows } = await pool.query(
//       `SELECT
//          b.id, b.status, b.broadcast_status,
//          b.slot_negotiation_status,
//          b.date, b.time,
//          b.suggested_slot_date, b.suggested_slot_time,
//          b.broadcast_expires_at, b.accepted_at,
//          v.business_name AS vendor_name,
//          v.phone         AS vendor_phone,
//          v.city          AS vendor_city,
//          v.service_category
//        FROM bookings b
//        LEFT JOIN vendors v ON v.id = b.vendor_id
//        WHERE b.id = $1 AND b.user_id = $2`,
//       [bookingId, userId]
//     );

//     if (!rows.length) {
//       return res.status(404).json({ success: false, message: 'Booking not found' });
//     }

//     res.json({ success: true, booking: rows[0] });
//   } catch (error) {
//     console.error('getBroadcastStatus error:', error);
//     res.status(500).json({ success: false, message: 'Failed to fetch booking status' });
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  Cron-like cleanup: expire old broadcasts
// //  Call this from a setInterval in server.js every 2 minutes
// // ─────────────────────────────────────────────────────────────
// async function expireOldBroadcasts() {
//   try {
//     const { rows } = await pool.query(
//       `UPDATE bookings
//        SET broadcast_status = 'expired',
//            status           = 'cancelled',
//            updated_at       = NOW()
//        WHERE broadcast_status = 'broadcasted'
//          AND broadcast_expires_at < NOW()
//        RETURNING id, user_id`
//     );

//     if (rows.length > 0) {
//       const io = getIO();
//       rows.forEach(b => {
//         if (io) {
//           io.to(`user:${b.user_id}`).emit('booking:expired', {
//             bookingId: b.id,
//             message  : 'No vendor accepted your request in time. Please try again.',
//           });
//         }
//       });
//       console.log(`⏰ Expired ${rows.length} broadcast booking(s)`);
//     }
//   } catch (err) {
//     console.error('expireOldBroadcasts error:', err);
//   }
// }

// module.exports = {
//   setIO,
//   getIO,
//   createBroadcastRequest,
//   getVendorBroadcastRequests,
//   acceptBroadcastRequest,
//   declineBroadcastRequest,
//   suggestSlot,
//   respondToSlotSuggestion,
//   getBroadcastStatus,
//   expireOldBroadcasts,
// };


/**
 * broadcastBookingController.js
 */

const { pool } = require('../config/db');
const { getAvailableVendors, isVendorAvailable, getVendorRooms } = require('../utils/vendorAvailability');

const BROADCAST_EXPIRY_MINUTES = 10;

let _io = null;
function setIO(ioInstance) { _io = ioInstance; }
function getIO() { return _io; }

// ── createBroadcastRequest ───────────────────────────────────
const createBroadcastRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { service_name, service_category, issue_description, date, time, budget, address, notes } = req.body;

    if (!service_name || !date || !time || !budget) {
      return res.status(400).json({ success: false, message: 'service_name, date, time, and budget are required' });
    }
    if (isNaN(budget) || Number(budget) <= 0) {
      return res.status(400).json({ success: false, message: 'Budget must be a positive number' });
    }

    const broadcastExpiresAt = new Date(Date.now() + BROADCAST_EXPIRY_MINUTES * 60 * 1000);

    await client.query('BEGIN');

    const { rows: bookingRows } = await client.query(
      `INSERT INTO bookings (
         user_id, service_name, date, time,
         address, message,
         status, payment_method, amount,
         budget, issue_description,
         booking_type, broadcast_status,
         broadcast_expires_at,
         advance_amount,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4,
         $5, $6,
         'pending', 'cod', 99,
         $7, $8,
         'broadcast', 'broadcasted',
         $9,
         99,
         NOW(), NOW()
       ) RETURNING *`,
      [userId, service_name, date, time, address || '', notes || '', Number(budget), issue_description || '', broadcastExpiresAt]
    );

    const booking = bookingRows[0];

    const availableVendors = await getAvailableVendors(service_category || service_name, date, time);

    if (availableVendors.length === 0) {
      await client.query('ROLLBACK');
      return res.status(200).json({
        success: true,
        noVendors: true,
        bookingId: booking.id,
        message: 'Request saved. No vendors available right now — we will notify you when one accepts.',
      });
    }

    const broadcastInserts = availableVendors.map(v =>
      client.query(
        `INSERT INTO booking_broadcasts (booking_id, vendor_id, status, created_at)
         VALUES ($1, $2, 'pending', NOW())
         ON CONFLICT (booking_id, vendor_id) DO NOTHING`,
        [booking.id, v.id]
      )
    );
    await Promise.all(broadcastInserts);

    await client.query('COMMIT');

    const io = getIO();
    if (io) {
      const { rows: userRows } = await pool.query('SELECT name, phone FROM users WHERE id = $1', [userId]);
      const user = userRows[0] || {};

      const broadcastPayload = {
        type: 'booking:new_request',
        bookingId: booking.id,
        serviceName: service_name,
        issueDescription: issue_description || '',
        date,
        time,
        budget: Number(budget),
        address: address || '',
        customerName: user.name || 'Customer',
        customerPhone: user.phone || '',
        expiresAt: broadcastExpiresAt.toISOString(),
        advanceCharge: 99,
      };

      const vendorRooms = getVendorRooms(availableVendors.map(v => v.id));
      vendorRooms.forEach(room => io.to(room).emit('booking:new_request', broadcastPayload));
      console.log(`📡 Broadcast sent to ${vendorRooms.length} vendor(s) for booking #${booking.id}`);
    }

    res.json({
      success: true,
      bookingId: booking.id,
      vendorCount: availableVendors.length,
      expiresAt: broadcastExpiresAt.toISOString(),
      message: `Request sent to ${availableVendors.length} available vendor(s)`,
    });

  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('createBroadcastRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to create broadcast request' });
  } finally {
    client.release();
  }
};

// ── getVendorBroadcastRequests ───────────────────────────────
const getVendorBroadcastRequests = async (req, res) => {
  try {
    const vendorId = req.user?.id;

    const { rows } = await pool.query(
      `SELECT
         b.id, b.service_name, b.issue_description,
         b.date, b.time, b.budget, b.address,
         b.message AS notes,
         b.broadcast_expires_at, b.broadcast_status,
         bb.status AS broadcast_response,
         u.name  AS customer_name,
         u.phone AS customer_phone
       FROM booking_broadcasts bb
       JOIN bookings b ON b.id = bb.booking_id
       LEFT JOIN users u ON u.id = b.user_id
       WHERE bb.vendor_id = $1
         AND bb.status = 'pending'
         AND b.broadcast_status = 'broadcasted'
         AND b.broadcast_expires_at > NOW()
       ORDER BY b.created_at DESC`,
      [vendorId]
    );

    if (rows.length > 0) {
      const bookingIds = rows.map(r => r.id);
      await pool.query(
        `UPDATE booking_broadcasts
         SET status = 'seen', seen_at = NOW()
         WHERE vendor_id = $1
           AND booking_id = ANY($2)
           AND status = 'pending'`,
        [vendorId, bookingIds]
      );
    }

    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error('getVendorBroadcastRequests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};

// ── acceptBroadcastRequest ───────────────────────────────────
const acceptBroadcastRequest = async (req, res) => {
  const client = await pool.connect();
  try {
    const vendorId  = req.user?.id;
    const bookingId = parseInt(req.params.bookingId, 10);

    await client.query('BEGIN');

    const { rows: bookingRows } = await client.query(
      `SELECT * FROM bookings
       WHERE id = $1
         AND broadcast_status = 'broadcasted'
         AND broadcast_expires_at > NOW()
       FOR UPDATE`,
      [bookingId]
    );

    if (bookingRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, alreadyTaken: true, message: 'This request has already been accepted by another vendor.' });
    }

    const booking = bookingRows[0];

    const available = await isVendorAvailable(vendorId, booking.date, booking.time, bookingId);
    if (!available) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'You have a conflicting booking at this time slot.' });
    }

    await client.query(
      `UPDATE bookings SET
         vendor_id        = $1,
         broadcast_status = 'accepted',
         status           = 'pending',
         accepted_at      = NOW(),
         updated_at       = NOW()
       WHERE id = $2`,
      [vendorId, bookingId]
    );

    await client.query(
      `UPDATE booking_broadcasts SET status = 'accepted', responded_at = NOW()
       WHERE booking_id = $1 AND vendor_id = $2`,
      [bookingId, vendorId]
    );

    await client.query(
      `UPDATE booking_broadcasts SET status = 'declined', responded_at = NOW()
       WHERE booking_id = $1 AND vendor_id != $2`,
      [bookingId, vendorId]
    );

    await client.query('COMMIT');

    const io = getIO();
    if (io) {
      const { rows: vendorRows } = await pool.query(
        'SELECT business_name, phone, city, service_category, pricing FROM vendors WHERE id = $1',
        [vendorId]
      );
      const vendor = vendorRows[0] || {};

      io.to(`user:${booking.user_id}`).emit('booking:confirmed', {
        bookingId,
        vendorName: vendor.business_name,
        vendorPhone: vendor.phone,
        vendorCity: vendor.city,
        serviceCategory: vendor.service_category,
        pricing: vendor.pricing,
        date: booking.date,
        time: booking.time,
        message: 'A vendor has accepted your request!',
      });

      const { rows: otherVendors } = await pool.query(
        `SELECT vendor_id FROM booking_broadcasts WHERE booking_id = $1 AND vendor_id != $2`,
        [bookingId, vendorId]
      );
      otherVendors.forEach(({ vendor_id }) => {
        io.to(`vendor:${vendor_id}`).emit('booking:locked', { bookingId, message: 'This request was accepted by another vendor.' });
      });

      console.log(`✅ Booking #${bookingId} locked by vendor #${vendorId}`);
    }

    res.json({ success: true, message: 'Booking accepted! Customer has been notified.', bookingId });

  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('acceptBroadcastRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to accept request' });
  } finally {
    client.release();
  }
};

// ── declineBroadcastRequest ──────────────────────────────────
const declineBroadcastRequest = async (req, res) => {
  try {
    const vendorId  = req.user?.id;
    const bookingId = parseInt(req.params.bookingId, 10);

    await pool.query(
      `UPDATE booking_broadcasts SET status = 'declined', responded_at = NOW()
       WHERE booking_id = $1 AND vendor_id = $2`,
      [bookingId, vendorId]
    );

    res.json({ success: true, message: 'Request declined' });
  } catch (error) {
    console.error('declineBroadcastRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to decline request' });
  }
};

// ── suggestSlot ──────────────────────────────────────────────
const suggestSlot = async (req, res) => {
  const client = await pool.connect();
  try {
    const vendorId  = req.user?.id;
    const bookingId = parseInt(req.params.bookingId, 10);
    const { suggested_date, suggested_time } = req.body;

    if (!suggested_date || !suggested_time) {
      return res.status(400).json({ success: false, message: 'suggested_date and suggested_time are required' });
    }

    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT * FROM bookings
       WHERE id = $1
         AND broadcast_status = 'broadcasted'
         AND broadcast_expires_at > NOW()
       FOR UPDATE`,
      [bookingId]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, alreadyTaken: true, message: 'This request is no longer available.' });
    }

    const booking = rows[0];

    await client.query(
      `UPDATE bookings SET
         vendor_id               = $1,
         broadcast_status        = 'accepted',
         status                  = 'pending',
         slot_negotiation_status = 'vendor_suggested',
         suggested_slot_date     = $2,
         suggested_slot_time     = $3,
         accepted_at             = NOW(),
         updated_at              = NOW()
       WHERE id = $4`,
      [vendorId, suggested_date, suggested_time, bookingId]
    );

    await client.query(
      `UPDATE booking_broadcasts SET status='accepted', responded_at=NOW()
       WHERE booking_id=$1 AND vendor_id=$2`,
      [bookingId, vendorId]
    );
    await client.query(
      `UPDATE booking_broadcasts SET status='declined', responded_at=NOW()
       WHERE booking_id=$1 AND vendor_id!=$2`,
      [bookingId, vendorId]
    );

    await client.query('COMMIT');

    const io = getIO();
    if (io) {
      const { rows: vendorRows } = await pool.query(
        'SELECT business_name, phone FROM vendors WHERE id = $1',
        [vendorId]
      );
      const vendor = vendorRows[0] || {};

      io.to(`user:${booking.user_id}`).emit('slot:suggested', {
        bookingId,
        vendorName: vendor.business_name,
        vendorPhone: vendor.phone,
        originalDate: booking.date,
        originalTime: booking.time,
        suggestedDate: suggested_date,
        suggestedTime: suggested_time,
        message: `${vendor.business_name} is available at a different time`,
      });

      const { rows: others } = await pool.query(
        `SELECT vendor_id FROM booking_broadcasts WHERE booking_id=$1 AND vendor_id!=$2`,
        [bookingId, vendorId]
      );
      others.forEach(({ vendor_id }) => {
        io.to(`vendor:${vendor_id}`).emit('booking:locked', { bookingId });
      });
    }

    res.json({ success: true, message: 'Slot suggestion sent to customer. Waiting for their response.' });

  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('suggestSlot error:', error);
    res.status(500).json({ success: false, message: 'Failed to suggest slot' });
  } finally {
    client.release();
  }
};

// ── respondToSlotSuggestion ──────────────────────────────────
const respondToSlotSuggestion = async (req, res) => {
  try {
    const userId    = req.user?.id;
    const bookingId = parseInt(req.params.bookingId, 10);
    const { accept } = req.body;

    const { rows } = await pool.query(
      `SELECT * FROM bookings
       WHERE id = $1 AND user_id = $2
         AND slot_negotiation_status = 'vendor_suggested'`,
      [bookingId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'No pending slot suggestion for this booking' });
    }

    const booking = rows[0];

    if (accept) {
      await pool.query(
        `UPDATE bookings SET
           date                    = suggested_slot_date,
           time                    = suggested_slot_time,
           slot_negotiation_status = 'user_accepted',
           broadcast_status        = 'confirmed',
           status                  = 'pending',
           updated_at              = NOW()
         WHERE id = $1`,
        [bookingId]
      );

      const io = getIO();
      if (io && booking.vendor_id) {
        io.to(`vendor:${booking.vendor_id}`).emit('slot:accepted', {
          bookingId,
          newDate: booking.suggested_slot_date,
          newTime: booking.suggested_slot_time,
          message: 'Customer accepted your suggested time slot!',
        });
      }

      res.json({ success: true, accepted: true, message: 'Slot confirmed!' });

    } else {
      await pool.query(
        `UPDATE bookings SET
           vendor_id               = NULL,
           broadcast_status        = 'broadcasted',
           slot_negotiation_status = 'user_rejected',
           suggested_slot_date     = NULL,
           suggested_slot_time     = NULL,
           accepted_at             = NULL,
           broadcast_expires_at    = NOW() + INTERVAL '10 minutes',
           updated_at              = NOW()
         WHERE id = $1`,
        [bookingId]
      );

      await pool.query(
        `UPDATE booking_broadcasts SET status='declined' WHERE booking_id=$1`,
        [bookingId]
      );

      const io = getIO();
      if (io && booking.vendor_id) {
        io.to(`vendor:${booking.vendor_id}`).emit('slot:rejected', {
          bookingId,
          message: 'Customer rejected your suggested time slot.',
        });
      }

      res.json({ success: true, accepted: false, message: 'Slot rejected. Request has been re-broadcast to other vendors.' });
    }

  } catch (error) {
    console.error('respondToSlotSuggestion error:', error);
    res.status(500).json({ success: false, message: 'Failed to process response' });
  }
};

// ── getBroadcastStatus ───────────────────────────────────────
const getBroadcastStatus = async (req, res) => {
  try {
    const userId    = req.user?.id;
    const bookingId = parseInt(req.params.bookingId, 10);

    const { rows } = await pool.query(
      `SELECT
         b.id, b.status, b.broadcast_status,
         b.slot_negotiation_status,
         b.date, b.time,
         b.suggested_slot_date, b.suggested_slot_time,
         b.broadcast_expires_at, b.accepted_at,
         v.business_name AS vendor_name,
         v.phone         AS vendor_phone,
         v.city          AS vendor_city,
         v.service_category
       FROM bookings b
       LEFT JOIN vendors v ON v.id = b.vendor_id
       WHERE b.id = $1 AND b.user_id = $2`,
      [bookingId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking: rows[0] });
  } catch (error) {
    console.error('getBroadcastStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking status' });
  }
};

// ── expireOldBroadcasts (cron helper) ───────────────────────
async function expireOldBroadcasts() {
  try {
    const { rows } = await pool.query(
      `UPDATE bookings
       SET broadcast_status = 'expired',
           status           = 'cancelled',
           updated_at       = NOW()
       WHERE broadcast_status = 'broadcasted'
         AND broadcast_expires_at < NOW()
       RETURNING id, user_id`
    );

    if (rows.length > 0) {
      const io = getIO();
      rows.forEach(b => {
        if (io) {
          io.to(`user:${b.user_id}`).emit('booking:expired', {
            bookingId: b.id,
            message: 'No vendor accepted your request in time. Please try again.',
          });
        }
      });
      console.log(`⏰ Expired ${rows.length} broadcast booking(s)`);
    }
  } catch (err) {
    console.error('expireOldBroadcasts error:', err);
  }
}

// ── Exports ──────────────────────────────────────────────────
module.exports = {
  setIO,
  getIO,
  createBroadcastRequest,
  getVendorBroadcastRequests,
  acceptBroadcastRequest,
  declineBroadcastRequest,
  suggestSlot,
  respondToSlotSuggestion,
  getBroadcastStatus,
  expireOldBroadcasts,
};