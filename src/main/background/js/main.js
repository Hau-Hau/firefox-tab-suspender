browser.storage.local.get({
  automaticSuspend: true,
  timeToDiscard: 60,
  neverSuspendPinned: true,
  neverSuspendPlayingAudio: true,
  neverSuspendUnsavedFormInput: true,
  loadingTabsImmediately: false,
  discardedPageDarkTheme: false,
  suspendOptionInContextMenu: true,
  suspendOthersOptionInContextMenu: true,
  suspendLeftAndRightOptionsInContextMenu: true,
  suspendAllOptionInContextMenu: true,
}).then(function(value) {
  //= ../.tmp/service.js
  Module.onRuntimeInitialized = _ => {
    Module['extension_settings'] = value;
    //= ./library_functions.js
    //= ./contextMenu/setup.js

    if (!value.automaticSuspend) {
      return;
    }

    const heapMap = {
      HEAP8: Int8Array,
      HEAPU8: Uint8Array,
      HEAP16: Int16Array,
      HEAPU16: Uint16Array,
      HEAP32: Int32Array,
      HEAPU32: Uint32Array,
      HEAPF32: Float32Array,
      HEAPF64: Float64Array,
    };

    const wasmInitialization = Module.cwrap('cWasmInitialization', null, [
      'number',
      'number',
    ]);

    const tabsInitialization = Module.cwrap('cTabsInitialization', null, [
      'number',
      'number',
      'number',
    ]);

    const pushEvent1D = Module.cwrap('cPushEvent1D', null, [
      'number',
      'number',
      'number',
    ]);

    const pushEvent2D = Module.cwrap('cPushEvent2D', null, [
      'number',
      'number',
      'number',
      'number',
    ]);

    function setHeap(typedArray, ptr, heap) {
      switch (heap) {
        case 'HEAP8':
        case 'HEAPU8':
          Module[heap].set(typedArray, ptr);
          break;
        case 'HEAP16':
        case 'HEAPU16':
          Module[heap].set(typedArray, ptr >> 1);
          break;
        case 'HEAP32':
        case 'HEAPU32':
        case 'HEAPF32':
          Module[heap].set(typedArray, ptr >> 2);
          break;
        case 'HEAPF64':
          Module[heap].set(typedArray, ptr >> 3);
          break;
      }
    }

    function pass2DArrayToWasm(eventId, fn, arrays, heap) {
      const arrayOfPointers = [];
      let segmentSize = undefined;

      let arraysIndex = arrays.length;
      while (arraysIndex--) {
        if (segmentSize === undefined) {
          segmentSize = arrays[arraysIndex].length;
        }
        const typedArray = new heapMap[heap](arrays[arraysIndex]);
        arrayOfPointers.push(
          Module._malloc(typedArray.length * typedArray.BYTES_PER_ELEMENT),
        );
        setHeap(
          typedArray,
          arrayOfPointers[arrayOfPointers.length - 1],
          heap,
        );
      }
      const typedArrayOfPointers = new Int32Array(arrayOfPointers);
      var ptr = Module._malloc(
        typedArrayOfPointers.length * typedArrayOfPointers.BYTES_PER_ELEMENT,
      );
      Module.HEAP32.set(typedArrayOfPointers, ptr >> 2);
      if (eventId == null) {
        fn(ptr, arrayOfPointers.length, segmentSize);
      } else {
        fn(eventId, ptr, arrayOfPointers.length, segmentSize);
      }
      let arrayOfPointersIndex = arrayOfPointers.length;
      while (arrayOfPointersIndex--) {
        Module._free(arrayOfPointers[arrayOfPointersIndex]);
      }
      Module._free(ptr);
    }

    function passArrayToWasm(eventId, fn, array, heap) {
      const typedArray = new heapMap[heap](array);
      const ptr = Module._malloc(
        typedArray.length * typedArray.BYTES_PER_ELEMENT,
      );
      setHeap(typedArray, ptr, heap);
      fn(eventId, ptr, array.length);
      if (eventId == null) {
        fn(ptr, array.length);
      } else {
        fn(eventId, ptr, array.length);
      }
      Module._free(ptr);
    }

    passArrayToWasm(
      null,
      wasmInitialization,
      [
        value.timeToDiscard,
        value.neverSuspendPinned & 1,
        value.neverSuspendPlayingAudio & 1,
        value.neverSuspendUnsavedFormInput & 1,
        value.desaturateFavicon & 1,
      ],
      'HEAP32',
    );

    chrome.tabs.query({}, function(tabs) {
      const data = [];
      for (const tab of tabs) {
        if (tab.url.indexOf('about:') === -1) {
          data.push([
            tab.windowId,
            tab.id,
            tab.active & 1,
            (tab.title.indexOf('- discarded') > 1) & 1,
            tab.pinned & 1,
            tab.audible & 1,
          ]);
        }
        pass2DArrayToWasm(null, tabsInitialization, data, 'HEAP32');
      }
    });

    chrome.windows.onCreated.addListener(function(window) {
      passArrayToWasm(1, pushEvent1D, [window.id], 'HEAP32');
    });

    chrome.windows.onRemoved.addListener(function(windowId) {
      passArrayToWasm(2, pushEvent1D, [windowId], 'HEAP32');
    });

    chrome.tabs.onCreated.addListener(function(tab) {
      // Bugfix - Newly created tabs sometimes return active=false when they are active
      setTimeout(function() {
        chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
          let index = tabs.length;
          while (index--) {
            if (tabs[index].id === tab.id) {
              passArrayToWasm(
                3,
                pushEvent1D,
                [
                  tabs[index].windowId,
                  tabs[index].id,
                  tabs[index].active & 1,
                  (tabs[index].title.indexOf('- discarded') > 1) & 1,
                  tabs[index].pinned & 1,
                  tabs[index].audible & 1,
                ],
                'HEAP32',
              );
              return;
            }
          }
        });
      }, 250);
    });

    browser.tabs.onActivated.addListener(function(activeInfo) {
      if (!value.loadingTabsImmediately) {
        return;
      }
      chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.title.indexOf('- discarded') <= 1) {
          return;
        }
        const urlObj = new URL(tab.url);
        const url = urlObj.searchParams.get('u');
        browser.tabs.update(tab.id, {
          url: url,
        });
      });
    });

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      if (tab.url.indexOf('about:') >= 0) {
        return;
      }
      passArrayToWasm(
        4,
        pushEvent1D,
        [
          tab.windowId,
          tab.id,
          changeInfo.pinned === undefined || changeInfo.pinned === null
            ? 2
            : changeInfo.pinned & 1,
          changeInfo.audible === undefined || changeInfo.audible === null
            ? 2
            : changeInfo.audible & 1,
        ],
        'HEAP32',
      );
    });

    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
      passArrayToWasm(
        5,
        pushEvent1D,
        [removeInfo.windowId, tabId],
        'HEAP32',
      );
    });

    let lastOnActivatedCall = undefined;
    chrome.tabs.onActivated.addListener(function(activeInfo) {
      if (lastOnActivatedCall !== undefined && new Date().getTime() -
        lastOnActivatedCall <= 400) {
        return;
      }
      chrome.tabs.query({}, function(tabs) {
        const tabsToPass = [];
        for (const tab of tabs) {
          if (tab.url.indexOf('about:') === -1) {
            tabsToPass.push([
              tab.windowId,
              tab.id,
              tab.active & 1,
              (tab.title.indexOf('- discarded') > 1) & 1,
              tab.pinned & 1,
              tab.audible & 1,
              Math.floor(tab.lastAccessed / 1000),
            ]);
            pass2DArrayToWasm(0, pushEvent2D, tabsToPass, 'HEAPF64');
            lastOnActivatedCall = new Date().getTime();
          }
        }
      });
    });
  };
});
