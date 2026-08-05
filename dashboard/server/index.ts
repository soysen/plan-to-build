import express, { Request, Response } from 'express';
import cors from 'cors';
import { WorkflowScanner } from './scanner.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const scanner = new WorkflowScanner('/Users/i_nelsonchung/projects');

// Store active SSE connections
const sseClients: Set<Response> = new Set();

// Initial scanner load
scanner.init().then((initialWorkflows) => {
  console.log(`[Server] Loaded ${initialWorkflows.length} workflows from ~/projects`);
});

// Subscribe to scanner file changes
scanner.subscribe((updatedWorkflows) => {
  console.log(`[Server] Broadcasting update to ${sseClients.size} SSE clients`);
  const payload = `data: ${JSON.stringify(updatedWorkflows)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
});

// REST Endpoint: Get current snapshot
app.get('/api/workflows', (req: Request, res: Response) => {
  const workflows = scanner.getAllWorkflows();
  res.json({
    success: true,
    data: workflows
  });
});

// SSE Endpoint: Server-Sent Events live stream
app.get('/api/workflows/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial data immediately upon connection
  const initialData = scanner.getAllWorkflows();
  res.write(`data: ${JSON.stringify(initialData)}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Global Harness Dashboard Server running on http://localhost:${PORT}`);
  console.log(`📡 SSE Stream available at http://localhost:${PORT}/api/workflows/stream`);
});
