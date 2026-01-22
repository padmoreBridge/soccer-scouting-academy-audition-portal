# Admin Portal API Documentation

## Base Information

- **Base URL**: `http://localhost:6003/api` (Development)
- **Note**: Update the port number if your server runs on a different port
- **Production URL**: Update with your production domain
- **API Prefix**: `/api`
- **Authentication**: JWT Bearer Token (except for auth endpoints)
- **Content-Type**: `application/json`
- **Response Format**: All responses follow a standardized format (see Common Response Format section)

## Quick Start for Frontend Integration

1. **Authentication**: Start by calling the login endpoint to get JWT tokens
2. **Token Storage**: Store `accessToken` and `refreshToken` securely (localStorage/sessionStorage)
3. **Request Headers**: Include `Authorization: Bearer <accessToken>` in all authenticated requests
4. **Token Refresh**: Use refresh token endpoint before access token expires
5. **Error Handling**: Check `success` field in response, handle errors appropriately
6. **Pagination**: Use `page` and `limit` query parameters for paginated endpoints

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication Endpoints

### 1.1 Login
**POST** `/api/admin/auth/login`

Authenticate admin user and receive JWT access and refresh tokens.

**Request Body:**
```json
{
  "email": "admin@soccerscoutingacademy.com",
  "password": "Admin@123"
}
```

**Note**: Default admin credentials (from seed migration):
- Email: `admin@soccerscoutingacademy.com`
- Password: `Admin@123` (or value from `ADMIN_DEFAULT_PASSWORD` environment variable)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin User",
      "roles": [
        {
          "id": "uuid",
          "name": "SUPER_ADMIN",
          "displayName": "Super Administrator",
          "permissions": [
            {
              "id": "uuid",
              "name": "users.create",
              "displayName": "Create Users"
            }
          ]
        }
      ],
      "permissions": [
        "users.create",
        "users.read",
        "users.update",
        "users.delete"
      ]
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

---

### 1.2 Refresh Token
**POST** `/api/admin/auth/refresh`

Generate a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid refresh token

---

### 1.3 Forgot Password
**POST** `/api/admin/auth/forgot-password`

Send password reset link to user email.

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

---

### 1.4 Reset Password
**POST** `/api/admin/auth/reset-password`

Reset password using the token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

---

## 2. Dashboard Endpoints

### 2.1 Get Dashboard Statistics
**GET** `/api/admin/dashboard/stats`

Retrieve comprehensive dashboard statistics including auditions, transactions, revenue with percentage changes, weekly data, and recent auditions.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved",
  "data": {
    "totalAuditions": 150,
    "pendingPayments": 10,
    "successfulTransactions": {
      "count": 120,
      "change": 15.5
    },
    "totalRevenue": {
      "amount": 1200.00,
      "change": 12.3
    },
    "activeUsers": 25,
    "todayAuditions": {
      "count": 5,
      "change": 25.0,
      "yesterdayCount": 4
    },
    "weeklyAuditionsData": [
      {
        "date": "2026-01-10",
        "count": 10
      },
      {
        "date": "2026-01-11",
        "count": 15
      },
      {
        "date": "2026-01-12",
        "count": 12
      },
      {
        "date": "2026-01-13",
        "count": 18
      },
      {
        "date": "2026-01-14",
        "count": 20
      },
      {
        "date": "2026-01-15",
        "count": 22
      },
      {
        "date": "2026-01-16",
        "count": 5
      }
    ],
    "transactionStatusCounts": {
      "successful": 120,
      "pending": 10,
      "failed": 20
    },
    "recentAuditions": [
      {
        "id": "uuid",
        "name": "John Doe",
        "msisdn": "233541840988",
        "status": "PAID",
        "processingId": "EA5C402A",
        "createdAt": "2026-01-16T10:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT token

---

## 3. Auditions Endpoints

### 3.1 Get All Auditions
**GET** `/api/admin/auditions`

Retrieve all auditions with pagination, filtering, and sorting. Returns formatted data with SMS status.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `status` (optional): Filter by payment status (`PENDING`, `PAID`, `FAILED`, `CANCELLED`)
- `customerNumber` (optional): Filter by customer phone number (partial match). Supports both formats: `233542042684` (with country code) or `0542042684` (without country code). The API automatically searches both formats.
- `smsStatus` (optional): Filter by SMS status (`PENDING`, `SENT`, `DELIVERED`, `FAILED`)
- `processingId` (optional): Filter by processing ID (exact match). The processing ID is the unique identifier sent to customers via SMS.
- `startDate` (optional): Start date filter (ISO string)
- `endDate` (optional): End date filter (ISO string)
- `sortBy` (optional, default: `createdAt`): Field to sort by. Available fields: `createdAt`, `updatedAt`, `name`, `age`, `region`, `status`, `msisdn`
- `position` (optional): Filter by soccer position (free text, case-insensitive partial match)
- `sortOrder` (optional, default: `DESC`): Sort order (`ASC` or `DESC`)

**Example Request:**
```
GET /api/admin/auditions?page=1&limit=10&status=PAID&smsStatus=SENT&position=Defender&startDate=2026-01-01T00:00:00.000Z&endDate=2026-01-16T23:59:59.999Z
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Auditions retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid",
        "customerNumber": "233541840988",
        "name": "John Doe",
        "age": 25,
        "region": "Greater Accra",
        "position": "Defender",
        "paymentStatus": "PAID",
        "smsSentStatus": "SENT",
        "processingId": "EA5C402A",
        "dateTime": "2026-01-16T10:00:00.000Z"
      }
    ],
    "total": 150
  },
  "metadata": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    },
    "sorting": {
      "field": "createdAt",
      "order": "desc"
    }
  }
}
```

---

### 3.2 Export Auditions
**GET** `/api/admin/auditions/export`

Export filtered auditions data as CSV file.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `status` (optional): Filter by payment status
- `customerNumber` (optional): Filter by customer phone number. Supports both formats: `233542042684` (with country code) or `0542042684` (without country code)
- `smsStatus` (optional): Filter by SMS status
- `processingId` (optional): Filter by processing ID (exact match)
- `startDate` (optional): Start date filter (ISO string)
- `endDate` (optional): End date filter (ISO string)

**Example Request:**
```
GET /api/admin/auditions/export?status=PAID&processingId=EA5C402A&startDate=2026-01-01T00:00:00.000Z
```

**Response (200 OK):**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="auditions-{timestamp}.csv"`
- CSV file with columns: Audition ID, Customer Number, Name, Age, Region, Position, Payment Status, SMS Status, Processing ID, Amount, Transaction ID, Date & Time

---

---

### 3.3 Get Single Audition
**GET** `/api/admin/auditions/:id`

Retrieve a single audition by ID with complete details including SMS status.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (UUID): Audition ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Audition retrieved successfully",
  "data": {
    "auditionId": "uuid",
    "name": "John Doe",
    "age": 25,
    "region": "Greater Accra",
    "position": "Defender",
    "number": "233541840988",
      "paymentStatus": "PAID",
      "amount": 10.00,
      "transactionId": "uuid",
      "processingId": "EA5C402A",
      "smsStatus": "SENT",
      "dateTime": "2026-01-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Audition not found

---

### 3.4 Resend SMS
**POST** `/api/admin/auditions/:id/sms/resend`

Resend processing ID SMS to the customer.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (UUID): Audition ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "SMS resent successfully"
}
```

**Error Responses:**
- `404 Not Found`: Audition not found

---

## 4. Transactions Endpoints

### 4.1 Get All Transactions
**GET** `/api/admin/transactions`

Retrieve all transactions with pagination and advanced filtering.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `status` (optional): Filter by status (`PENDING`, `SUCCESS`, `FAILED`)
- `customerNumber` (optional): Filter by customer phone number (partial match). Supports both formats: `233542042684` (with country code) or `0542042684` (without country code). The API automatically searches both formats.
- `network` (optional): Filter by network (`MTN`, `VOD`, `AIR`)
- `minAmount` (optional): Minimum amount filter
- `maxAmount` (optional): Maximum amount filter
- `startDate` (optional): Start date filter (ISO string)
- `endDate` (optional): End date filter (ISO string)
- `sortBy` (optional, default: `created_at`): Field to sort by. Available fields: `created_at`, `updated_at`, `amount`, `status`, `network`, `customer_number`
- `sortOrder` (optional, default: `DESC`): Sort order (`ASC` or `DESC`)

**Example Request:**
```
GET /api/admin/transactions?page=1&limit=10&status=SUCCESS&network=MTN&minAmount=5&maxAmount=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "data": [
      {
        "transactionId": "uuid",
        "customerNumber": "233541840988",
        "network": "MTN",
        "amount": 10.00,
        "paymentStatus": "SUCCESS",
        "dateTime": "2026-01-16T10:00:00.000Z"
      }
    ],
    "total": 150
  },
  "metadata": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

---

### 4.2 Export Transactions
**GET** `/api/admin/transactions/export`

Export filtered transactions data as CSV file.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `status` (optional): Filter by payment status
- `customerNumber` (optional): Filter by customer phone number. Supports both formats: `233542042684` (with country code) or `0542042684` (without country code)
- `network` (optional): Filter by network
- `minAmount` (optional): Minimum amount
- `maxAmount` (optional): Maximum amount
- `startDate` (optional): Start date filter (ISO string)
- `endDate` (optional): End date filter (ISO string)

**Example Request:**
```
GET /api/admin/transactions/export?status=SUCCESS&network=MTN
```

**Response (200 OK):**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="transactions-{timestamp}.csv"`
- CSV file with columns: Transaction ID, Customer Number, Network, Amount, Payment Status, Date & Time

---

---

### 4.3 Get Single Transaction
**GET** `/api/admin/transactions/:id`

Retrieve a single transaction by ID with formatted response.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (UUID): Transaction ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "transactionId": "uuid",
    "customerNumber": "233541840988",
    "network": "MTN",
    "paymentStatus": "SUCCESS",
    "amount": 10.00,
    "dateTime": "2026-01-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Transaction not found

---

## 5. Users Endpoints

### 5.1 Create User
**POST** `/api/admin/users`

Create a new admin user (SUPER_ADMIN only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "address": "123 Main St, Accra",
  "phone_number": "+233541840988"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St, Accra",
    "phone_number": "+233541840988",
    "active_status": true,
    "del_status": false,
    "createdAt": "2026-01-16T10:00:00.000Z",
    "updatedAt": "2026-01-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions (SUPER_ADMIN required)
- `409 Conflict`: Email already exists

---

### 5.2 Get All Users
**GET** `/api/admin/users`

Retrieve all users with pagination, filtering, and role information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `name` (optional): Filter by name (partial match, case-insensitive)
- `role` (optional): Filter by role name
- `status` (optional): Filter by status (`active`, `inactive`)
- `startDate` (optional): Start date filter (ISO string)
- `endDate` (optional): End date filter (ISO string)

**Example Request:**
```
GET /api/admin/users?page=1&limit=10&status=active&role=ADMIN
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "Administrator",
        "status": "active",
        "createdAt": "2026-01-16T10:00:00.000Z",
        "lastLogin": null
      }
    ],
    "total": 25
  },
  "metadata": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions

---

### 5.3 Get Single User
**GET** `/api/admin/users/:id`

Retrieve a single user by ID.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (UUID): User ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St, Accra",
    "phone_number": "+233541840988",
    "active_status": true,
    "del_status": false,
    "createdAt": "2026-01-16T10:00:00.000Z",
    "updatedAt": "2026-01-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: User not found

---

### 5.4 Update User
**PATCH** `/api/admin/users/:id`

Update user details (SUPER_ADMIN only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (UUID): User ID

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "address": "456 New St, Accra",
  "phone_number": "+233541840999"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "address": "456 New St, Accra",
    "phone_number": "+233541840999",
    "active_status": true,
    "del_status": false,
    "createdAt": "2026-01-16T10:00:00.000Z",
    "updatedAt": "2026-01-16T10:10:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: User not found

---

### 5.5 Activate User
**PATCH** `/api/admin/users/:id/activate`

Activate a user account.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (UUID): User ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "active_status": true,
    "createdAt": "2026-01-16T10:00:00.000Z",
    "updatedAt": "2026-01-16T10:10:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: User not found

---

### 5.6 Deactivate User
**PATCH** `/api/admin/users/:id/deactivate`

Deactivate a user account.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (UUID): User ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "active_status": false,
    "createdAt": "2026-01-16T10:00:00.000Z",
    "updatedAt": "2026-01-16T10:10:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: User not found

---

### 5.7 Delete User (Soft Delete/Suspend)
**DELETE** `/api/admin/users/:id`

Soft delete (suspend) a user (SUPER_ADMIN only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (UUID): User ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: User not found

---

## 6. Profile Endpoints

### 6.1 Get Current User Profile
**GET** `/api/admin/profile`

Retrieve the authenticated user profile with roles and permissions.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St, Accra",
    "phone_number": "+233541840988",
    "active_status": true,
    "del_status": false,
    "roles": [
      {
        "id": "uuid",
        "name": "ADMIN",
        "displayName": "Administrator",
        "permissions": [
          {
            "id": "uuid",
            "name": "auditions.read",
            "displayName": "View Auditions"
          }
        ]
      }
    ],
    "permissions": [
      "auditions.read",
      "transactions.read"
    ],
    "createdAt": "2026-01-16T10:00:00.000Z",
    "updatedAt": "2026-01-16T10:00:00.000Z"
  }
}
```

**Note**: The `id` and `password` fields are excluded from the response for security reasons.

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT token

---

### 6.2 Update Profile
**PATCH** `/api/admin/profile`

Update the authenticated user profile (name, email, address).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "address": "456 New St, Accra",
  "phone_number": "+233541840999"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "address": "456 New St, Accra",
    "phone_number": "+233541840999",
    "active_status": true,
    "del_status": false,
    "createdAt": "2026-01-16T10:00:00.000Z",
    "updatedAt": "2026-01-16T10:10:00.000Z"
  }
}
```

---

### 6.3 Change Password
**POST** `/api/admin/profile/change-password`

Change the authenticated user password.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Current password is incorrect

---

## 7. Settings Endpoints

### 7.1 Get All Settings
**GET** `/api/admin/settings`

Retrieve all application settings.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settings retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "key": "SMS_SENDER_ID",
      "value": "SoccerScouting",
      "description": "SMS sender ID for notifications",
      "active_status": true,
      "del_status": false,
      "createdAt": "2026-01-16T10:00:00.000Z",
      "updatedAt": "2026-01-16T10:00:00.000Z"
    }
  ]
}
```

---

### 7.2 Get Specific Setting
**GET** `/api/admin/settings/:key`

Retrieve a specific setting by key (e.g., SMS_SENDER_ID).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `key` (string): Setting key (e.g., `SMS_SENDER_ID`)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Setting retrieved successfully",
  "data": {
    "id": "uuid",
    "key": "SMS_SENDER_ID",
    "value": "Kiddie",
    "description": "SMS sender ID for notifications",
    "active_status": true,
    "del_status": false,
    "createdAt": "2026-01-16T10:00:00.000Z",
    "updatedAt": "2026-01-16T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Setting not found

---

### 7.3 Update Setting
**PATCH** `/api/admin/settings/:key`

Update a specific setting by key.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `key` (string): Setting key (e.g., `SMS_SENDER_ID`, `AUDITION_AMOUNT`)

**Request Body:**
```json
{
  "value": "SoccerScoutingAcademy",
  "description": "Updated SMS sender ID"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "data": {
    "id": "uuid",
    "key": "SMS_SENDER_ID",
    "value": "SoccerScoutingAcademy",
    "description": "Updated SMS sender ID",
    "active_status": true,
    "del_status": false,
    "createdAt": "2026-01-16T10:00:00.000Z",
    "updatedAt": "2026-01-16T10:10:00.000Z"
  }
}
```

**Example - Update Audition Amount:**
```json
{
  "value": "15.0",
  "description": "Updated audition payment amount in GHS"
}
```

**Note**: The `AUDITION_AMOUNT` setting controls the payment amount for auditions. This value is used by:
- USSD configs endpoint (`GET /api/configs`) - returns the amount to USSD on first dial
- USSD submit endpoint - uses this amount for payment initiation
- The amount is stored in GHS (Ghana Cedis) format

---

## 8. Jobs/Queue Management Endpoints

### 8.1 List All Queues
**GET** `/api/admin/jobs/queues`

Get statistics for all queues.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Queues retrieved successfully",
  "data": [
    {
      "name": "callback-processing",
      "waiting": 0,
      "active": 2,
      "completed": 150,
      "failed": 5,
      "delayed": 0
    },
    {
      "name": "sms-retry",
      "waiting": 0,
      "active": 0,
      "completed": 120,
      "failed": 2,
      "delayed": 0
    },
    {
      "name": "transaction-reconciliation",
      "waiting": 0,
      "active": 0,
      "completed": 50,
      "failed": 1,
      "delayed": 0
    }
  ]
}
```

---

### 8.2 Get Queue Details
**GET** `/api/admin/jobs/queues/:queueName`

Get statistics for a specific queue.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `queueName` (string): Queue name (`callback-processing`, `sms-retry`, `transaction-reconciliation`)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Queue details retrieved successfully",
  "data": {
    "name": "callback-processing",
    "waiting": 0,
    "active": 2,
    "completed": 150,
    "failed": 5,
    "delayed": 0
  }
}
```

---

### 8.3 List All Jobs
**GET** `/api/admin/jobs/jobs`

Get all jobs with filtering and pagination.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `MAX_RETRIES_EXCEEDED`)
- `jobType` (optional): Filter by job type (`callback-processing`, `sms-retry`, `transaction-reconciliation`)
- `queueName` (optional): Filter by queue name
- `startDate` (optional): Filter by start date (ISO string)
- `endDate` (optional): Filter by end date (ISO string)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Example Request:**
```
GET /api/admin/jobs/jobs?status=COMPLETED&jobType=callback-processing&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid",
        "jobId": "uuid",
        "queueName": "callback-processing",
        "jobType": "callback-processing",
        "status": "COMPLETED",
        "attempts": 1,
        "maxAttempts": 3,
        "processedAt": "2026-01-16T10:05:00.000Z",
        "createdAt": "2026-01-16T10:00:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

### 8.4 Get Job Details
**GET** `/api/admin/jobs/jobs/:jobId`

Get details for a specific job.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `jobId` (string): Job ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Job details retrieved successfully",
  "data": {
    "id": "uuid",
    "jobId": "uuid",
    "queueName": "callback-processing",
    "jobType": "callback-processing",
    "status": "COMPLETED",
    "jobData": {
      "callbackId": "uuid",
      "transactionId": "uuid",
      "callbackData": {}
    },
    "attempts": 1,
    "maxAttempts": 3,
    "errorMessage": null,
    "errorStack": null,
    "processedAt": "2026-01-16T10:05:00.000Z",
    "createdAt": "2026-01-16T10:00:00.000Z"
  }
}
```

---

### 8.5 List Failed Jobs
**GET** `/api/admin/jobs/failed`

Get all failed jobs (max retries exceeded).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `notificationSent` (optional, boolean): Filter by notification sent status
- `jobType` (optional, string): Filter by job type

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Failed jobs retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "jobLogId": "uuid",
      "jobId": "uuid",
      "queueName": "callback-processing",
      "jobType": "callback-processing",
      "jobData": {},
      "failureReason": "Error message",
      "errorDetails": {},
      "notificationSent": true,
      "notifiedAt": "2026-01-16T10:10:00.000Z",
      "createdAt": "2026-01-16T10:00:00.000Z"
    }
  ]
}
```

---

### 8.6 Get Failed Job Details
**GET** `/api/admin/jobs/failed/:id`

Get details for a specific failed job.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `id` (UUID): Failed job ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Failed job details retrieved successfully",
  "data": {
    "id": "uuid",
    "jobLogId": "uuid",
    "jobId": "uuid",
    "queueName": "callback-processing",
    "jobType": "callback-processing",
    "jobData": {},
    "failureReason": "Error message",
    "errorDetails": {},
    "notificationSent": true,
    "notifiedAt": "2026-01-16T10:10:00.000Z",
    "createdAt": "2026-01-16T10:00:00.000Z"
  }
}
```

---

### 8.7 Retry Failed Job
**POST** `/api/admin/jobs/jobs/:jobId/retry`

Retry a failed job by re-queuing it.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `jobId` (string): Job ID

**Request Body:**
```json
{
  "queueName": "callback-processing"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Job retried successfully"
}
```

---

### 8.8 Remove Job from Queue
**POST** `/api/admin/jobs/jobs/:jobId/remove`

Remove a job from the queue.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `jobId` (string): Job ID

**Request Body:**
```json
{
  "queueName": "callback-processing"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Job removed successfully"
}
```

---

### 8.9 Get Job Statistics
**GET** `/api/admin/jobs/stats`

Get overall job statistics and queue metrics.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalJobs": 200,
    "completedJobs": 150,
    "failedJobs": 5,
    "pendingJobs": 2,
    "processingJobs": 3,
    "queueStats": {
      "callback-processing": {
        "waiting": 0,
        "active": 2,
        "completed": 150,
        "failed": 5
      }
    }
  }
}
```

---

### 8.10 List Pending Transactions
**GET** `/api/admin/jobs/pending-transactions`

Get all pending transactions for reconciliation.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pending transactions retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "auditionId": "uuid",
      "customerNumber": "233541840988",
      "amount": 10.00,
      "status": null,
      "network": "MTN",
      "paymentOption": "MOM",
      "bridgeTransactionId": "AUDf777ccf9mkh672a3LGHM",
      "createdAt": "2026-01-16T10:00:00.000Z"
    }
  ]
}
```

---

### 8.11 Manually Reconcile Transaction
**POST** `/api/admin/jobs/reconcile-transaction/:transactionId`

Manually trigger reconciliation for a pending transaction.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Path Parameters:**
- `transactionId` (UUID): Transaction ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction reconciliation job queued successfully"
}
```

---

### 8.12 Recover Pending Jobs
**POST** `/api/admin/jobs/recover-pending`

Recover pending jobs from PostgreSQL that are not in Redis.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Job recovery completed",
  "data": {
    "recovered": 5,
    "failed": 0
  }
}
```

---

## Common Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "metadata": {
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    },
    "sorting": {
      "field": string,
      "order": "asc" | "desc"
    },
    "filtering": object
  }
}
```

**Frontend Integration Notes:**
- Always check the `success` field before processing `data`
- `data` can be `null` on errors
- `metadata` is optional and only present for paginated endpoints
- For paginated lists, `data` contains an object with `data` array and `total` count

## Error Response Format

Error responses follow the same format with `success: false`:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "data": null
}
```

**Frontend Error Handling:**
- Check HTTP status codes (401, 403, 404, 409, 500)
- Check `success: false` in response body
- Display `message` field to users
- Handle 401 by redirecting to login
- Handle 403 by showing permission denied message
- Handle 404 by showing not found message
- Handle 409 by showing conflict message (e.g., duplicate email)

**Frontend Error Handling:**
- Check HTTP status codes (401, 403, 404, 409, 500)
- Check `success: false` in response body
- Display `message` field to users
- Handle 401 by redirecting to login
- Handle 403 by showing permission denied message
- Handle 404 by showing not found message
- Handle 409 by showing conflict message (e.g., duplicate email)

## HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server error

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All UUIDs are in standard UUID v4 format
3. Pagination defaults: `page=1`, `limit=10`
4. JWT tokens expire after a set time (check environment configuration)
5. Refresh tokens should be used to obtain new access tokens before expiration
6. Password requirements: Minimum 8 characters
7. Email addresses must be valid email format
8. Phone numbers should include country code (e.g., +233541840988)

---

## Summary of Enhancements

### Dashboard
- ✅ Enhanced statistics with percentage changes from yesterday
- ✅ Active users count
- ✅ Today vs yesterday comparisons
- ✅ Weekly auditions data for line graphs (last 7 days)
- ✅ Transaction status counts for pie/donut charts
- ✅ Recent auditions (top 5)

### Auditions
- ✅ Advanced filtering (payment status, SMS status, customer number, date range)
- ✅ Customer number filtering supports both formats (`233...` and `054...`)
- ✅ CSV export functionality (`GET /api/admin/auditions/export`)
- ✅ SMS status included in all responses
- ✅ Sorting support (`sortBy`, `sortOrder`)
- ✅ Formatted response with all required fields (audition ID, customer number, name, age, region, position, payment status, SMS sent status, date/time)

### Transactions
- ✅ Advanced filtering (payment status, customer number, network, amount range, date range)
- ✅ Customer number filtering supports both formats (`233...` and `054...`)
- ✅ CSV export functionality (`GET /api/admin/transactions/export`)
- ✅ Sorting support (`sortBy`, `sortOrder`)
- ✅ Formatted response with all required fields (transaction ID, customer number, network, amount, payment status, date/time)

### Users
- ✅ Pagination support
- ✅ Advanced filtering (name, role, status, date range)
- ✅ Activate endpoint (`PATCH /api/admin/users/:id/activate`)
- ✅ Deactivate endpoint (`PATCH /api/admin/users/:id/deactivate`)
- ✅ Role information in list response
- ✅ Soft delete (suspend) functionality
- ✅ Last login field (currently returns null, ready for future implementation)

---

## Frontend Integration Checklist

### Authentication
- [ ] Implement login flow with email/password
- [ ] Store JWT tokens securely
- [ ] Implement token refresh mechanism
- [ ] Handle token expiration (redirect to login)
- [ ] Implement logout (clear tokens)

### API Client Setup
- [ ] Configure base URL (development/production)
- [ ] Set up axios/fetch with interceptors
- [ ] Add Authorization header to all requests
- [ ] Handle 401 errors (token refresh or redirect)
- [ ] Implement request/response interceptors for error handling

### Dashboard
- [ ] Display total auditions, transactions, revenue
- [ ] Show percentage changes with indicators (up/down)
- [ ] Render weekly auditions line chart
- [ ] Render transaction status pie/donut chart
- [ ] Display recent auditions list
- [ ] Handle loading and error states

### Auditions Management
- [ ] Implement paginated list with filters
- [ ] Support customer number search (both formats: `233...` or `054...`)
- [ ] Implement date range picker
- [ ] Add sorting functionality
- [ ] Implement CSV export
- [ ] Display SMS status
- [ ] Show single audition details
- [ ] Implement SMS resend functionality

### Transactions Management
- [ ] Implement paginated list with filters
- [ ] Support customer number search (both formats: `233...` or `054...`)
- [ ] Implement amount range filter
- [ ] Add network filter
- [ ] Implement date range picker
- [ ] Add sorting functionality
- [ ] Implement CSV export
- [ ] Show single transaction details

### User Management
- [ ] Display paginated user list
- [ ] Implement user filters (name, role, status, date)
- [ ] Create new user form
- [ ] Edit user form
- [ ] Activate/deactivate user actions
- [ ] Soft delete (suspend) user
- [ ] Display user roles and permissions

### Profile Management
- [ ] Display current user profile (note: `id` and `password` are excluded)
- [ ] Edit profile form (name, email, address, phone)
- [ ] Change password form
- [ ] Display user roles and permissions

### Settings
- [ ] Display all settings
- [ ] Edit setting values
- [ ] Update SMS sender ID

### Job/Queue Monitoring (Optional)
- [ ] Display queue statistics
- [ ] List jobs with filters
- [ ] View job details
- [ ] Retry failed jobs
- [ ] Monitor pending transactions

### General UI/UX
- [ ] Implement loading states (spinners/skeletons)
- [ ] Show error messages to users
- [ ] Implement success notifications
- [ ] Add confirmation dialogs for destructive actions
- [ ] Implement form validation
- [ ] Add pagination controls
- [ ] Implement search/filter UI components
- [ ] Add date pickers for date range filters

---

**Last Updated**: January 17, 2026  
**API Version**: 1.0
