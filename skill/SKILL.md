---
name: "browser-mcp"
description: "Browser automation skill with 15 tools. Navigate, click, type, scroll, screenshot, fullpage capture, console logs, drag & drop. Powered by Browser MCP + Chrome extension."
---

# Browser MCP Skill v1.0.0

Browser automation skill — control a real browser through the Browser MCP Chrome extension.

## Prerequisites

1. MCP server is running: `node /path/to/mcp/dist/index.js`
2. Browser MCP Chrome extension is installed and connected (click **Connect**)
3. MCP tool prefix: `mcp__browsermcp__*`

## Tool Overview (15 tools)

| Tool | Description | Required parameters |
|------|-------------|---------------------|
| `navigate` | Navigate to a URL | `url` |
| `go_back` | Browser back | — |
| `go_forward` | Browser forward | — |
| `snapshot` | Get the page's ARIA snapshot | — |
| `click` | Click an element | `element`, `ref` |
| `hover` | Hover over an element | `element`, `ref` |
| `type` | Type text | `element`, `ref`, `text` |
| `select_option` | Select a dropdown option | `element`, `ref`, `values` |
| `drag` | Drag an element | `startElement`, `startRef`, `endElement`, `endRef` |
| `scroll` | Scroll the page | `x`, `y`, `deltaX`, `deltaY` |
| `press_key` | Press a key | `key` |
| `wait` | Wait N seconds | `time` |
| `get_console_logs` | Get console logs | — |
| `screenshot` | Screenshot (within viewport) | — |
| `fullpage_screenshot` | Full-page screenshot (including off-viewport) | — |

## Standard Workflows

### 1. Navigate + snapshot
```
1. mcp__browsermcp__navigate {url}
2. mcp__browsermcp__snapshot  → get ref references
3. Perform subsequent actions based on the refs
```

### 2. Filling out a form
```
1. navigate → snapshot → find the input ref
2. click {ref}  → activate the input field
3. type {ref, text}  → enter content
4. press_key "Enter" or click the submit button
```

### 3. Archiving a page screenshot
```
1. navigate {url}
2. wait {time: 2}  → wait for rendering
3. fullpage_screenshot  → save to /tmp/fullpage_*.jpg
```

### 4. Data scraping
```
1. navigate {url}
2. snapshot  → parse the structure
3. Repeat scroll {deltaY: 500} + snapshot  → load more
4. get_console_logs  → check network/errors
```

### 5. Drag and drop
```
1. snapshot → find startRef and endRef
2. drag {startElement, startRef, endElement, endRef}
```

## Key Parameter Notes

### ref references
- Each `snapshot` returns a `ref` for each element (e.g. `s1e12`)
- refs update as the page changes — re-run snapshot before acting
- click/hover/type/drag all depend on ref

### scroll parameters
- `x`, `y`: scroll start coordinates (viewport coordinates)
- `deltaX`, `deltaY`: scroll distance (positive = right/down)
- Scroll a full page: `{x: 760, y: 400, deltaX: 0, deltaY: 800}`

### fullpage_screenshot
- Screenshot saved to the system temp directory: `/tmp/fullpage_{timestamp}.jpg`
- Uses CDP `Page.captureScreenshot` + `captureBeyondViewport: true`
- Suitable for archiving long pages, articles, and reports

## Common Scenario Examples

```
// WeChat article screenshot
1. navigate "https://mp.weixin.qq.com/s/..."
2. wait 3
3. fullpage_screenshot

// Google search
1. navigate "https://www.google.com"
2. snapshot → find the search box ref
3. type {ref, text: "keyword"}
4. press_key "Enter"
5. snapshot → read the results

// Login form
1. navigate "https://example.com/login"
2. snapshot
3. type {ref: username_ref, text: "user@mail.com"}
4. type {ref: password_ref, text: "password"}
5. click {ref: submit_ref}
6. snapshot → verify login status
```

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Tools unavailable | Extension not connected | Click the extension icon → Connect |
| Invalid ref | Page has changed | Re-run snapshot |
| Blank screenshot | Page not fully loaded | Add wait 2-3s |
| Timeout | Operation exceeded 10min | Split into multiple steps |
| Port in use | 9009 is occupied | Check with `lsof -i:9009` |

## Documentation

- `references/tools-reference.md` - Full tool parameter reference
- `references/workflows.md` - Advanced workflow examples
