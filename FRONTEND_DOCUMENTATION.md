# Dokumentasi Frontend - Leaderboard Gamifikasi

## Overview

Frontend aplikasi leaderboard gamifikasi dibangun menggunakan **React 18** dengan **Tailwind CSS** untuk styling dan **React Router DOM** untuk routing. Aplikasi ini menyediakan interface yang responsif dan interaktif untuk menampilkan leaderboard, riwayat mingguan, dan panel admin.

## Struktur Komponen

```
client/src/
├── components/           # React Components
│   ├── Leaderboard.js    # Komponen utama leaderboard
│   ├── AdminPanel.js     # Panel admin dengan login
│   ├── WeeklyHistory.js  # Riwayat mingguan
│   ├── Login.js          # Form login
│   ├── Navigation.js     # Navigasi utama
│   └── ProtectedRoute.js # Route protection
├── contexts/             # React Contexts
│   └── AuthContext.js    # Authentication context
├── services/             # API Services
│   └── api.js           # API client
└── App.js               # Root component
```

## Komponen Utama

### 1. App.js - Root Component

**File**: `client/src/App.js`

Komponen root yang mengatur routing dan context providers.

**Fitur:**
- Authentication provider
- Route protection untuk admin panel
- Navigation wrapper
- Error boundaries

**Props:** Tidak ada

**State:** Tidak ada

**Dependencies:**
- `react-router-dom`
- `AuthContext`
- Semua komponen utama

```jsx
// Contoh penggunaan
<AuthProvider>
  <Router>
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <div>
            <Navigation />
            <Routes>
              <Route path="/" element={<Leaderboard />} />
              <Route path="/history" element={<WeeklyHistory />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        } />
      </Routes>
    </div>
  </Router>
</AuthProvider>
```

### 2. Leaderboard.js - Komponen Utama

**File**: `client/src/components/Leaderboard.js`

Komponen utama yang menampilkan leaderboard dengan fitur sorting, filtering, dan real-time updates.

**Fitur:**
- Tampilan leaderboard responsif
- Sorting berdasarkan poin/level/rank
- Filter berdasarkan divisi
- Real-time updates
- Loading states
- Error handling

**Props:** Tidak ada

**State:**
```javascript
{
  divisions: [],           // Data divisi
  currentWeek: null,       // Minggu aktif
  loading: false,          // Loading state
  error: null,             // Error state
  sortBy: 'points',        // Sorting field
  sortOrder: 'desc',       // Sort order
  searchTerm: '',          // Search filter
  selectedDivision: null   // Filter divisi
}
```

**Methods:**
- `fetchLeaderboard()` - Ambil data leaderboard
- `handleSort(field)` - Handle sorting
- `handleSearch(term)` - Handle search
- `handleDivisionFilter(division)` - Filter divisi
- `refreshData()` - Refresh data

**Events:**
- `onSort` - Ketika user mengklik header untuk sort
- `onSearch` - Ketika user mengetik di search box
- `onFilter` - Ketika user memilih filter divisi

### 3. AdminPanel.js - Panel Admin

**File**: `client/src/components/AdminPanel.js`

Panel admin yang menyediakan interface untuk login admin dan manajemen sistem.

**Fitur:**
- Form login admin
- Interface update poin divisi
- Reset mingguan manual
- Monitoring aktivitas
- Point history

**Props:** Tidak ada

**State:**
```javascript
{
  isLoggedIn: false,       // Status login
  loading: false,          // Loading state
  error: null,             // Error state
  divisions: [],           // List divisi
  selectedDivision: null,  // Divisi yang dipilih
  pointsChange: 0,         // Perubahan poin
  reason: '',              // Alasan perubahan
  pointHistory: [],        // Riwayat poin
  showHistory: false       // Toggle history view
}
```

**Methods:**
- `handleLogin(credentials)` - Handle login
- `handleLogout()` - Handle logout
- `updatePoints()` - Update poin divisi
- `resetWeek()` - Reset mingguan manual
- `fetchPointHistory()` - Ambil riwayat poin

**Events:**
- `onLogin` - Ketika admin berhasil login
- `onLogout` - Ketika admin logout
- `onPointsUpdate` - Ketika poin diupdate
- `onWeekReset` - Ketika minggu direset

### 4. WeeklyHistory.js - Riwayat Mingguan

**File**: `client/src/components/WeeklyHistory.js`

Komponen yang menampilkan riwayat peringkat mingguan dengan grafik dan tabel.

**Fitur:**
- Tabel riwayat mingguan
- Grafik tren performa
- Filter berdasarkan periode
- Export data (opsional)

**Props:** Tidak ada

**State:**
```javascript
{
  history: [],             // Data riwayat
  loading: false,          // Loading state
  error: null,             // Error state
  selectedWeek: null,      // Minggu yang dipilih
  chartData: [],           // Data untuk grafik
  viewMode: 'table'        // Mode tampilan (table/chart)
}
```

**Methods:**
- `fetchHistory()` - Ambil data riwayat
- `generateChartData()` - Generate data grafik
- `handleWeekSelect(week)` - Pilih minggu
- `toggleViewMode()` - Toggle mode tampilan

**Events:**
- `onWeekSelect` - Ketika user memilih minggu
- `onViewModeChange` - Ketika mode tampilan berubah

### 5. Login.js - Form Login

**File**: `client/src/components/Login.js`

Komponen form login untuk admin dengan validasi dan error handling.

**Fitur:**
- Form login dengan validasi
- Error handling
- Loading state
- Responsive design

**Props:** Tidak ada

**State:**
```javascript
{
  username: '',            // Username input
  password: '',            // Password input
  loading: false,          // Loading state
  error: null,             // Error state
  showPassword: false      // Toggle password visibility
}
```

**Methods:**
- `handleSubmit(e)` - Handle form submission
- `handleInputChange(e)` - Handle input changes
- `togglePasswordVisibility()` - Toggle password visibility
- `validateForm()` - Validasi form

**Events:**
- `onSubmit` - Ketika form disubmit
- `onInputChange` - Ketika input berubah

### 6. Navigation.js - Navigasi Utama

**File**: `client/src/components/Navigation.js`

Komponen navigasi yang menyediakan menu utama dan status login.

**Fitur:**
- Menu navigasi responsif
- Status login admin
- Mobile menu toggle
- Active route highlighting

**Props:** Tidak ada

**State:**
```javascript
{
  isMobileMenuOpen: false, // Mobile menu state
  isLoggedIn: false        // Login status
}
```

**Methods:**
- `toggleMobileMenu()` - Toggle mobile menu
- `handleLogout()` - Handle logout
- `isActiveRoute(path)` - Check active route

**Events:**
- `onMenuToggle` - Ketika menu mobile di-toggle
- `onLogout` - Ketika user logout

### 7. ProtectedRoute.js - Route Protection

**File**: `client/src/components/ProtectedRoute.js`

Komponen HOC untuk melindungi route yang memerlukan authentication.

**Props:**
- `children` - Komponen yang akan di-render jika authenticated

**State:** Tidak ada

**Methods:** Tidak ada

**Usage:**
```jsx
<ProtectedRoute>
  <AdminPanel />
</ProtectedRoute>
```

## Context Management

### AuthContext.js

**File**: `client/src/contexts/AuthContext.js`

Context untuk mengelola state authentication global.

**State:**
```javascript
{
  isAuthenticated: false,  // Status authentication
  user: null,              // Data user
  token: null,             // JWT token
  loading: false           // Loading state
}
```

**Methods:**
- `login(credentials)` - Login user
- `logout()` - Logout user
- `checkAuth()` - Check authentication status
- `setToken(token)` - Set JWT token

**Usage:**
```jsx
const { isAuthenticated, login, logout } = useContext(AuthContext);
```

## API Services

### api.js

**File**: `client/src/services/api.js`

Service untuk komunikasi dengan backend API.

**Methods:**
- `get(endpoint)` - GET request
- `post(endpoint, data)` - POST request
- `put(endpoint, data)` - PUT request
- `delete(endpoint)` - DELETE request
- `setAuthToken(token)` - Set auth token
- `removeAuthToken()` - Remove auth token

**Usage:**
```javascript
import api from '../services/api';

// Get leaderboard
const leaderboard = await api.get('/leaderboard');

// Login
const response = await api.post('/auth/login', credentials);

// Update points (with auth)
const result = await api.post('/admin/update-points', data);
```

## Styling dan UI

### Tailwind CSS

Aplikasi menggunakan Tailwind CSS untuk styling dengan konfigurasi custom.

**Konfigurasi**: `client/tailwind.config.js`

**Fitur:**
- Utility-first CSS
- Responsive design
- Custom color palette
- Component-based styling

### Design System

**Colors:**
- Primary: `#22C55E` (Green)
- Secondary: `#3B82F6` (Blue)
- Danger: `#EF4444` (Red)
- Warning: `#F59E0B` (Yellow)
- Gray: `#6B7280` (Gray)

**Typography:**
- Font Family: Inter (default)
- Headings: Font weight 600-700
- Body: Font weight 400-500

**Spacing:**
- Consistent spacing scale
- Responsive padding/margin
- Component spacing

## Responsive Design

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Mobile-First Approach
- Base styles untuk mobile
- Progressive enhancement untuk tablet/desktop
- Touch-friendly interactions
- Optimized navigation

## Development

### Scripts
```bash
# Development
npm start

# Build production
npm run build

# Test
npm test

# Eject (not recommended)
npm run eject
```

### Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^7.8.1",
  "tailwindcss": "^3.4.0",
  "@heroicons/react": "^2.2.0"
}
```

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## Testing

### Component Testing
- Unit tests untuk setiap komponen
- Integration tests untuk user flows
- Snapshot testing untuk UI consistency

### Test Structure
```
__tests__/
├── components/
│   ├── Leaderboard.test.js
│   ├── AdminPanel.test.js
│   └── Login.test.js
└── services/
    └── api.test.js
```

## Performance

### Optimization Techniques
- **Code Splitting**: Lazy loading untuk routes
- **Memoization**: React.memo untuk komponen
- **Bundle Optimization**: Tree shaking
- **Image Optimization**: WebP format support

### Best Practices
- Avoid unnecessary re-renders
- Use proper key props
- Optimize bundle size
- Implement proper error boundaries

## Debugging

### Development Tools
- React Developer Tools
- Redux DevTools (if using Redux)
- Network tab untuk API calls
- Console logging

### Common Issues
1. **CORS Errors**: Check API URL configuration
2. **Authentication Issues**: Verify JWT token handling
3. **State Management**: Check context providers
4. **Routing Issues**: Verify route configuration

## Best Practices

### Code Organization
- Consistent file naming
- Component composition
- Proper prop drilling
- Clean component structure

### State Management
- Use context for global state
- Local state untuk component-specific data
- Avoid prop drilling
- Proper error handling

### Performance
- Lazy load components
- Optimize re-renders
- Use proper dependencies
- Monitor bundle size

---