// Mock data service for development when database is not available
const mockData = {
  weeks: [
    {
      id: 1,
      week_number: 1,
      start_date: new Date('2025-08-18'), // Monday of current week
      end_date: new Date('2025-08-24'),   // Sunday of current week
      status: 'active',
      created_at: new Date('2025-08-18')
    }
  ],
  divisions: [
    {
      id: 1,
      name: 'Engineering Division',
      description: 'Software development teams',
      color: '#22C55E',
      rank: 1,
      points: 1250,
      level: 3,
      total_badges: 5,
      badges: JSON.stringify(['Innovation Award', 'Excellence Badge', 'Team Player', 'Code Master', 'Tech Leader']),
      achievements: JSON.stringify(['Innovation Award', 'Team Player', 'Project Excellence']),
      week_id: 1,
      last_updated: new Date(),
      created_at: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Marketing Division',
      description: 'Marketing and communications',
      color: '#10B981',
      rank: 4,
      points: 980,
      level: 2,
      total_badges: 3,
      badges: JSON.stringify(['Creative Excellence', 'Brand Master', 'Campaign Star']),
      achievements: JSON.stringify(['Creative Excellence', 'Campaign Success']),
      week_id: 1,
      last_updated: new Date(),
      created_at: new Date('2024-01-01')
    },
    {
      id: 3,
      name: 'Sales Division',
      description: 'Sales and business development',
      color: '#F59E0B',
      rank: 2,
      points: 1100,
      level: 3,
      total_badges: 4,
      badges: JSON.stringify(['Revenue Champion', 'Client Focus', 'Deal Closer', 'Growth Leader']),
      achievements: JSON.stringify(['Revenue Champion', 'Client Focus', 'Quarter Winner']),
      week_id: 1,
      last_updated: new Date(),
      created_at: new Date('2024-01-01')
    },
    {
      id: 4,
      name: 'HR Division',
      description: 'Human resources and talent',
      color: '#8B5CF6',
      rank: 5,
      points: 750,
      level: 2,
      total_badges: 2,
      badges: JSON.stringify(['People First', 'Culture Builder']),
      achievements: JSON.stringify(['People First', 'Team Builder']),
      week_id: 1,
      last_updated: new Date(),
      created_at: new Date('2024-01-01')
    },
    {
      id: 5,
      name: 'Finance Division',
      description: 'Financial planning and analysis',
      color: '#EF4444',
      rank: 3,
      points: 890,
      level: 2,
      total_badges: 3,
      badges: JSON.stringify(['Financial Excellence', 'Budget Master', 'Analyst Pro']),
      achievements: JSON.stringify(['Financial Excellence', 'Budget Achievement']),
      week_id: 1,
      last_updated: new Date(),
      created_at: new Date('2024-01-01')
    }
  ],
  pointUpdates: [
    {
      id: 1,
      division_id: 1,
      points_change: 100,
      reason: 'Completed project milestone',
      updated_by: 'admin',
      created_at: new Date()
    },
    {
      id: 2,
      division_id: 2,
      points_change: 50,
      reason: 'Team collaboration bonus',
      updated_by: 'admin',
      created_at: new Date()
    }
  ],
  weeklyHistory: [],
  adminUsers: [
    {
      id: 1,
      username: 'admin',
      password_hash: '$2a$10$8RdnC78NfHw.TX6ITeqvteXjo.yLtUMY1m5/ussCY/bWDdaBz/WYK', // password: admin123
      created_at: new Date()
    }
  ]
};

let nextId = 10;

const initializeDatabase = async () => {
  console.log('Using mock database for development');
  console.log('Database initialization completed (mock mode)');
  return Promise.resolve();
};

const query = async (sql, params = []) => {
  console.log('Mock query:', sql, params);
  
  // Leaderboard query with rank calculation
  if (sql.includes('ROW_NUMBER() OVER (ORDER BY points DESC)')) {
    let divisions = [...mockData.divisions];
    
    // Apply search if needed
    if (params.length > 2 && sql.includes('WHERE')) {
      const searchTerm = params[0].replace(/%/g, '').toLowerCase();
      divisions = divisions.filter(div => 
        div.name.toLowerCase().includes(searchTerm) || 
        div.points.toString().includes(searchTerm)
      );
    }
    
    // Apply sorting - determine sort field from URL params or SQL
    let sortBy = 'points';
    let sortOrder = 'desc';
    
    // Check the actual SQL ORDER BY clause
    if (sql.includes('ORDER BY name')) {
      sortBy = 'name';
    } else if (sql.includes('ORDER BY rank')) {
      sortBy = 'rank';
    }
    
    if (sql.includes('ASC')) {
      sortOrder = 'asc';
    }
    
    if (sortBy === 'name') {
      divisions.sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
    } else if (sortBy === 'rank') {
      // For rank sorting: we need to sort by points first, then reverse if needed
      // Best rank (1) = highest points, Worst rank (5) = lowest points
      divisions.sort((a, b) => b.points - a.points); // Sort by points desc first
      
      if (sortOrder === 'desc') {
        // Rank desc = worst rank first (5,4,3,2,1) = lowest points first
        divisions.reverse();
      }
      // For rank asc = best rank first (1,2,3,4,5) = highest points first (already sorted)
    } else {
      // Default points sorting
      divisions.sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.points - b.points
          : b.points - a.points;
      });
    }
    
    // Calculate true performance ranks (always based on ALL divisions, not just search results)
    const allDivisionsSorted = [...mockData.divisions].sort((a, b) => b.points - a.points);
    const performanceRanks = {};
    allDivisionsSorted.forEach((div, index) => {
      performanceRanks[div.id] = index + 1;
    });
    
    // Format data with both performance rank and display position
    const rankedDivisions = divisions.map((division, index) => ({
      id: division.id,
      name: division.name,
      points: division.points,
      level: division.level,
      badges: division.total_badges,
      achievements: division.achievements,
      rank: performanceRanks[division.id], // True performance rank (based on points)
      display_position: index + 1, // Current position in sorted list
      display_color: performanceRanks[division.id] === 1 ? '#FFD700' :
                    performanceRanks[division.id] === 2 ? '#C0C0C0' :
                    performanceRanks[division.id] === 3 ? '#CD7F32' : '#1f2937'
    }));
    
    // Apply pagination
    const limit = parseInt(params[params.length - 2]) || 10;
    const offset = parseInt(params[params.length - 1]) || 0;
    
    return rankedDivisions.slice(offset, offset + limit);
  }
  
  // Simple divisions query
  if (sql.includes('SELECT * FROM divisions')) {
    return mockData.divisions.sort((a, b) => b.points - a.points);
  }
  
  // Divisions ordered by points and name
  if (sql.includes('ORDER BY points DESC, name ASC')) {
    return mockData.divisions.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.name.localeCompare(b.name);
    });
  }
  
  // Count divisions (with search)
  if (sql.includes('SELECT COUNT(*) as count FROM divisions')) {
    let count = mockData.divisions.length;
    
    // Apply search filter if WHERE clause exists
    if (params.length > 0 && sql.includes('WHERE')) {
      const searchTerm = params[0].replace(/%/g, '').toLowerCase();
      const filteredDivisions = mockData.divisions.filter(div => 
        div.name.toLowerCase().includes(searchTerm) || 
        div.points.toString().includes(searchTerm)
      );
      count = filteredDivisions.length;
    }
    
    return [{ count }];
  }
  
  // Sum of points
  if (sql.includes('SELECT SUM(points) as total_points FROM divisions')) {
    const totalPoints = mockData.divisions.reduce((sum, div) => sum + div.points, 0);
    return [{ total_points: totalPoints }];
  }
  
  // Top division
  if (sql.includes('SELECT name, points FROM divisions ORDER BY points DESC LIMIT 1')) {
    const topDivision = mockData.divisions.sort((a, b) => b.points - a.points)[0];
    return [{ name: topDivision.name, points: topDivision.points }];
  }
  
  // Weeks query
  if (sql.includes('SELECT * FROM weeks')) {
    return mockData.weeks;
  }
  
  // Point updates query
  if (sql.includes('FROM point_updates')) {
    return mockData.pointUpdates;
  }
  
  return [];
};

const queryOne = async (sql, params = []) => {
  console.log('Mock queryOne:', sql, params);
  
  if (sql.includes('FROM weeks WHERE status')) {
    return mockData.weeks.find(w => w.status === 'active');
  }
  
  if (sql.includes('FROM divisions WHERE id')) {
    const id = parseInt(params[0]);
    return mockData.divisions.find(d => d.id === id);
  }
  
  if (sql.includes('FROM divisions WHERE name')) {
    const name = params[0];
    return mockData.divisions.find(d => d.name === name);
  }
  
  if (sql.includes('FROM admin_users WHERE username')) {
    const username = params[0];
    return mockData.adminUsers.find(u => u.username === username);
  }
  
  return null;
};

const execute = async (sql, params = []) => {
  console.log('Mock execute:', sql, params);
  
  if (sql.includes('INSERT INTO divisions')) {
    const newDivision = {
      id: nextId++,
      name: params[0],
      color: params[1] || '#22C55E',
      rank: params[2] || mockData.divisions.length + 1,
      description: '',
      points: 0,
      level: 1,
      total_badges: 0,
      badges: JSON.stringify([]),
      achievements: JSON.stringify([]),
      week_id: params[3] || 1,
      last_updated: new Date(),
      created_at: new Date()
    };
    mockData.divisions.push(newDivision);
    return { lastID: newDivision.id, changes: 1 };
  }
  
  if (sql.includes('INSERT INTO admin_users')) {
    const newAdmin = {
      id: nextId++,
      username: params[0],
      password_hash: params[1],
      created_at: new Date()
    };
    mockData.adminUsers.push(newAdmin);
    console.log('Mock: Created admin user:', newAdmin.username);
    return { lastID: newAdmin.id, changes: 1 };
  }
  
  if (sql.includes('UPDATE divisions')) {
    // Simple mock update
    return { lastID: null, changes: 1 };
  }
  
  if (sql.includes('INSERT INTO point_updates')) {
    const newUpdate = {
      id: nextId++,
      division_id: params[0],
      points_change: params[1],
      reason: params[2],
      updated_by: params[3],
      created_at: new Date()
    };
    mockData.pointUpdates.push(newUpdate);
    return { lastID: newUpdate.id, changes: 1 };
  }
  
  return { lastID: null, changes: 1 };
};

const close = async () => {
  console.log('Mock database connection closed');
  return Promise.resolve();
};

module.exports = {
  initializeDatabase,
  query,
  queryOne,
  execute,
  close,
  pool: () => null
};
