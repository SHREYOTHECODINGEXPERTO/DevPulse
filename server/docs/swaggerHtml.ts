import { config } from '../config/index.ts';

export function renderSwaggerHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevPulse REST API Docs | Swagger UI</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>">
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #090d16;
      --bg-surface: #0f172a;
      --bg-card: #1e293b;
      --border-color: #334155;
      --accent-primary: #6366f1;
      --accent-hover: #4f46e5;
      --accent-cyan: #06b6d4;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
    }

    body {
      margin: 0;
      padding: 0;
      background: var(--bg-primary);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .top-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      border-bottom: 1px solid rgba(99, 102, 241, 0.2);
      padding: 18px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
    }

    .top-header .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .top-header .brand-logo {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
    }

    .top-header .brand-logo svg {
      width: 20px;
      height: 20px;
      color: #fff;
    }

    .top-header .brand-title {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .top-header .brand-badge {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(99, 102, 241, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .top-header .actions {
      display: flex;
      gap: 12px;
    }

    .btn-action {
      background: rgba(30, 41, 59, 0.8);
      color: #e2e8f0;
      border: 1px solid rgba(148, 163, 184, 0.2);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-action:hover {
      background: rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.5);
      color: #fff;
      transform: translateY(-1px);
    }

    .btn-primary-action {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #fff;
    }

    .btn-primary-action:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
    }

    /* Swagger UI Custom Modern Dark Theme Overrides */
    .swagger-ui {
      color: #e2e8f0;
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    .swagger-ui .info {
      margin: 20px 0 30px;
    }

    .swagger-ui .info .title {
      color: #fff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700;
      font-size: 32px;
    }

    .swagger-ui .info .description {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.6;
    }

    .swagger-ui .scheme-container {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px 24px;
      box-shadow: none;
      margin-bottom: 24px;
    }

    .swagger-ui .opblock-tag {
      color: #fff;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 20px;
      border-bottom: 1px solid var(--border-color);
      padding: 14px 0 10px;
    }

    .swagger-ui .opblock {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
      margin-bottom: 16px;
      transition: border-color 0.2s ease;
    }

    .swagger-ui .opblock:hover {
      border-color: rgba(99, 102, 241, 0.5);
    }

    .swagger-ui .opblock .opblock-summary-path {
      color: #f1f5f9;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 600;
    }

    .swagger-ui .opblock .opblock-summary-description {
      color: #94a3b8;
      font-size: 13px;
    }

    .swagger-ui .opblock.opblock-get { border-color: rgba(59, 130, 246, 0.3); background: rgba(30, 58, 138, 0.08); }
    .swagger-ui .opblock.opblock-post { border-color: rgba(16, 185, 129, 0.3); background: rgba(6, 78, 59, 0.08); }
    .swagger-ui .opblock.opblock-put { border-color: rgba(245, 158, 11, 0.3); background: rgba(120, 53, 15, 0.08); }
    .swagger-ui .opblock.opblock-patch { border-color: rgba(139, 92, 246, 0.3); background: rgba(88, 28, 135, 0.08); }
    .swagger-ui .opblock.opblock-delete { border-color: rgba(239, 68, 68, 0.3); background: rgba(127, 29, 29, 0.08); }

    .swagger-ui table thead tr td, .swagger-ui table thead tr th {
      color: #cbd5e1;
      border-bottom: 1px solid var(--border-color);
    }

    .swagger-ui .parameters-col_name {
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
    }

    .swagger-ui .parameter__type {
      color: #818cf8;
      font-family: 'JetBrains Mono', monospace;
    }

    .swagger-ui input[type=text], .swagger-ui textarea, .swagger-ui select {
      background: #1e293b;
      color: #f8fafc;
      border: 1px solid #475569;
      border-radius: 6px;
      padding: 8px 12px;
      font-family: 'JetBrains Mono', monospace;
    }

    .swagger-ui .btn.execute {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border-color: #6366f1;
      color: #fff;
      font-weight: 600;
      border-radius: 6px;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
    }

    .swagger-ui .btn.try-out__btn {
      background: #334155;
      color: #f1f5f9;
      border-color: #475569;
      border-radius: 6px;
    }

    .swagger-ui .responses-inner {
      background: #0b1120;
      padding: 16px;
      border-radius: 8px;
    }

    .swagger-ui .model-box {
      background: #0f172a;
    }

    .swagger-ui section.models {
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-surface);
    }
  </style>
</head>
<body>
  <header class="top-header">
    <div class="brand">
      <div class="brand-logo">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      </div>
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="brand-title">DevPulse API</span>
          <span class="brand-badge">v1.0.0</span>
        </div>
      </div>
    </div>
    <div class="actions">
      <a href="${config.apiPrefix}/openapi.json" target="_blank" class="btn-action">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
        Raw OpenAPI Spec
      </a>
      <a href="/api/health" target="_blank" class="btn-action btn-primary-action">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Health Check
      </a>
    </div>
  </header>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '${config.apiPrefix}/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: "list",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        syntaxHighlight: {
          activate: true,
          theme: 'agate'
        }
      });
    };
  </script>
</body>
</html>
`;
}
