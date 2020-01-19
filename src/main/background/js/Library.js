/* eslint-disable */
// noinspection ES6ModulesDependencies,JSUnresolvedFunction,JSUnresolvedVariable,JSUnusedGlobalSymbols
mergeInto(LibraryManager.library, {
  jsChromeTabsDiscard: function (tabs, size, isForce) {
    if (typeof tabs === 'number') {
      // noinspection ES6ConvertVarToLetConst
      var ptr = tabs;
      tabs = [];
      // noinspection ES6ConvertVarToLetConst
      var index = size;
      while (index--) {
        // noinspection JSUnresolvedVariable
        tabs.push(Module.HEAPU32[ptr/HEAPU32.BYTES_PER_ELEMENT + index])
      }
    }
    console.log(tabs);
    Module.jsChromeTabsDiscard(tabs, size, isForce);
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
