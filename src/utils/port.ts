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
  ppid: number;
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
    const psOutput = execFileSync("ps", ["-p", String(pid), "-o", "ppid=,command="], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    const match = psOutput.match(/^\s*(\d+)\s+(.*)$/);
    if (!match) return null;
    const ppid = Number(match[1]);
    const command = match[2].trim();
    return { pid, command, ppid };
  } catch {
    return null;
  }
}

export function isProcessAlive(pid: number): boolean {
  if (!Number.isFinite(pid) || pid <= 1) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
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
