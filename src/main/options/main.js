document.addEventListener('DOMContentLoaded', function() {
	const UINT32_MAX = 0xFFFFFFFF;

	document.getElementById('time_to_suspend').max = UINT32_MAX;

	let elements = {
		automaticSuspend: this.getElementById('automatic_suspend'),
		timeToSuspend: this.getElementById('time_to_suspend'),
		neverSuspendPinned: this.getElementById('never_suspend_pinned'),
		neverSuspendPlayingAudio: this.getElementById('never_suspend_playing_audio'),
		desaturateFavicon: this.getElementById('desaturate_favicon'),
		nonNativeDiscarding: this.getElementById('non_native_discarding'),
		suspendOptionInContextMenu: this.getElementById('suspend_in_context_menu')
	}

	browser.storage.local.get({
		automaticSuspend: true,
		timeToDiscard: 60,
		neverSuspendPinned: true,
		neverSuspendPlayingAudio: true,
		desaturateFavicon: true,
		nonNativeDiscarding: true,
		suspendOptionInContextMenu: true
	}).then(function(value) {
		elements.automaticSuspend.checked = value.automaticSuspend;
		elements.timeToSuspend.value = value.timeToDiscard;
		elements.neverSuspendPinned.checked = value.neverSuspendPinned;
		elements.neverSuspendPlayingAudio.checked = value.neverSuspendPlayingAudio;
		elements.desaturateFavicon.checked = value.desaturateFavicon;
		elements.nonNativeDiscarding.checked = value.nonNativeDiscarding;
		elements.suspendOptionInContextMenu.checked = value.suspendOptionInContextMenu;

		elements.timeToSuspend.disabled = !value.automaticSuspend;
	});

	elements.automaticSuspend.addEventListener('change', function() {
		elements.timeToSuspend.disabled = !this.checked
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
		elements.desaturateFavicon.checked = true;
		elements.nonNativeDiscarding.checked = true;
		elements.suspendOptionInContextMenu.checked = true;
		saveOptions(e)
	}

	function saveOptions(e) {
		e.preventDefault();
		browser.storage.local.set({
			automaticSuspend: elements.automaticSuspend.checked === true,
			timeToDiscard: parseInt(elements.timeToSuspend.value),
			neverSuspendPinned: elements.neverSuspendPinned.checked === true,
			neverSuspendPlayingAudio: elements.neverSuspendPlayingAudio.checked === true,
			desaturateFavicon: elements.desaturateFavicon.checked === true,
			nonNativeDiscarding: elements.nonNativeDiscarding.checked === true,
			suspendOptionInContextMenu: elements.suspendOptionInContextMenu.checked === true
		});
		browser.runtime.reload();
	}
});

