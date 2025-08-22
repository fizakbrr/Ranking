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

// Get recent updates
router.get('/recent-updates', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const updates = await query(`
      SELECT 
        pu.id,
        pu.points_change as points_added,
        pu.reason,
        pu.updated_by as admin_user,
        pu.created_at,
        d.name as division_name,
        d.color as division_color
      FROM point_updates pu
      JOIN divisions d ON pu.division_id = d.id
      ORDER BY pu.created_at DESC
      LIMIT ?
    `, [limit]);

    res.json({ updates });

  } catch (error) {
    console.error('Recent updates error:', error);
    res.status(500).json({ message: 'Error fetching recent updates' });
  }
});

// Update points for a division
router.post('/updatePoints', async (req, res) => {
  try {
    const { divisionId, pointsToAdd, reason } = req.body;

    if (!divisionId || pointsToAdd === undefined || !reason) {
      return res.status(400).json({ message: 'Division ID, points, and reason are required' });
    }

    // Get the division
    const division = await queryOne('SELECT * FROM divisions WHERE id = ?', [divisionId]);
    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }

    // Update division points
    const newPoints = division.points + pointsToAdd;
    await execute(
      'UPDATE divisions SET points = ?, last_updated = ? WHERE id = ?',
      [newPoints, new Date(), divisionId]
    );

    // Create point update record
    await execute(
      `INSERT INTO point_updates (division_id, points_change, reason, updated_by) 
       VALUES (?, ?, ?, ?)`,
      [divisionId, pointsToAdd, reason, req.user.username]
    );

    // Get updated division
    const updatedDivision = await queryOne('SELECT * FROM divisions WHERE id = ?', [divisionId]);

    res.json({
      message: 'Points updated successfully',
      division: updatedDivision
    });

  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({ message: 'Error updating points' });
  }
});

module.exports = router;
