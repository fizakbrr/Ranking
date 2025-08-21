const express = require('express');
const router = express.Router();
const weekController = require('../controllers/weekController');
const { authenticateToken } = require('../middleware/auth');

// Get current week
router.get('/current', async (req, res) => {
  try {
    const week = await weekController.getCurrentWeek();
    res.json(week);
  } catch (error) {
    console.error('Error getting current week:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get week history
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const weeks = await weekController.getWeekHistory(parseInt(limit), parseInt(offset));
    
    res.json({
      weeks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: weeks.length
      }
    });
  } catch (error) {
    console.error('Error getting week history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific week details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const weekDetails = await weekController.getWeekDetails(id);
    
    if (!weekDetails) {
      return res.status(404).json({ message: 'Week not found' });
    }
    
    res.json(weekDetails);
  } catch (error) {
    console.error('Error getting week details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start new week manually (admin only)
router.post('/start-new', authenticateToken, async (req, res) => {
  try {
    const result = await weekController.autoStartNewWeek();
    res.json({
      message: 'New week started successfully',
      ...result
    });
  } catch (error) {
    console.error('Error starting new week:', error);
    res.status(500).json({ message: 'Failed to start new week' });
  }
});

module.exports = router;
