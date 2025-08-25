### Installation

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

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Dokumentation

- **[Dokumentasi Lengkap](DOCUMENTATION.md)** 
- **[API Documentation](API_DOCUMENTATION.md)**
- **[Frontend Documentation](FRONTEND_DOCUMENTATION.md)**