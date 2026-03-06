const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const matchController = require('../controllers/match.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Validation middleware
const validateMatchId = [
  param('matchId').isMongoId().withMessage('Invalid match ID format')
];

const validateUnmatch = [
  param('matchId').isMongoId().withMessage('Invalid match ID format'),
  body('reason')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
    .escape()
];

// Routes
router.get('/', matchController.getMatches);
router.get('/mutual', matchController.getMutualMatches);
router.get('/:matchId', validateMatchId, matchController.getMatchById);
router.delete('/:matchId/unmatch', validateUnmatch, matchController.unmatchUser);

module.exports = router;