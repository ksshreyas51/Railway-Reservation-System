const express = require('express');
const { handleBookTicket, handleCancelTicket, handleDownloadTicket } = require('../controllers/booking.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const router = express.Router();

// All booking routes require authentication
router.use(authenticateToken);

router.post('/', handleBookTicket);
router.post('/:ticketId/cancel', handleCancelTicket);
router.get('/:ticketId/download', handleDownloadTicket);

module.exports = router;
