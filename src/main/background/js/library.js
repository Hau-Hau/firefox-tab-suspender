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
      if (!!Module.cwrap("cCheckLastEvent", "number", ["number"])(6)) {
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
<<<<<<< HEAD
    const contrastImage = function(imageData) {
      const data = imageData.data;
      const contrast = -59 / 100 + 1;
      const intercept = 128 * (1 - contrast);
=======
    var contrastImage = function(imageData) {
      var data = imageData.data;
      var contrast = -59 / 100 + 1;
      var intercept = 128 * (1 - contrast);
>>>>>>> develop
      for (var i = data.length; i >= 0; i -= 4) {
        data[i] = data[i] * contrast + intercept;
        data[i + 1] = data[i + 1] * contrast + intercept;
        data[i + 2] = data[i + 2] * contrast + intercept;
      }
      return imageData;
    };

<<<<<<< HEAD
    const desaturateImage = function(imageData) {
      const data = imageData.data;
      for (let i = data.length; i >= 0; i -= 4) {
        let grey = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
=======
    var desaturateImage = function(imageData) {
      var data = imageData.data;
      for (var i = data.length; i >= 0; i -= 4) {
        var grey = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
>>>>>>> develop
        data[i] = data[i + 1] = data[i + 2] = grey;
      }
      return imageData;
    };

<<<<<<< HEAD
    const processFavIconChange = function(tabId, url) {
=======
    var processFavIconChange = function(tabId, url) {
>>>>>>> develop
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

<<<<<<< HEAD
    const changeFavicon = function(url) {
      const image = new Image();
      image.src = url;

      image.onload = function() {
        const canvas = document.createElement("canvas");
=======
    var changeFavicon = function(url) {
      var image = new Image();
      image.src = url;

      image.onload = function() {
        var canvas = document.createElement("canvas");
>>>>>>> develop
        canvas.width = image.width;
        canvas.height = image.height;

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
      chrome.tabs.discard(tabId);
      return;
    }

    browser.tabs.query({}).then(function(tabs) {
      var tabsIndex = tabs.length;
      while (tabsIndex--) {
        if (tabs[tabsIndex].id === tabId) {
          changeFavicon(tabs[tabsIndex].favIconUrl);
          setTimeout(function() {
            browser.tabs
              .discard(tabId)
              .then(null, processFavIconChange(tabId, tabs[tabsIndex].favIconUrl));
          }, 1000);
          break;
        }
      }
    });
  }
});

