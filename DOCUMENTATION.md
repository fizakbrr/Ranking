## Arsitektur Sistem

### Tech Stack
- **Frontend**: React 18, React Router DOM, Tailwind CSS, Heroicons
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (production), SQLite (development), Mock (demo)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting, bcryptjs
- **Scheduling**: node-cron untuk reset mingguan otomatis

### Struktur Proyek
```
ranking/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
├── src/                    # Backend Node.js
│   ├── config/            # Database configurations
│   ├── controllers/       # Business logic
│   ├── middleware/        # Express middleware
│   └── routes/            # API routes
└── server.js              # Entry point server
```

## Instalasi dan Setup

### Prerequisites
- Node.js (v14 atau lebih baru)
- npm atau yarn
- PostgreSQL (opsional, untuk production)

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd ranking
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client && npm install
   ```

3. **Setup environment variables**
   Buat file `.env` di root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   DB_TYPE=mock  # mock, sqlite, atau postgresql
   
   # Untuk PostgreSQL (opsional)
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=leaderboard_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Jalankan aplikasi**
   ```bash
   # Jalankan frontend dan backend secara bersamaan
   npm run dev:both
   
   # Atau jalankan secara terpisah:
   # Backend: npm start
   # Frontend: cd client && npm start
   ```

## Fitur Utama

### 1. Leaderboard Dinamis
- Menampilkan peringkat divisi berdasarkan poin
- Update real-time saat ada perubahan poin
- Sistem level dan ranking otomatis
- Warna divisi yang dapat dikustomisasi

### 2. Sistem Gamifikasi
- **Level System**: Divisi naik level berdasarkan poin
- **Achievement System**: Sistem pencapaian untuk divisi
- **Weekly Reset**: Reset otomatis setiap minggu
- **Point History**: Riwayat perubahan poin

### 3. Admin Panel
- Login admin dengan JWT authentication
- Manajemen poin divisi (tambah/kurang)
- Reset manual mingguan
- Monitoring aktivitas sistem

### 4. Weekly History
- Riwayat peringkat mingguan
- Data historis divisi
- Analisis tren performa

## Database Schema

### Tabel Utama

#### 1. `weeks` - Manajemen Minggu
```sql
CREATE TABLE weeks (
  id SERIAL PRIMARY KEY,
  week_number INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `divisions` - Data Divisi
```sql
CREATE TABLE divisions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#22C55E',
  rank INTEGER DEFAULT 1,
  description TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  week_id INTEGER REFERENCES weeks(id),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `weekly_history` - Riwayat Mingguan
```sql
CREATE TABLE weekly_history (
  id SERIAL PRIMARY KEY,
  week_id INTEGER REFERENCES weeks(id),
  division_id INTEGER REFERENCES divisions(id),
  division_name VARCHAR(255) NOT NULL,
  final_points INTEGER DEFAULT 0,
  final_level INTEGER DEFAULT 1,
  final_rank INTEGER,
  achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `admin_users` - User Admin
```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. `point_updates` - Riwayat Update Poin
```sql
CREATE TABLE point_updates (
  id SERIAL PRIMARY KEY,
  division_id INTEGER REFERENCES divisions(id),
  points_change INTEGER NOT NULL,
  reason TEXT,
  updated_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login admin
- `POST /api/auth/logout` - Logout admin

### Divisi
- `GET /api/divisions` - Ambil semua divisi
- `POST /api/divisions` - Buat divisi baru
- `PUT /api/divisions/:id` - Update divisi
- `DELETE /api/divisions/:id` - Hapus divisi

### Leaderboard
- `GET /api/leaderboard` - Ambil data leaderboard
- `GET /api/leaderboard/history` - Ambil riwayat mingguan

### Admin
- `POST /api/admin/update-points` - Update poin divisi
- `POST /api/admin/reset-week` - Reset mingguan manual
- `GET /api/admin/point-history` - Riwayat update poin

### Weeks
- `GET /api/weeks` - Ambil data minggu
- `POST /api/weeks` - Buat minggu baru

## Komponen Frontend

### 1. `Leaderboard.js`
Komponen utama yang menampilkan leaderboard dengan fitur:
- Sorting berdasarkan poin/level/rank
- Filter berdasarkan divisi
- Real-time updates
- Responsive design

### 2. `AdminPanel.js`
Panel admin dengan fitur:
- Form login admin
- Interface update poin
- Monitoring sistem
- Reset mingguan manual

### 3. `WeeklyHistory.js`
Menampilkan riwayat mingguan dengan:
- Tabel historis peringkat
- Grafik tren performa
- Filter berdasarkan periode

### 4. `Navigation.js`
Navigasi utama aplikasi dengan:
- Menu responsive
- Status login admin
- Routing antar halaman

## Sistem Keamanan

### 1. Authentication & Authorization
- JWT-based authentication untuk admin
- Password hashing dengan bcryptjs
- Protected routes untuk admin panel

### 2. Security Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Pembatasan request per IP
- **Input Validation**: Validasi input user

### 3. Database Security
- Parameterized queries untuk mencegah SQL injection
- Connection pooling untuk PostgreSQL
- Environment-based configuration

## Fitur Otomatis

### Weekly Reset Cron Job
```javascript
// Reset otomatis setiap Senin jam 00:00
cron.schedule('0 0 * * 1', async () => {
  try {
    console.log('Running weekly reset...');
    await weekController.autoStartNewWeek();
    console.log('Weekly reset completed successfully');
  } catch (error) {
    console.error('Error during weekly reset:', error);
  }
});
```

### Proses Reset Mingguan
1. Backup data minggu aktif ke `weekly_history`
2. Reset poin semua divisi ke 0
3. Buat minggu baru
4. Update status minggu lama menjadi 'completed'

## UI/UX Features

### Design System
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Icon library
- **Responsive Design**: Mobile-first approach
- **Color Coding**: Divisi dengan warna unik

### User Experience
- Real-time updates tanpa refresh
- Loading states dan error handling
- Intuitive navigation
- Consistent design language

## Testing dan Development

### Development Scripts
```bash
# Development mode dengan hot reload
npm run dev:both

# Build production
npm run build

# Start production server
npm start
```

### Database Options
1. **Mock Database**: Untuk demo/development cepat
2. **SQLite**: Untuk development lokal
3. **PostgreSQL**: Untuk production

## Monitoring dan Logging

### Logging
- **Morgan**: HTTP request logging
- **Console logging**: Error tracking
- **Database logging**: Query monitoring

### Health Check
- `GET /api/health` - Status aplikasi
- Database connection monitoring
- Server uptime tracking

## Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure PostgreSQL database
3. Set environment variables
4. Build frontend: `npm run build`
5. Start server: `npm start`

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5000
DB_TYPE=postgresql
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_secure_jwt_secret
```

## Maintenance

### Regular Tasks
- Monitor database performance
- Backup data mingguan
- Update dependencies
- Review security logs

### Troubleshooting
- Check database connections
- Monitor cron job execution
- Review error logs
- Verify API endpoints

## Changelog

### Version 1.0.0
- Initial release
- Basic leaderboard functionality
- Admin panel
- Weekly reset system
- Multiple database support