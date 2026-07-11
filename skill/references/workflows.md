# Browser MCP Common Workflows

## 1. Navigate and archive a screenshot
```
navigate {url} → wait {2} → fullpage_screenshot
```
Screenshot saved to `/var/folders/.../T/fullpage_<timestamp>.jpg`

## 2. Search and click a result
```
navigate {search URL} → snapshot → click {result ref}
```

## 3. Fill out and submit a form
```
navigate {url} → snapshot → click {input ref} → type {ref, text} → press_key "Enter"
```

## 4. Scrape an infinite-scroll page
```
navigate {url} → snapshot → scroll {x:0,y:0,deltaX:0,deltaY:800} → snapshot → repeat
```

## 5. Dropdown selection
```
snapshot → select_option {ref, values:["option"]}
```

## 6. Drag and drop
```
snapshot → drag {startRef, endRef}
```

## 7. Debug page errors
```
navigate {url} → get_console_logs
```

## 8. Multi-tab operations
Each navigate navigates within the current tab. To switch tabs, reconnect in the Chrome extension.

## ref Usage Rules
1. refs refresh after each `snapshot`
2. Always snapshot first to get the latest ref before acting
3. ref format: `s1e{number}`, e.g. `s1e42`
