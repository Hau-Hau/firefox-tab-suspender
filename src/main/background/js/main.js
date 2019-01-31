browser.storage.local.get({
	timeToDiscard: 60,
	neverSuspendPinned: true,
	neverSuspendPlayingAudio: true,
	neverSuspendUnsavedFormInput: true,
	desaturateFavicon: true
}).then(function(value) {
	Module.onRuntimeInitialized = _ => {
		const heapMap = {
			'HEAP8': Int8Array,
			'HEAPU8': Uint8Array,
			'HEAP16': Int16Array,
			'HEAPU16': Uint16Array,
			'HEAP32': Int32Array,
			'HEAPU32': Uint32Array,
			'HEAPF32': Float32Array,
			'HEAPF64': Float64Array
		}

		const initialize = Module.cwrap('initialize', null, ['number', 'number']);
		const tabsInitialization = Module.cwrap('tabsInitialization', null, ['number', 'number', 'number']);
		const tabsOnActivatedHandle = Module.cwrap('tabsOnActivatedHandle', null, ['number', 'number', 'number']);
		const windowsOnCreatedHandle = Module.cwrap('windowsOnCreatedHandle', null, ['number']);
		const windowsOnRemovedHandle = Module.cwrap('windowsOnRemovedHandle', null, ['number']);
		const tabsOnCreatedHandle = Module.cwrap('tabsOnCreatedHandle', null, ['number', 'number']);
		const tabsOnUpdatedHandle = Module.cwrap('tabsOnUpdatedHandle', null, ['number', 'number']);
		const tabsOnRemovedHandle = Module.cwrap('tabsOnRemovedHandle', null, ['number', 'number']);

		function setHeap(typedArray, ptr, heap) { 
			switch (heap) {
				case 'HEAP8': case 'HEAPU8':
					Module[heap].set(typedArray, ptr);
					break;
				case 'HEAP16': case 'HEAPU16':
					Module[heap].set(typedArray, ptr >> 1);
					break;
				case 'HEAP32': case 'HEAPU32': case 'HEAPF32':
					Module[heap].set(typedArray, ptr >> 2);
					break;
				case 'HEAPF64':
					Module[heap].set(typedArray, ptr >> 3);
					break;
			}
		}

		function pass2DArrayToWasm(fn, arrays, heap) {
			const arrayOfPointers = [];
			let segmentSize = undefined;

			let arraysIndex = arrays.length;
			while(arraysIndex--) {
				if (segmentSize === undefined) {
					segmentSize = arrays[arraysIndex].length;
				}
				const typedArray = new heapMap[heap](arrays[arraysIndex]); 
				arrayOfPointers.push(Module._malloc(typedArray.length * typedArray.BYTES_PER_ELEMENT));
				setHeap(typedArray, arrayOfPointers[arrayOfPointers.length - 1], heap);
			}
			const typedArrayOfPointers = new Int32Array(arrayOfPointers);
			var ptr = Module._malloc(typedArrayOfPointers.length * typedArrayOfPointers.BYTES_PER_ELEMENT);
			Module.HEAP32.set(typedArrayOfPointers, ptr >> 2);
			fn(ptr, arrayOfPointers.length, segmentSize);

			let arrayOfPointersIndex = arrayOfPointers.length;
			while(arrayOfPointersIndex--) {
				Module._free(arrayOfPointers[arrayOfPointersIndex]);				
			}
			Module._free(ptr);
		}

		function passArrayToWasm(fn, array, heap) {
			const typedArray = new heapMap[heap](array);
			const ptr = Module._malloc(typedArray.length * typedArray.BYTES_PER_ELEMENT);
			setHeap(typedArray, ptr, heap);
			fn(ptr, array.length);
			Module._free(ptr);
		}

		passArrayToWasm(initialize, [
			value.timeToDiscard,
			value.neverSuspendPinned & 1, 
			value.neverSuspendPlayingAudio & 1, 
			value.neverSuspendUnsavedFormInput & 1,
			value.desaturateFavicon & 1
		], 'HEAP32');

		chrome.tabs.query({}, function(tabs){   
			const tabsToPass = [];  
			for (const tab of tabs) {		
				tabsToPass.push([
					tab.windowId,
					tab.id, 
					tab.active & 1, 
					tab.discarded & 1, 
					tab.pinned & 1, 
					tab.audible & 1
				]);
			}
			pass2DArrayToWasm(tabsInitialization, tabsToPass, 'HEAP32');
		});

		chrome.tabs.onCreated.addListener(function(tab) {
			try {
				passArrayToWasm(tabsOnCreatedHandle, [tab.windowId, tab.id, tab.active & 1, tab.discarded & 1, tab.pinned & 1, tab.audible & 1], 'HEAP32');
			} catch(e) {
				console.log({e: e, f: 'chrome.tabs.onCreated'})
				browser.runtime.reload();
			}
		});

		chrome.windows.onCreated.addListener(function(window) {
			try {
				windowsOnCreatedHandle(window.id);
			} catch(e) {
				console.log({e: e, f: 'chrome.windows.onCreated'})
				browser.runtime.reload();
			}
		});

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			try {
				passArrayToWasm(tabsOnUpdatedHandle, [
					tab.windowId, 
					tab.id, 
					(changeInfo.pinned === undefined || changeInfo.pinned === null) ? 2 : changeInfo.pinned & 1,
					(changeInfo.audible === undefined || changeInfo.audible === null) ? 2 : changeInfo.audible & 1
				], 'HEAP32');
			} catch(e) {
				console.log({e: e, f: 'chrome.tabs.onUpdated'})
				browser.runtime.reload();
			}
		});

		chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
			try {
				tabsOnRemovedHandle(removeInfo.windowId, tabId);
			} catch(e) {
				console.log({e: e, f: 'chrome.tabs.onRemoved'})
				browser.runtime.reload();
			}
		});

		chrome.windows.onRemoved.addListener(function(windowId) {
			try {
				windowsOnRemovedHandle(windowId);
			} catch(e) {
				console.log({e: e, f: 'chrome.windows.onRemoved'})
				browser.runtime.reload();
			}
		});

		chrome.tabs.onActivated.addListener(function(activeInfo) {
			try {
				chrome.tabs.query({}, function(tabs){   
					const tabsToPass = [];  
					for (const tab of tabs) {
						tabsToPass.push([
							tab.windowId,
							tab.id, 
							tab.active & 1, 
							tab.discarded & 1, 
							tab.pinned & 1, 
							tab.audible & 1,
							Math.floor(tab.lastAccessed / 1000)
						]);
					}
					pass2DArrayToWasm(tabsOnActivatedHandle, tabsToPass, 'HEAPF64');
				});
			} catch(e) {
				console.log({e: e, f: 'chrome.tabs.onActivated'})
				browser.runtime.reload();
			}
		});
	};
});
