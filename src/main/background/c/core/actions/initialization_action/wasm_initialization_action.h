#ifndef FTS_WASM_INITIALIZATION_ACTION_H
#define FTS_WASM_INITIALIZATION_ACTION_H

typedef struct {
  void (*const run)(const uint32_t* buffer, uint32_t bufferSize, void (*jsExpiredTabsWatcher)(void),
                    void (*jsClearInterval)(void), void (*jsChromeTabsDiscard)(uint32_t),
                    void (*jsConsoleLog)(uint32_t));
} wasm_initialization_action_namespace;

extern wasm_initialization_action_namespace const WasmInitializationAction;

#endif
