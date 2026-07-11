# Browser MCP Tools Reference

## Navigation
| Tool | Parameters | Description |
|------|------------|-------------|
| `navigate` | `url: string` | Go to the specified URL |
| `go_back` | — | Browser back |
| `go_forward` | — | Browser forward |
| `wait` | `time: number (0-60s)` | Wait the specified number of seconds |

## Page Perception
| Tool | Parameters | Description |
|------|------------|-------------|
| `snapshot` | — | Get an ARIA structure snapshot; returns all interactive elements and their refs |
| `screenshot` | `selector?: string` | Capture a screenshot of the current viewport |
| `fullpage_screenshot` | — | Capture a full-page screenshot, saved to /tmp/ |
| `get_console_logs` | — | Get the browser console logs |

## Interaction
| Tool | Parameters | Description |
|------|------------|-------------|
| `click` | `element: string, ref: string` | Click an element |
| `hover` | `element: string, ref: string` | Hover over an element |
| `type` | `element, ref, text, submit?: bool` | Type text |
| `select_option` | `element, ref, values: string[]` | Select from a dropdown |
| `press_key` | `key: string` | Keyboard key (Enter/Tab/Escape, etc.) |
| `drag` | `startElement, startRef, endElement, endRef` | Drag |
| `scroll` | `x, y, deltaX, deltaY` | Scroll the page |

## Important Notes
- `ref` comes from the ARIA tree returned by `snapshot`, in a format like `s1e42`
- `element` is a human-readable description, used for logging
- `fullpage_screenshot` output: `/var/folders/.../T/fullpage_<timestamp>.jpg`
- WebSocket port: `9009`
- The MCP server must be started and the Chrome extension connected first
