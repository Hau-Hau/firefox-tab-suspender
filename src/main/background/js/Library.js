/* eslint-disable object-shorthand,no-console,import/unambiguous */
// noinspection ES6ModulesDependencies,JSUnresolvedFunction,JSUnresolvedVariable,JSUnusedGlobalSymbols
mergeInto(LibraryManager.library, {
  jsChromeTabsDiscard: function (tabId, isForced) {
    Module.jsChromeTabsDiscard(tabId, isForced);
  },
  jsClearInterval: function () {
    Module.jsClearInterval();
  },
  jsConsoleLog: function (number) {
    console.log(number);
  },
  jsExpiredTabsWatcher: function () {
    Module.jsExpiredTabsWatcher();
  },
});
