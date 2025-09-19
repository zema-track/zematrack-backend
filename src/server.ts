import app from "./app";
import DatabaseConnection from './config/database';
import { config } from "./config";

const PORT = config.port;

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
