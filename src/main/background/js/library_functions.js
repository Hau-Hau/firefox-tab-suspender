Module['jsConsoleLog'] = function(num) {
  console.log(num);
};

Module['jsExpiredTabsWatcher'] = function() {
  if (
      Module['internalInterval'] !== undefined &&
      Module['internalInterval'] !== null
  ) {
    return;
  }
  Module['internalInterval'] = setInterval(function() {
    if (!Module.cwrap('cAbleToPushEvent', 'number', ['number'])(6)) {
      return;
    }
    Module.cwrap('cPushEvent', null, ['number'])(6);
  }, 2000);
};

Module['jsClearInterval'] = function() {
  clearInterval(Module['internalInterval']);
  Module['internalInterval'] = undefined;
};

Module['jsChromeTabsDiscard'] = function(tabId) {
  var nonNativeDiscard = function(tabId, title, url) {
    browser.tabs.update(tabId, {
      url: browser.extension.getURL('./discarded.html') + '?t=' +
          encodeURIComponent(title) + '&u=' + encodeURIComponent(url) +
          '&h=' + Math.random().toString(8).substring(2) +
          '&d=' + Module['extension_settings'].discardedPageDarkTheme,
    });
  };

  var contrastImage = function(imageData) {
    var data = imageData.data;
    var contrast = -55 / 100 + 1;
    var intercept = 128 * (1 - contrast);
    for (var i = data.length; i >= 0; i -= 4) {
      data[i] = data[i] * contrast + intercept;
      data[i + 1] = data[i + 1] * contrast + intercept;
      data[i + 2] = data[i + 2] * contrast + intercept;
    }
    return imageData;
  };

  var processFavIconChange = function(tabId, url) {
    chrome.tabs.executeScript(tabId, {
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
  };

  var changeFavicon = function(url) {
    var image = new Image();
    image.src = url;

    image.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(image.width));
      canvas.height = Math.max(1, Math.floor(image.height));

      var context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      context.putImageData(contrastImage(imageData), 0, 0);
      processFavIconChange(tabId, canvas.toDataURL('image/png'));
    };
  };

  browser.tabs.query({}).then(function(tabs) {
    var tabsIndex = tabs.length;
    while (tabsIndex--) {
      if (tabs[tabsIndex].id === tabId && tabs[tabsIndex].active === false &&
          tabs[tabsIndex].url.indexOf('about:') === -1) {
        (function(tab) {
          if (tabs[tabsIndex].title.indexOf('- discarded') < 1) {
            nonNativeDiscard(tabId, tab.title, tab.url);
          }
          setTimeout(function() {
            if (tab.title.indexOf('- discarded') < 1) {
                changeFavicon(tab.favIconUrl);
            }
          }, 1000);
        })(tabs[tabsIndex]);
        break;
      }
    }
  });
};

