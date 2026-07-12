/**
 * broadcastRoutes.js
 * ─────────────────────────────────────────────────────────────
 * Routes for the Rapido-style broadcast booking system.
 *
 * These will be mounted in server.js as:
 *   app.use('/api/user',   broadcastUserRoutes);
 *   app.use('/api/vendor', broadcastVendorRoutes);
 *
 * Uses the same auth middleware already in your project.
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const { verifyToken, isUser, isVendor } = require('../middleware/auth');
const ctrl = require('../controllers/broadcastBookingController');

// ── USER ROUTES ───────────────────────────────────────────────
// Mount at: app.use('/api/user', userBroadcastRouter)
const userBroadcastRouter = express.Router();
userBroadcastRouter.use(verifyToken, isUser);

// Submit a new broadcast service request (no vendor selected)
userBroadcastRouter.post(
  '/booking/broadcast-request',
  ctrl.createBroadcastRequest
);

// Check current status of a broadcast booking (polling fallback)
userBroadcastRouter.get(
  '/booking/:bookingId/broadcast-status',
  ctrl.getBroadcastStatus
);

// Respond to vendor's suggested alternate time slot
userBroadcastRouter.post(
  '/booking/:bookingId/respond-slot',
  ctrl.respondToSlotSuggestion
);

// ── VENDOR ROUTES ─────────────────────────────────────────────
// Mount at: app.use('/api/vendor', vendorBroadcastRouter)
const vendorBroadcastRouter = express.Router();
vendorBroadcastRouter.use(verifyToken, isVendor);

// Fetch all pending broadcast requests for this vendor
vendorBroadcastRouter.get(
  '/broadcast-requests',
  ctrl.getVendorBroadcastRequests
);

// Accept a broadcast request (race-condition safe)
vendorBroadcastRouter.post(
  '/broadcast-requests/:bookingId/accept',
  ctrl.acceptBroadcastRequest
);

// Decline a broadcast request
vendorBroadcastRouter.post(
  '/broadcast-requests/:bookingId/decline',
  ctrl.declineBroadcastRequest
);

// Suggest an alternate time slot
vendorBroadcastRouter.post(
  '/broadcast-requests/:bookingId/suggest-slot',
  ctrl.suggestSlot
);

module.exports = { userBroadcastRouter, vendorBroadcastRouter };