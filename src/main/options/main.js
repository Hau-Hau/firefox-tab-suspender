document.addEventListener('DOMContentLoaded', function() {
  const UINT32_MAX = 0xFFFFFFFF;

  this.getElementById('time_to_suspend').max = UINT32_MAX;

  let elements = {
    automaticSuspend: this.getElementById('automatic_suspend'),
    timeToSuspend: this.getElementById('time_to_suspend'),
    neverSuspendPinned: this.getElementById('never_suspend_pinned'),
    neverSuspendPlayingAudio: this.getElementById('never_suspend_playing_audio'),
    loadingTabsImmediately: this.getElementById('loading_tabs_immediately'),
    discardedPageDarkTheme: this.getElementById('discarded_page_dark_theme'),
    suspendOptionInContextMenu: this.getElementById('suspend_in_context_menu'),
    suspendOthersOptionInContextMenu: this.getElementById('suspend_others_in_context_menu'),
    suspendLeftAndRightOptionsInContextMenu: this.getElementById('suspend_left_right_in_context_menu'),
    suspendAllOptionInContextMenu: this.getElementById('suspend_all_in_context_menu'),
  };

  browser.storage.local.get({
    automaticSuspend: true,
    timeToDiscard: 60,
    neverSuspendPinned: true,
    neverSuspendPlayingAudio: true,
    loadingTabsImmediately: false,
    discardedPageDarkTheme: false,
    suspendOptionInContextMenu: true,
    suspendOthersOptionInContextMenu: true,
    suspendLeftAndRightOptionsInContextMenu: true,
    suspendAllOptionInContextMenu: true,
  }).then(function(value) {
    elements.automaticSuspend.checked = value.automaticSuspend;
    elements.timeToSuspend.value = value.timeToDiscard;
    elements.neverSuspendPinned.checked = value.neverSuspendPinned;
    elements.neverSuspendPlayingAudio.checked = value.neverSuspendPlayingAudio;
    elements.discardedPageDarkTheme.checked = value.discardedPageDarkTheme;
    elements.loadingTabsImmediately.checked = value.loadingTabsImmediately;
    elements.suspendOptionInContextMenu.checked = value.suspendOptionInContextMenu;
    elements.suspendOthersOptionInContextMenu.checked = value.suspendOthersOptionInContextMenu;
    elements.suspendLeftAndRightOptionsInContextMenu.checked = value.suspendLeftAndRightOptionsInContextMenu;
    elements.suspendAllOptionInContextMenu.checked = value.suspendAllOptionInContextMenu;
    elements.timeToSuspend.disabled = !value.automaticSuspend;
  });

  elements.automaticSuspend.addEventListener('change', function() {
    elements.timeToSuspend.disabled = !this.checked;
  });

  elements.timeToSuspend.addEventListener('input', function() {
    if (isNaN(this.value) || this.value <= 0 || this.value > UINT32_MAX) {
      this.value = 60;
    }
  });

  for (let element of this.getElementsByName('action')) {
    switch (element.value) {
      case 'Reset':
        element.addEventListener('click', resetOptions);
        break;
      case 'Save':
        element.addEventListener('click', saveOptions);
        break;
    }
  }

  function resetOptions(e) {
    e.preventDefault();
    elements.automaticSuspend.checked = true;
    elements.timeToSuspend.value = 60;
    elements.neverSuspendPinned.checked = true;
    elements.neverSuspendPlayingAudio.checked = true;
    elements.loadingTabsImmediately.checked = false;
    elements.discardedPageDarkTheme.checked = false;
    elements.suspendOptionInContextMenu.checked = true;
    elements.suspendOthersOptionInContextMenu.checked = true;
    elements.suspendLeftAndRightOptionsInContextMenu.checked = true;
    elements.suspendAllOptionInContextMenu.checked = true;
    saveOptions(e);
  }

  function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
      automaticSuspend: elements.automaticSuspend.checked === true,
      timeToDiscard: parseInt(elements.timeToSuspend.value),
      neverSuspendPinned: elements.neverSuspendPinned.checked === true,
      neverSuspendPlayingAudio: elements.neverSuspendPlayingAudio.checked === true,
      loadingTabsImmediately: elements.loadingTabsImmediately.checked === true,
      discardedPageDarkTheme: elements.discardedPageDarkTheme.checked === true,
      suspendOptionInContextMenu: elements.suspendOptionInContextMenu.checked === true,
      suspendOthersOptionInContextMenu: elements.suspendOthersOptionInContextMenu.checked === true,
      suspendLeftAndRightOptionsInContextMenu: elements.suspendLeftAndRightOptionsInContextMenu.checked === true,
      suspendAllOptionInContextMenu: elements.suspendAllOptionInContextMenu.checked === true,
    }, function() {
      browser.extension.getBackgroundPage().window.location.reload();
    });
  }
});

