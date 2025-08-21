const express = require('express');
const router = express.Router();
const { query, queryOne, execute } = require('../config/database');
const { verifyToken } = require('./auth');

// Get current week
const getCurrentWeek = async () => {
  return await queryOne(
    'SELECT * FROM weeks WHERE status = ? ORDER BY start_date DESC LIMIT 1',
    ['active']
  );
};

// All admin routes require authentication
router.use(verifyToken);

// Get admin dashboard stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const currentWeek = await getCurrentWeek();

    // Get total divisions
    const divisionsCountResult = await query('SELECT COUNT(*) as count FROM divisions');
    const totalDivisions = parseInt(divisionsCountResult[0]?.count || 0);

    // Get total points distributed this week
    const totalPointsResult = await query('SELECT SUM(points) as total_points FROM divisions');
    const totalPoints = parseInt(totalPointsResult[0]?.total_points || 0);

    // Get recent activity count (last 7 days)
    const recentActivityResult = await query(`
      SELECT COUNT(*) as count FROM point_updates 
      WHERE created_at >= datetime('now', '-7 days')
    `);
    const recentActivity = parseInt(recentActivityResult[0]?.count || 0);

    // Get top division
    const topDivisionResult = await query(
      'SELECT name, points FROM divisions ORDER BY points DESC LIMIT 1'
    );
    const topDivision = topDivisionResult[0] || null;

    // Get week duration
    const weekStart = new Date(currentWeek?.start_date);
    const now = new Date();
    const daysSinceStart = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));

    res.json({
      totalDivisions,
      totalPoints,
      recentActivity,
      topDivision,
      weekInfo: {
        ...currentWeek,
        daysSinceStart
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

module.exports = router;
