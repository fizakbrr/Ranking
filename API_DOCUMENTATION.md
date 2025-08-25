# Dokumentasi API - Leaderboard

## Overview

API ini menyediakan endpoint untuk mengelola sistem leaderboard gamifikasi dengan fitur divisi, poin, dan reset mingguan otomatis.

**Base URL**: `http://localhost:5000/api` (development)  
**Content-Type**: `application/json`  
**Authentication**: JWT Bearer Token (untuk endpoint admin)

## Authentication

### Login Admin
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Logout Admin
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 🏢 Divisi Management

### Get All Divisi
```http
GET /api/divisions
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Divisi IT",
      "color": "#22C55E",
      "rank": 1,
      "description": "Divisi Teknologi Informasi",
      "points": 1500,
      "level": 3,
      "week_id": 1,
      "last_updated": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Divisi
```http
POST /api/divisions
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Divisi Marketing",
  "color": "#3B82F6",
  "description": "Divisi Pemasaran"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Divisi Marketing",
    "color": "#3B82F6",
    "rank": 2,
    "description": "Divisi Pemasaran",
    "points": 0,
    "level": 1,
    "week_id": 1,
    "created_at": "2024-01-15T11:00:00Z"
  }
}
```

### Update Divisi
```http
PUT /api/divisions/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Divisi IT Updated",
  "color": "#EF4444",
  "description": "Divisi IT yang sudah diupdate"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Divisi IT Updated",
    "color": "#EF4444",
    "description": "Divisi IT yang sudah diupdate",
    "points": 1500,
    "level": 3,
    "rank": 1
  }
}
```

### Delete Divisi
```http
DELETE /api/divisions/:id
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Divisi deleted successfully"
}
```

## Leaderboard

### Get Current Leaderboard
```http
GET /api/leaderboard
```

**Query Parameters:**
- `sort` (optional): `points`, `level`, `rank`, `name`
- `order` (optional): `asc`, `desc` (default: `desc`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "current_week": {
      "id": 1,
      "week_number": 3,
      "start_date": "2024-01-15T00:00:00Z",
      "end_date": "2024-01-21T23:59:59Z",
      "status": "active"
    },
    "divisions": [
      {
        "id": 1,
        "name": "Divisi IT",
        "color": "#22C55E",
        "rank": 1,
        "points": 1500,
        "level": 3,
        "description": "Divisi Teknologi Informasi"
      },
      {
        "id": 2,
        "name": "Divisi Marketing",
        "color": "#3B82F6",
        "rank": 2,
        "points": 1200,
        "level": 2,
        "description": "Divisi Pemasaran"
      }
    ]
  }
}
```

### Get Leaderboard History
```http
GET /api/leaderboard/history
```

**Query Parameters:**
- `week_id` (optional): ID minggu tertentu
- `limit` (optional): Jumlah data (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "week": {
        "id": 1,
        "week_number": 2,
        "start_date": "2024-01-08T00:00:00Z",
        "end_date": "2024-01-14T23:59:59Z",
        "status": "completed"
      },
      "divisions": [
        {
          "division_name": "Divisi IT",
          "final_points": 1800,
          "final_level": 4,
          "final_rank": 1,
          "achievements": ["Top Performer", "Level Up"]
        }
      ]
    }
  ]
}
```

## Admin Operations

### Update Points
```http
POST /api/admin/update-points
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "division_id": 1,
  "points_change": 100,
  "reason": "Achievement bonus"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "division": {
      "id": 1,
      "name": "Divisi IT",
      "points": 1600,
      "level": 3,
      "rank": 1
    },
    "update": {
      "id": 1,
      "points_change": 100,
      "reason": "Achievement bonus",
      "updated_by": "admin",
      "created_at": "2024-01-15T12:00:00Z"
    }
  }
}
```

### Manual Week Reset
```http
POST /api/admin/reset-week
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Week reset completed successfully",
  "data": {
    "old_week": {
      "id": 1,
      "week_number": 3,
      "status": "completed"
    },
    "new_week": {
      "id": 2,
      "week_number": 4,
      "status": "active"
    }
  }
}
```

### Get Point History
```http
GET /api/admin/point-history
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `division_id` (optional): Filter berdasarkan divisi
- `limit` (optional): Jumlah data (default: 50)
- `offset` (optional): Offset data (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "division": {
        "id": 1,
        "name": "Divisi IT"
      },
      "points_change": 100,
      "reason": "Achievement bonus",
      "updated_by": "admin",
      "created_at": "2024-01-15T12:00:00Z"
    }
  ]
}
```

## Week Management

### Get All Weeks
```http
GET /api/weeks
```

**Query Parameters:**
- `status` (optional): `active`, `completed`
- `limit` (optional): Jumlah data

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "week_number": 3,
      "start_date": "2024-01-15T00:00:00Z",
      "end_date": "2024-01-21T23:59:59Z",
      "status": "active",
      "created_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### Create New Week
```http
POST /api/weeks
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "week_number": 4,
  "start_date": "2024-01-22T00:00:00Z",
  "end_date": "2024-01-28T23:59:59Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "week_number": 4,
    "start_date": "2024-01-22T00:00:00Z",
    "end_date": "2024-01-28T23:59:59Z",
    "status": "active",
    "created_at": "2024-01-22T00:00:00Z"
  }
}
```

## Health Check

### System Status
```http
GET /api/health
```

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T12:00:00Z",
  "environment": "development",
  "database": "connected"
}
```

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Something went wrong!",
  "error": "Database connection failed"
}
```

## Rate Limiting

API menggunakan rate limiting untuk mencegah abuse:
- **Limit**: 100 requests per 15 menit per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Limit maksimum
  - `X-RateLimit-Remaining`: Sisa request
  - `X-RateLimit-Reset`: Waktu reset

## Security Headers

API menggunakan Helmet.js untuk security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)

## Notes

1. **Authentication**: Semua endpoint admin memerlukan JWT token di header `Authorization: Bearer <token>`
2. **CORS**: API mendukung CORS untuk development dan production
3. **Validation**: Semua input divalidasi sebelum diproses
4. **Logging**: Semua request dan error di-log untuk monitoring
5. **Database**: Mendukung PostgreSQL, SQLite, dan Mock database

## Testing

### Contoh Request dengan cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

**Get Leaderboard:**
```bash
curl -X GET http://localhost:5000/api/leaderboard
```

**Update Points (dengan auth):**
```bash
curl -X POST http://localhost:5000/api/admin/update-points \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{"division_id": 1, "points_change": 100, "reason": "Bonus"}'
```

---

**API Version**: 1.0.0  
**Last Updated**: January 2024
