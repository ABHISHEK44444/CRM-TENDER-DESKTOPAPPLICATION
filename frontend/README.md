# M Intergraph CRM & Tender Management

This project consists of a React frontend and an Express.js backend.

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- MongoDB (a local instance or a cloud service like MongoDB Atlas)

## Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Create a `.env` file in the `backend` directory by copying the example:
      ```bash
      cp .env.example .env
      ```
    - Open the `.env` file and replace `YOUR_MONGODB_CONNECTION_STRING` with your actual MongoDB connection string. For a local setup, this is typically `mongodb://localhost:27017/crm_db`.

4.  **Seed the database (optional but recommended for first-time setup):**
    - This will populate your database with the initial mock data.
    ```bash
    npm run seed
    ```

5.  **Run the backend server:**
    - The server will run in development mode with `nodemon`, automatically restarting on file changes.
    ```bash
    npm run dev
    ```
    - The backend will be available at `http://localhost:5001`.

## Frontend Setup

1.  **Navigate to the root directory** (if you were in the `backend` directory, go back up `cd ..`).

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm start
    ```
    - The frontend application will open in your browser at `http://localhost:5173` (or another port if 5173 is in use).

The frontend is configured to communicate with the backend server running on port 5001. Ensure the backend is running before you start the frontend.
