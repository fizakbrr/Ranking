const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');

// Get current week
const getCurrentWeek = async () => {
  return await queryOne(
    'SELECT * FROM weeks WHERE status = ? ORDER BY start_date DESC LIMIT 1',
    ['active']
  );
};

// Get leaderboard for current week
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'points', sortOrder = 'desc' } = req.query;
    const offset = (page - 1) * limit;

    const currentWeek = await getCurrentWeek();
    if (!currentWeek) {
      return res.status(404).json({ message: 'No active week found' });
    }

    // Build search query
    let searchQuery = '';
    let queryParams = [];
    
    if (search) {
      searchQuery = ` WHERE (name LIKE ? OR points LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Validate sortBy parameter
    const validSortFields = ['points', 'name', 'rank'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'points';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM divisions ${searchQuery}`;
    const countResult = await query(countQuery, queryParams);
    const totalCount = parseInt(countResult[0]?.count || 0);

    // Get divisions with pagination and calculate rank
    let divisionsQuery;
    let paginationParams;
    
    if (sortField === 'rank') {
      // For rank sorting, we need to handle it specially since rank is calculated
      divisionsQuery = `
        SELECT 
          id, name, points, level,
          ROW_NUMBER() OVER (ORDER BY points DESC) as rank
        FROM divisions 
        ${searchQuery}
        ORDER BY rank ${order}
        LIMIT ? OFFSET ?
      `;
    } else {
      divisionsQuery = `
        SELECT 
          id, name, points, level,
          ROW_NUMBER() OVER (ORDER BY points DESC) as rank
        FROM divisions 
        ${searchQuery}
        ORDER BY ${sortField} ${order}
        LIMIT ? OFFSET ?
      `;
    }
    
    paginationParams = [...queryParams, limit, offset];
    const divisions = await query(divisionsQuery, paginationParams);

    // Add display colors for top 3
    const divisionsWithColors = divisions.map(division => ({
      ...division,
      display_color: division.rank === 1 ? '#FFD700' :
                    division.rank === 2 ? '#C0C0C0' :
                    division.rank === 3 ? '#CD7F32' : '#1f2937'
    }));

    res.json({
      divisions: divisionsWithColors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: offset + parseInt(limit) < totalCount,
        hasPrevPage: page > 1
      },
      week: currentWeek
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard data' });
  }
});

// Get weekly history for a specific division
router.get('/history/:divisionId', async (req, res) => {
  try {
    const { divisionId } = req.params;
    
    const historyQuery = `
      SELECT 
        wh.*,
        w.start_date,
        w.end_date,
        w.week_number
      FROM weekly_history wh
      JOIN weeks w ON wh.week_id = w.id
      WHERE wh.division_id = ?
      ORDER BY w.start_date DESC
    `;
    
    const history = await query(historyQuery, [divisionId]);
    
    res.json({
      divisionHistory: history
    });

  } catch (error) {
    console.error('Weekly history fetch error:', error);
    res.status(500).json({ message: 'Error fetching weekly history' });
  }
});

// Get overall statistics
router.get('/stats', async (req, res) => {
  try {
    const currentWeek = await getCurrentWeek();
    
    // Get current week stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_divisions,
        AVG(points) as average_points,
        MAX(points) as highest_points,
        MIN(points) as lowest_points,
        AVG(level) as average_level
      FROM divisions 
    `;
    
    const stats = await query(statsQuery);
    
    // Get top performers
    const topPerformersQuery = `
      SELECT name, points, level
      FROM divisions 
      ORDER BY points DESC
      LIMIT 5
    `;
    
    const topPerformers = await query(topPerformersQuery);
    
    res.json({
      currentWeek,
      stats: stats[0],
      topPerformers: topPerformers
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;
