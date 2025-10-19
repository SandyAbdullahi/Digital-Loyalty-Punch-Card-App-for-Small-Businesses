
# Digital Loyalty Punch-Card App

This project is a digital loyalty punch-card application for small businesses. It allows merchants to create and manage their own loyalty programs, and customers to collect stamps and redeem rewards.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js
* npm
* A SQLite database (for development, configured via Prisma)

### Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/SandyAbdullahi/Digital-Loyalty-Punch-Card-App-for-Small-Businesses.git
   cd Digital-Loyalty-Punch-Card-App-for-Small-Businesses
   ```

2. **Backend Setup:**
   - Navigate to the `backend` directory:
     ```sh
     cd backend
     ```
   - Install the dependencies:
     ```sh
     npm install
     ```
   - Create a `.env` file by copying `.env.example`:
     ```sh
     cp .env.example .env
     ```
   - Open the newly created `.env` file and configure the following:
     - `DATABASE_URL`: (e.g., `file:./dev.db` for SQLite)
     - `FRONTEND_URL`: The URL where your frontend application will be running (e.g., `http://localhost:5173`). This is used for QR code generation.
   - Run the database migrations:
     ```sh
     npx prisma migrate dev
     ```

3. **Frontend Setup:**
   - Navigate to the `frontend` directory:
     ```sh
     cd ../frontend
     ```
   - Install the dependencies:
     ```sh
     npm install
     ```

### Running the Application

1. **Run the Backend:**
   - In the `backend` directory, run:
     ```sh
     npm run dev
     ```
   - The backend server will start on `http://localhost:3000`.

2. **Run the Frontend:**
   - In the `frontend` directory, run:
     ```sh
     npm run dev
     ```
   - The frontend development server will start on `http://localhost:5173`.
