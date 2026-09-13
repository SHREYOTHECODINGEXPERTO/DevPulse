import { app } from './app.ts';
import { config } from './config/index.ts';
import { initializeDatabase } from './data/database.init.ts';
import { disconnectDatabase, maskMongoUri } from './config/database.ts';

async function startServer() {
  // Initialize persistent database connection & seed data
  await initializeDatabase();

  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`🚀 ${config.appName} is running!`);
    console.log(`📡 Environment:   ${config.nodeEnv}`);
    console.log(`🌐 Server URL:     http://localhost:${config.port}`);
    console.log(`📚 Swagger Docs:   http://localhost:${config.port}${config.apiPrefix}/docs`);
    console.log(`📄 OpenAPI Spec:   http://localhost:${config.port}${config.apiPrefix}/openapi.json`);
    console.log(`💚 Health Check:   http://localhost:${config.port}${config.apiPrefix}/health`);
    console.log(`🗄️ Database URI:   ${maskMongoUri(config.mongoUri)}`);
    console.log(`📦 Data Storage:   ${config.dbFilePath}`);
    console.log('====================================================');
  });

  // Graceful shutdown
  const handleShutdown = async (signal: string) => {
    console.log(`\n${signal} signal received: shutting down server and closing database connections...`);
    await disconnectDatabase();
    server.close(() => {
      console.log('HTTP server closed cleanly');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  return server;
}

const serverPromise = startServer();
export default serverPromise;
