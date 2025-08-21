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
      `INSERT INTO divisions (name, color, rank, points, level, badges, achievements, week_id) 
       VALUES (?, ?, ?, 0, 1, '[]', '[]', ?)`,
      [name, color, nextRank, currentWeek.id]
    );

    const newDivision = await queryOne('SELECT * FROM divisions WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Division created successfully',
      division: newDivision
    });

  } catch (error) {
    console.error('Create division error:', error);
    res.status(500).json({ message: 'Error creating division' });
  }
});

module.exports = router;
