# ComplaintDesk

ComplaintDesk is a full-stack complaint management application that allows authenticated users to raise, manage, and track complaints, while admins can review and update complaint status with remarks.

## Key Features

- User registration and login with JWT authentication
- Role-based access control: regular users and admins
- Submit complaints with title, description, category, priority, and optional file attachment
- View, filter, search, paginate, edit, and delete user complaints
- Admin dashboard for viewing all complaints, statistics, status updates, and admin remarks
- File upload support for complaint attachments
- REST API backend with Express and MongoDB
- React frontend with React Router, Tailwind CSS, and Vite

## Project Structure

- `client/` — React frontend
  - `src/` — app source code
  - `src/pages/` — page views like `Dashboard`, `Login`, `Register`, `AdminDashboard`, `RaiseComplaint`, and `EditComplaint`
  - `src/components/` — reusable UI components and route guards
  - `src/context/AuthContext.jsx` — authentication state and token handling
  - `src/api/` — Axios configuration and API wrappers

- `server/` — Node.js backend
  - `server.js` — Express app setup and route registration
  - `config/db.js` — MongoDB connection
  - `controllers/` — request handlers for auth and complaints
  - `routes/` — auth and complaint routes
  - `models/` — Mongoose models for `User` and `Complaint`
  - `middleware/` — auth, role checks, and upload handling
  - `uploads/` — stored file attachments

## Backend Details

- Express server with JSON body parsing and CORS
- MongoDB via Mongoose for data persistence
- `User` model with encrypted password and role support (`user`, `admin`)
- `Complaint` model with category, priority, status, attachment, and admin remark fields
- Protected routes for complaint operations
- Admin-only endpoints for global complaint management and status updates

## Frontend Details

- React + Vite application with client-side routing
- Authentication context that stores JWT in `localStorage`
- Protected routes for logged-in users and admin-only pages
- Responsive interface using Tailwind CSS
- Pages include:
  - `Login`
  - `Register`
  - `Dashboard`
  - `MyComplaints`
  - `RaiseComplaint`
  - `ComplaintDetail`
  - `EditComplaint`
  - `AdminDashboard`
  - `AdminComplaintView`

## Setup Instructions

### Prerequisites

- Node.js 18+ (or compatible)
- npm
- MongoDB instance or Atlas connection string

### Backend Setup

1. Open a terminal in `server/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `server/` with:
   ```env
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   JWT_EXPIRES_IN=7d
   CLIENT_ORIGIN=http://localhost:5173
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Open a terminal in `client/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development app:
   ```bash
   npm run dev
   ```
4. Visit the app at the URL shown by Vite, typically `http://localhost:5173`

## Running the Application

- Backend API: `http://localhost:5000`
- Frontend client: `http://localhost:5173`

### Useful Endpoints

- `POST /api/auth/register` — create a new user
- `POST /api/auth/login` — authenticate and receive a JWT
- `GET /api/auth/me` — get the current user profile
- `POST /api/complaints` — submit a new complaint
- `GET /api/complaints/my` — get authenticated user's complaints
- `GET /api/complaints/:id` — get a complaint detail
- `PUT /api/complaints/:id` — update a complaint (only while status is `Open`)
- `DELETE /api/complaints/:id` — delete a complaint (only while status is `Open`)
- `GET /api/complaints/admin/all` — admin: list all complaints
- `PUT /api/complaints/admin/:id/status` — admin: update complaint status
- `PUT /api/complaints/admin/:id/remark` — admin: add remark to complaint

## Notes

- Admin users can manage all complaints and add internal remarks.
- Regular users can only edit or delete complaints while they are still `Open`.
- Attachments are served from `/uploads`.

## Improvements

Potential enhancements:
- add role management UI for admin creation
- add email notifications for status changes
- add more detailed analytics and charts in admin dashboard
- improve validation and error handling on the frontend

---

Thanks for using ComplaintDesk! If you want, I can also add a shorter abstract version or generate a `README` with badge links and deployment notes.