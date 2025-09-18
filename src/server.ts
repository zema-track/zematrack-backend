import app from "./app";
import DatabaseConnection from './config/database';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await DatabaseConnection.getInstance().connect();
    
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      "Failed to start the server:",
      error
    );
    process.exit(1);
  }
}

startServer();
