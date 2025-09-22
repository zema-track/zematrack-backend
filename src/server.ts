import app from "./app";
import DatabaseConnection from './config/database';
import { config } from "./config";

const PORT = Number(config.port);

async function startServer() {
  try {
    await DatabaseConnection.getInstance().connect();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
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
