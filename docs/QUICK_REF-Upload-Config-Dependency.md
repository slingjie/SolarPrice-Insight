# Quick Reference: SmartUpload ↔ TimeConfig Dependency

## KEY FINDINGS

### 1. ✅ selectedConfigId IS a Hard Blocker
- **Location**: SmartUpload.tsx lines 156 & 292
- **Effect**: Button disabled + function exits early if empty
- **Severity**: CRITICAL - Cannot proceed without valid selection

### 2. ✅ Data Source: RxDB Observable (Live)
- **App.tsx L82-84**: Real-time DB subscription
- **Fallback**: localStorage → DEFAULT_TIME_CONFIGS
- **Guarantee**: Always at least 1 config exists

### 3. ✅ Bypass Strategy Available
- **Option A (Best)**: Inline "Create Default Config" button
- **Option B (Simplest)**: Auto-select first config on load
- **Option C**: Check configs before upload, show error if empty

---

## VALIDATION LOGIC

```typescript
// Current: LOOSE validation
if (!selectedConfigId) return;
const config = timeConfigs.find(c => c.id === selectedConfigId);
if (!config) return;

// Recommended: STRICT validation
const validateSelectedConfig = (id) => {
  if (!id) return {valid: false, error: '请选择配置'};
  const config = timeConfigs.find(c => c.id === id);
  if (!config) return {valid: false, error: '配置不存在'};
  if (!config.time_rules?.length) return {valid: false, error: '配置缺少时段规则'};
  if (!hasAllTimeTypes(config)) return {valid: false, error: '时段规则不完整'};
  return {valid: true};
};
```

---

## RECOMMENDED IMPLEMENTATION

### Step 1: Add Auto-Select (2-3 lines)
```typescript
useEffect(() => {
  if (!selectedConfigId && timeConfigs.length > 0) {
    setSelectedConfigId(timeConfigs[0].id);
  }
}, [timeConfigs]);
```

### Step 2: Add "Create Default" Button (conditional render)
```tsx
{timeConfigs.length === 0 && (
  <button onClick={handleCreateDefault} className="...">
    创建默认配置
  </button>
)}
```

### Step 3: Enhance Validation (add to handleNextBatch)
```typescript
const validation = validateSelectedConfig(selectedConfigId);
if (!validation.valid) {
  setError(validation.error);
  return;
}
```

---

## EDGE CASES TO MONITOR

| Scenario | Current | Risk | Fix |
|----------|---------|------|-----|
| Config deleted after selection | Silent failure | Data not saved | Monitor selectedConfigId stale state |
| Empty timeConfigs at load | Button locked | UX friction | Auto-create or show error early |
| Config missing time_rules | Implicit error | Silent failure | Add explicit validation |
| RxDB subscription lag | Possible stale data | Race condition | Use observable + dependencies |

---

## FILES & LINES

| File | Lines | What |
|------|-------|------|
| SmartUpload.tsx | 33 | selectedConfigId state |
| SmartUpload.tsx | 155-159 | handleNextBatch validation |
| SmartUpload.tsx | 254-267 | Config selection dropdown |
| SmartUpload.tsx | 290-302 | "Next" button with disabled state |
| App.tsx | 27 | timeConfigs state init |
| App.tsx | 82-84 | RxDB subscription |
| App.tsx | 52-75 | Config initialization logic |
| types.ts | 18-26 | TimeConfig interface |

---

## NEXT ACTIONS

### NOW (High Impact, Low Effort)
- [ ] Add auto-select of first config
- [ ] Add "Create Default Config" button when list empty
- [ ] Enhance error messages in handleNextBatch

### SOON (Medium Effort)
- [ ] Add validateSelectedConfig function
- [ ] Monitor for stale selectedConfigId
- [ ] Add useEffect to detect deleted configs

### LATER (Nice to Have)
- [ ] Auto-suggest config based on OCR detection
- [ ] Inline quick-create modal
- [ ] Config validation warnings
