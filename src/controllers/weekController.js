const db = require('../config/database');

const autoStartNewWeek = async () => {
  try {
    console.log('Starting weekly reset process...');

    // Get current active week
    const currentWeek = await db.queryOne(
      'SELECT * FROM weeks WHERE status = ?',
      ['active']
    );

    if (currentWeek) {
      // Archive current week's division data
      const divisions = await db.query('SELECT * FROM divisions ORDER BY points DESC');
      
      for (let i = 0; i < divisions.length; i++) {
        const division = divisions[i];
        await db.execute(
          `INSERT INTO weekly_history 
           (week_id, division_id, division_name, final_points, final_level, final_rank, achievements) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            currentWeek.id,
            division.id,
            division.name,
            division.points,
            division.level,
            i + 1, // rank
            JSON.stringify(division.achievements || [])
          ]
        );
      }

      // Mark current week as completed
      await db.execute(
        'UPDATE weeks SET status = ?, end_date = ? WHERE id = ?',
        ['completed', new Date(), currentWeek.id]
      );
    }

    // Create new week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    
    const weekNumber = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));

    const newWeekResult = await db.execute(
      'INSERT INTO weeks (week_number, start_date, end_date, status) VALUES (?, ?, ?, ?)',
      [weekNumber, startOfWeek, endOfWeek, 'active']
    );

    // Reset all division points to 0
    await db.execute('UPDATE divisions SET points = 0, level = 1, total_badges = 0');

    // Log the reset
    await db.execute(
      'INSERT INTO point_updates (division_id, points_change, reason, updated_by) SELECT id, -points, ?, ? FROM divisions WHERE points > 0',
      ['Weekly reset - points cleared', 'system']
    );

    console.log(`Weekly reset completed. New week ${weekNumber} started.`);
    
    return {
      success: true,
      weekNumber,
      resetDate: now,
      divisionsReset: divisions.length || 0
    };

  } catch (error) {
    console.error('Error during weekly reset:', error);
    throw error;
  }
};

const getCurrentWeek = async () => {
  try {
    const week = await db.queryOne(
      'SELECT * FROM weeks WHERE status = ?',
      ['active']
    );
    return week;
  } catch (error) {
    console.error('Error getting current week:', error);
    throw error;
  }
};

const getWeekHistory = async (limit = 10, offset = 0) => {
  try {
    const weeks = await db.query(
      'SELECT * FROM weeks WHERE status = ? ORDER BY start_date DESC LIMIT ? OFFSET ?',
      ['completed', limit, offset]
    );
    return weeks;
  } catch (error) {
    console.error('Error getting week history:', error);
    throw error;
  }
};

const getWeekDetails = async (weekId) => {
  try {
    const week = await db.queryOne(
      'SELECT * FROM weeks WHERE id = ?',
      [weekId]
    );

    if (!week) {
      return null;
    }

    const divisions = await db.query(
      'SELECT * FROM weekly_history WHERE week_id = ? ORDER BY final_rank ASC',
      [weekId]
    );

    return {
      week,
      divisions
    };
  } catch (error) {
    console.error('Error getting week details:', error);
    throw error;
  }
};

module.exports = {
  autoStartNewWeek,
  getCurrentWeek,
  getWeekHistory,
  getWeekDetails
};
