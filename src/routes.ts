import express from 'express'
import { 
  addConference,
  addUser,
  bookConference,
  cancelBooking,
  confirmWaitlistBooking,
  getBookingStatus,
  searchConferences,
  suggestedConferences
 } from './routeControllers'

const router = express.Router();

// Add Conference
router.post('/add-conference', addConference)

// Add User
router.post('/add-user', addUser)

// Book Conference
router.post('/book-conference', bookConference)

// Cancel Booking
router.post('/cancel-booking', cancelBooking)

// Confirm Waitlist Booking
router.post('/confirm-waitlist-booking', confirmWaitlistBooking)

// Get Booking Status
router.post('/get-booking-status', getBookingStatus)

// Search Conferences
router.post('/conferences/search', searchConferences)

// Suggested Conferences
router.post('/conferences/suggestions', suggestedConferences)

export default router;
