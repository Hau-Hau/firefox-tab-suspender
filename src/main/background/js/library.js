mergeInto(LibraryManager.library, {
  jsConsoleLog: function(num) {
    console.log(num);
  },
  jsExpiredTabsWatcher: function() {
    if (
      Module["internalInterval"] !== undefined &&
      Module["internalInterval"] !== null
    ) {
      return;
    }
    Module["internalInterval"] = setInterval(function() {
      if (!Module.cwrap("cAbleToPushEvent", "number", ["number"])(6)) {
        return;
      }
      Module.cwrap("cPushEvent", null, ["number"])(6);
    }, 2000);
  },
  jsClearInterval: function() {
    clearInterval(Module["internalInterval"]);
    Module["internalInterval"] = undefined;
  },
  jsChromeTabsDiscard: function(tabId, option) {
    var nonNativeDiscard = function(tabId, title, url) {
      chrome.tabs.executeScript(tabId, {
        code:
          "(function() {" +
          '  window.location.href = "moz-extension://562e4242-6547-4a77-9b6c-e38828d79c7f/discarded.html";' +
          "})();"
      });
        setTimeout(function() {
          chrome.tabs.executeScript(tabId, {
          code:
            "(function() {" +
            '  document.title = "' + title + '" + " - discarded";' +
            '  document.addEventListener("focus", function () { window.location.href = "' + url + '"; }, true);' +
            "})();"
          })
        }, 1500);
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

    var desaturateImage = function(imageData) {
      var data = imageData.data;
      for (var i = data.length; i >= 0; i -= 4) {
        var grey = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
        data[i] = data[i + 1] = data[i + 2] = grey;
      }
      return imageData;
    };

    var processFavIconChange = function(tabId, url) {
      chrome.tabs.executeScript(tabId, {
        code:
          "(function() {" +
          '  if (!document.querySelector("link[rel~=icon]")) {' +
          "    document.head.insertAdjacentHTML('beforeend', '<link rel=\"icon\">');" +
          "  }" +
          '  if (document.querySelector("link[rel~=icon]")) {' +
          '    Array.prototype.slice.call(document.querySelectorAll("link[rel~=icon]")).forEach(function(l){ l.href = "' +
          url +
          '"; });' +
          "  }" +
          "})();"
      });
    };

    var changeFavicon = function(url) {
      var image = new Image();
      image.src = url;

      image.onload = function() {
        var canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(image.width));
        canvas.height = Math.max(1, Math.floor(image.height));

        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        context.putImageData(Module["faviconFunction"](imageData), 0, 0);
        processFavIconChange(tabId, canvas.toDataURL("image/png"));
      };
    };

    if (Module["faviconFunction"] === undefined) {
      switch (option) {
        case 0: {
          Module["faviconFunction"] = null;
        }
        case 1: {
          Module["faviconFunction"] = contrastImage;
          break;
        }
        case 2: {
          Module["faviconFunction"] = desaturateImage;
          break;
        }
      }
    }

    if (Module["faviconFunction"] === null) {
      // TODO for non native
      chrome.tabs.discard(tabId);
      return;
    }

    browser.tabs.query({}).then(function(tabs) {
      var tabsIndex = tabs.length;
      while (tabsIndex--) {
        if (tabs[tabsIndex].id === tabId && tabs[tabsIndex].title.indexOf("- discarded") < 1 && tabs[tabsIndex].active === false) {
          (function(tab) {
            nonNativeDiscard(tabId, tab.title, tab.url);
            // changeFavicon(tab.favIconUrl);
            setTimeout(function() {
              changeFavicon(tab.favIconUrl)
            }, 1000);
          })(tabs[tabsIndex]);
          break;
        }
      }
    });
  }
});
