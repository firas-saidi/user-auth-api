
# Express API with User Management

This project is a Node.js API built with Express, Mongoose, and CryptoJS. It provides user authentication and management features, including role-based access control. The API uses JWT for secure authentication and protects sensitive user data with password encryption.

## Features

1. **Authentication**:
   - Register new users with encrypted passwords.
   - Login to retrieve a JWT token.
2. **User Management**:
   - Fetch all users (Admins only).
   - Fetch user details by ID (Admins only).
   - Update user details (Admins only for roles).
3. **Static Routes**:
   - Custom static endpoints for predefined responses.
4. **Security**:
   - Password encryption using CryptoJS.
   - Role-based access with JWT.
5. **Database**:
   - MongoDB integration using Mongoose.

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and configure:
   ```env
   PORT=5000
   MONGO_URI=<your-mongo-db-connection-string>
   JWT_SECRET=<your-secret-key>
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

---

## API Endpoints
## Test Endpoint: /hello => To verify that the server is running correctly, we have created a simple test route

### Authentication

#### Register a New User
**Endpoint**: `POST /auth/register`  
**Description**: Registers a new user with a unique username and email.  
**Request Body**:
```json
{
  "userName": "johnDoe",
  "email": "john.doe@example.com",
  "password": "yourPassword",
  "role": "user"
}
```
**Response**:
```json
{
  "userName": "johnDoe",
  "email": "john.doe@example.com",
  "role": "user"
}
```

#### Login
**Endpoint**: `POST /auth/login`  
**Description**: Authenticates a user and returns a JWT token.  
**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "yourPassword"
}
```
**Response**:
```json
{
  "token": "your-jwt-token",
  "user": {
    "userName": "johnDoe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

---

### User Management

#### Fetch All Users (Admin Only)
**Endpoint**: `GET /users`  
**Description**: Returns a list of all users (excluding passwords).  
**Authorization**: Requires an admin token in the `Authorization` header.  
**Response**:
```json
[
  {
    "_id": "userId",
    "userName": "johnDoe",
    "email": "john.doe@example.com",
    "role": "user"
  }
]
```

#### Fetch User Details by ID (Admin Only)
**Endpoint**: `GET /users/:id`  
**Description**: Fetches a user's details by ID (excluding password).  
**Authorization**: Requires an admin token in the `Authorization` header.  
**Response**:
```json
{
  "userName": "johnDoe",
  "email": "john.doe@example.com",
  "role": "user"
}
```

#### Update User Details
**Endpoint**: `PUT /users/:id`  
**Description**: Updates a user's details (email, username, password, and role). Only admins can update roles.  
**Request Body**:
```json
{
  "email": "newemail@example.com",
  "userName": "newUsername",
  "password": "newPassword",
  "role": "admin"
}
```
**Response**:
```json
{
  "message": "User updated successfully",
  "user": {
    "userName": "newUsername",
    "email": "newemail@example.com",
    "role": "admin"
  }
}
```
