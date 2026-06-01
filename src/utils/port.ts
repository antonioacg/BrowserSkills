import net from "node:net";
import path from "node:path";
import { execFileSync } from "node:child_process";

export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => {
      server.close(() => resolve(false));
    });
    server.listen(port);
  });
}

export interface PortOwner {
  pid: number;
  command: string;
}

export function getPortOwner(port: number): PortOwner | null {
  try {
    const pidsRaw = execFileSync("lsof", ["-iTCP:" + port, "-sTCP:LISTEN", "-t"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!pidsRaw) return null;
    const pid = Number(pidsRaw.split("\n")[0]);
    if (!Number.isFinite(pid)) return null;
    const command = execFileSync("ps", ["-p", String(pid), "-o", "command="], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return { pid, command };
  } catch {
    return null;
  }
}

export function isOwnedByThisServer(command: string, ownScriptPath: string): boolean {
  if (!command) return false;
  const absoluteOwn = ownScriptPath ? path.resolve(ownScriptPath) : "";
  if (absoluteOwn && command.includes(absoluteOwn)) return true;
  return command.includes("BrowserSkills/dist/index.js") ||
    command.includes("BrowserSkills\\dist\\index.js");
}

export function killPid(pid: number, signal: NodeJS.Signals = "SIGTERM"): void {
  try {
    process.kill(pid, signal);
  } catch {
    // already gone — fine
  }
}
