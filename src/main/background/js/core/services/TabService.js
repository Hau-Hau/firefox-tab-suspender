import browser from 'webextension-polyfill';
import SettingsRepository from '~/main/background/js/core/data/repositories/SettingsRepository';
import CFunctionsProvider from '~/main/background/js/core/providers/CFunctionsProvider';
import HeapType from '~/main/background/js/core/data/HeapType';
import ImageService from '~/main/background/js/core/services/ImageService';
import WasmService from '~/main/background/js/core/services/WasmService';
import Injector from '~/main/background/js/infrastructure/injector/Injector';
import EventType from '~/main/background/js/core/data/EventType';

export default @Injector.register(
  [WasmService, CFunctionsProvider, SettingsRepository, ImageService],
  x => x.inSingletonScope()
)
class TabService {
  constructor (wasmService, cFunctionsProvider, settingsRepository, imageService) {
    this._cFunctionsProvider = cFunctionsProvider;
    this._wasmService = wasmService;
    this._settingsRepository = settingsRepository;
    this._imageService = imageService;
  }

  // noinspection JSUnusedGlobalSymbols
  async initializeTabs () {
    const tabs = await browser.tabs.query({});
    const data = [];
    for (const tab of tabs) {
      if (tab.url.includes('about:')) {
        continue;
      }
      data.push([
        tab.windowId,
        tab.id,
        tab.active & 1,
        tab.title.indexOf('- discarded') > 1 & 1,
        tab.pinned & 1,
        tab.audible & 1,
      ]);
    }
    this._wasmService.passArray2dToWasm(
      null,
      this._cFunctionsProvider.cTabsInitialization.bind(this._cFunctionsProvider),
      data,
      HeapType.HEAP32
    );
  }

  _nonNativeDiscard (tabId, title, url) {
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction,ES6ModulesDependencies
    browser.tabs.update(tabId, {
      loadReplace: true,
      url: browser.extension.getURL('./discarded.html') + '?t=' +
        encodeURIComponent(title) + '&u=' + encodeURIComponent(url) +
        '&h=' + Math.random().toString(8).substring(2) +
        '&d=' + this._settingsRepository.discardedPageDarkTheme,
    });
  }

  _processFavIconChange (tabId, url) {
    // noinspection JSUnresolvedFunction,JSUnresolvedVariable
    browser.tabs.executeScript(tabId, {
      code:
        '(function() {' +
        '  if (!document.querySelector("link[rel~=icon]")) {' +
        '    document.head.insertAdjacentHTML(\'beforeend\', \'<link rel="icon">\');' +
        '  }' +
        '  if (document.querySelector("link[rel~=icon]")) {' +
        '    Array.prototype.slice.call(document.querySelectorAll("link[rel~=icon]")).forEach(function(l){ l.href = "' +
        url +
        '"; });' +
        '  }' +
        '})();',
    });
  }

  _changeFavicon (tabId, url) {
    const image = new Image();
    // eslint-disable-next-line unicorn/no-abusive-eslint-disable,unicorn/prevent-abbreviations
    image.src = url;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(image.width));
      canvas.height = Math.max(1, Math.floor(image.height));

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      context.putImageData(this._imageService.contrastImage(imageData), 0, 0);
      this._processFavIconChange(tabId, canvas.toDataURL('image/png'));
    };
  }

  async tabsDiscard (tabId, isForce) {
    console.log({tab: tabId});
    // eslint-disable-next-line no-param-reassign,no-implicit-coercion
    isForce = true;
    // isForce = !!isForce;

    const tabs = await browser.tabs.query({});
    console.log(tabs);
    let tabsIndex = tabs.length;
    while (tabsIndex--) {
      if (tabs[tabsIndex].id !== tabId) {
        continue;
      }

      if (tabs[tabsIndex].title.indexOf('- discarded') < 1 &&
          !tabs[tabsIndex].url.includes('about:') &&
          (isForce === true || tabs[tabsIndex].active === false)) {
        ((tab) => {
          this._nonNativeDiscard(tab.id, tab.title, tab.url);
          setTimeout(() => {
            this._changeFavicon(tab.id, tab.favIconUrl);
          }, 1000);
        })(tabs[tabsIndex]);
        break;
      }
    }
  }
}
