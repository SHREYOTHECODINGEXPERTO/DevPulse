import { app } from './app.ts';
import { config } from './config/index.ts';

const server = app.listen(config.port, () => {
  console.log('====================================================');
  console.log(`🚀 ${config.appName} is running!`);
  console.log(`📡 Environment:   ${config.nodeEnv}`);
  console.log(`🌐 Server URL:     http://localhost:${config.port}`);
  console.log(`📚 Swagger Docs:   http://localhost:${config.port}${config.apiPrefix}/docs`);
  console.log(`📄 OpenAPI Spec:   http://localhost:${config.port}${config.apiPrefix}/openapi.json`);
  console.log(`💚 Health Check:   http://localhost:${config.port}${config.apiPrefix}/health`);
  console.log(`📦 Data Storage:   ${config.dbFilePath}`);
  console.log('====================================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
