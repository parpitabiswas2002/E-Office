How to Run the App Local Host Successfully
Since the frontend and backend run as two separate services in development, you must start both servers:

Start the backend server (listening on port 8787):

bash
node src/backend/local-server.js
(Note: Using node directly is recommended as script execution might be disabled on your Windows PowerShell by default.)

Start the frontend server in a separate terminal window (listening on port 3000):

bash
npm run dev
