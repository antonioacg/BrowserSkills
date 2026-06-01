import { WebSocketServer } from "ws";
import http from "http";
import { mcpConfig } from "@/config/mcp.config";
import {
  getPortOwner,
  isOwnedByThisServer,
  isPortInUse,
  killPid,
} from "@/utils/port";

export interface WSServerWithHttp {
  wss: WebSocketServer;
  httpServer: http.Server;
  port: number;
}

async function waitForPortFree(port: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await isPortInUse(port))) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return !(await isPortInUse(port));
}

async function reclaimPort(port: number): Promise<void> {
  if (!(await isPortInUse(port))) return;

  const owner = getPortOwner(port);
  if (!owner) {
    process.stderr.write(
      `browsermcp: port ${port} is in use but the owner could not be identified. Exiting.\n`,
    );
    process.exit(1);
  }

  if (!isOwnedByThisServer(owner.command, process.argv[1] ?? "")) {
    process.stderr.write(
      `browsermcp: port ${port} is held by PID ${owner.pid} (${owner.command}), ` +
        `which is not a BrowserSkills instance. Refusing to kill it. Free the port and retry.\n`,
    );
    process.exit(1);
  }

  process.stderr.write(
    `browsermcp: reclaiming port ${port} from stale BrowserSkills PID ${owner.pid}\n`,
  );
  killPid(owner.pid, "SIGTERM");
  if (await waitForPortFree(port, 1500)) return;

  killPid(owner.pid, "SIGKILL");
  if (await waitForPortFree(port, 1500)) return;

  process.stderr.write(
    `browsermcp: failed to free port ${port} after SIGKILL of PID ${owner.pid}. Exiting.\n`,
  );
  process.exit(1);
}

export async function createWebSocketServer(
  port: number = mcpConfig.ws.port,
): Promise<WSServerWithHttp> {
  await reclaimPort(port);

  const httpServer = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Browser MCP Server");
  });

  const wss = new WebSocketServer({
    server: httpServer,
    path: mcpConfig.ws.path,
  });

  return new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, () => {
      httpServer.removeListener("error", reject);
      console.log(
        `WebSocket server listening on ws://localhost:${port}${mcpConfig.ws.path}`,
      );
      resolve({ wss, httpServer, port });
    });
  });
}
