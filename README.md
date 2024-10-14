# E-Commerce Application

This is a full-stack e-commerce application with a React frontend and a Node.js backend.

## Environment Setup

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- SQLite3

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   JWT_SECRET=your_jwt_secret_here
   ```
   Replace `your_jwt_secret_here` with a secure random string.

4. Start the backend server:
   ```
   npm start
   ```

The backend server should now be running on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

The frontend application should now be running on `http://localhost:5173`.

## Adding Admin User Role

To add an admin user role, you can use the SQLite extension in Visual Studio Code to modify the `shop.db` database. Follow these steps:

1. Install the SQLite extension in VS Code:
   - Open VS Code
   - Go to the Extensions view (Ctrl+Shift+X)
   - Search for "SQLite"
   - Install the "SQLite" extension by alexcvzz

2. Open the shop.db file:
   - In VS Code, go to File > Open Folder and select your project folder
   - In the Explorer sidebar, find the `backend/shop.db` file
   - Right-click on the file and select "Open Database"

3. View and modify the database:
   - In the VS Code Explorer, you should now see a "SQLITE EXPLORER" section
   - Expand the "shop.db" dropdown
   - Expand the "users" table

4. Run an SQL query to update the user role:
   - Right-click on the "users" table and select "Show Table"
   - In the new editor that opens, you'll see the current data in the users table
   - To change a user's role to admin, click on "Run Query" in the top right of this editor
   - In the input box that appears, enter the following SQL command:
     ```sql
     UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
     ```
     Replace 'admin@example.com' with the email of the user you want to make an admin.
   - Press Enter to run the query

5. Verify the change:
   - Run another query to check if the change was applied:
     ```sql
     SELECT * FROM users WHERE email = 'admin@example.com';
     ```
   - You should see the updated role for the user in the results

Remember to restart your backend server after making these changes for them to take effect.

Note: If you don't see the "SQLITE EXPLORER"

## Additional Notes

- The backend API is configured to run on `http://localhost:5000`. If you change this, make sure to update the frontend API calls accordingly.
- Make sure both frontend and backend are running simultaneously for the application to work properly.
- For security reasons, never commit your `.env` file or expose your JWT secret.
