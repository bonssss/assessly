import app from "./app.js";
import { config } from "./config/env.js";
import prisma from "./prisma.js";

const server = app.listen(config.port, () => {
  console.log(`🚀 Exam Management Backend running on http://localhost:${config.port}`);
  console.log(`🌱 Environment: ${config.nodeEnv}`);
});

const handleShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await prisma.$disconnect();
      console.log("Database connection closed.");
    } catch (err) {
      console.error("Error disconnecting database:", err);
    }
    process.exit(0);
  });

  // Force shutdown after 10 seconds if still hanging
  setTimeout(() => {
    console.error("Forcing shutdown after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

export default server;
