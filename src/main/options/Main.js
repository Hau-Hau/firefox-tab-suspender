document.addEventListener('DOMContentLoaded', function () {
  const UINT32_MAX = 0xFFFFFFFF;

  const elements = {
    automaticSuspend: this.querySelector('#automatic_suspend'),
    discardedPageDarkTheme: this.querySelector('#discarded_page_dark_theme'),
    loadingTabsImmediately: this.querySelector('#loading_tabs_immediately'),
    neverSuspendPinned: this.querySelector('#never_suspend_pinned'),
    neverSuspendPlayingAudio: this.querySelector('#never_suspend_playing_audio'),
    suspendAllOptionInContextMenu: this.querySelector('#suspend_all_in_context_menu'),
    suspendLeftAndRightOptionsInContextMenu: this.querySelector('#suspend_left_right_in_context_menu'),
    suspendOptionInContextMenu: this.querySelector('#suspend_in_context_menu'),
    suspendOthersOptionInContextMenu: this.querySelector('#suspend_others_in_context_menu'),
    timeToSuspend: this.querySelector('#time_to_suspend'),
  };

  browser.storage.local.get({
    automaticSuspend: true,
    discardedPageDarkTheme: false,
    loadingTabsImmediately: false,
    neverSuspendPinned: true,
    neverSuspendPlayingAudio: true,
    suspendAllOptionInContextMenu: true,
    suspendLeftAndRightOptionsInContextMenu: true,
    suspendOptionInContextMenu: true,
    suspendOthersOptionInContextMenu: true,
    timeToDiscard: 60,
  }).then((value) => {
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

  elements.automaticSuspend.addEventListener('change', function () {
    elements.timeToSuspend.disabled = !this.checked;
  });

  elements.timeToSuspend.max = UINT32_MAX;
  elements.timeToSuspend.addEventListener('input', function () {
    if (isNaN(this.value) || this.value <= 0 || this.value > UINT32_MAX) {
      this.value = 60 * 5;
    }
  });

  for (const element of this.getElementsByName('action')) {
    switch (element.value) {
    case 'Reset':
      element.addEventListener('click', resetOptions);
      break;
    case 'Save':
      element.addEventListener('click', saveOptions);
      break;
    }
  }

  function resetOptions (e) {
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

  function saveOptions (e) {
    e.preventDefault();
    browser.storage.local.set({
      automaticSuspend: elements.automaticSuspend.checked === true,
      discardedPageDarkTheme: elements.discardedPageDarkTheme.checked === true,
      loadingTabsImmediately: elements.loadingTabsImmediately.checked === true,
      neverSuspendPinned: elements.neverSuspendPinned.checked === true,
      neverSuspendPlayingAudio: elements.neverSuspendPlayingAudio.checked === true,
      suspendAllOptionInContextMenu: elements.suspendAllOptionInContextMenu.checked === true,
      suspendLeftAndRightOptionsInContextMenu: elements.suspendLeftAndRightOptionsInContextMenu.checked === true,
      suspendOptionInContextMenu: elements.suspendOptionInContextMenu.checked === true,
      suspendOthersOptionInContextMenu: elements.suspendOthersOptionInContextMenu.checked === true,
      timeToDiscard: parseInt(elements.timeToSuspend.value),
    }, () => {
      browser.extension.getBackgroundPage().window.location.reload();
    });
  }
});

