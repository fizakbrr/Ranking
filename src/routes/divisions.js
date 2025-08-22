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

// Get all divisions for current week
router.get('/', async (req, res) => {
  try {
    const currentWeek = await getCurrentWeek();
    if (!currentWeek) {
      return res.status(404).json({ message: 'No active week found' });
    }

    const result = await query(
      'SELECT * FROM divisions ORDER BY points DESC, name ASC'
    );

    res.json({ divisions: result, week: currentWeek });

  } catch (error) {
    console.error('Get divisions error:', error);
    res.status(500).json({ message: 'Error fetching divisions' });
  }
});

// Create new division (admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({ message: 'Name and color are required' });
    }

    const currentWeek = await getCurrentWeek();
    if (!currentWeek) {
      return res.status(404).json({ message: 'No active week found' });
    }

    // Check if division already exists
    const existingDivision = await queryOne(
      'SELECT * FROM divisions WHERE name = ?',
      [name]
    );

    if (existingDivision) {
      return res.status(400).json({ message: 'Division with this name already exists' });
    }

    // Get next rank
    const divisions = await query('SELECT * FROM divisions ORDER BY points DESC');
    const nextRank = divisions.length + 1;

    // Create new division
    const result = await execute(
      `INSERT INTO divisions (name, color, rank, points, level, week_id) 
       VALUES (?, ?, ?, 0, 1, ?)`,
      [name, color, nextRank, currentWeek.id]
    );

    const newDivision = await queryOne('SELECT * FROM divisions WHERE id = ?', [result.lastID]);

    // Create a point update record for the new division
    await execute(
      `INSERT INTO point_updates (division_id, points_change, reason, updated_by) 
       VALUES (?, ?, ?, ?)`,
      [result.lastID, 0, 'Division created', req.user.username]
    );

    res.status(201).json({
      message: 'Division created successfully',
      division: newDivision
    });

  } catch (error) {
    console.error('Create division error:', error);
    res.status(500).json({ message: 'Error creating division' });
  }
});

// Delete division (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if division exists
    const division = await queryOne('SELECT * FROM divisions WHERE id = ?', [id]);
    if (!division) {
      return res.status(404).json({ message: 'Division not found' });
    }

    // Delete the division
    await execute('DELETE FROM divisions WHERE id = ?', [id]);

    // Also delete any associated point updates for this division
    await execute('DELETE FROM point_updates WHERE division_id = ?', [id]);

    res.json({
      message: 'Division deleted successfully'
    });

  } catch (error) {
    console.error('Delete division error:', error);
    res.status(500).json({ message: 'Error deleting division' });
  }
});

module.exports = router;
