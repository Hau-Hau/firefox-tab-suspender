document.addEventListener("DOMContentLoaded", function() {
	let elements = {
		timeToSuspendElement: this.getElementById('time_to_suspend'),
		neverSuspendPinnedElement: this.getElementById('never_suspend_pinned'),
		neverSuspendPlayingAudioElement: this.getElementById('never_suspend_playing_audio')
	}

	browser.storage.local.get({
		timeToDiscard: 60,
		neverSuspendPinned: true,
		neverSuspendPlayingAudio: true
	}).then(function(value) {
		elements.timeToSuspendElement.value = value.timeToDiscard;
		elements.neverSuspendPinnedElement.checked = value.neverSuspendPinned;
		elements.neverSuspendPlayingAudioElement.checked = value.neverSuspendPlayingAudio;
	  });

	elements.timeToSuspendElement.addEventListener('input', function() {
		if (isNaN(this.value) || this.value <= 0) {
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
		elements.timeToSuspendElement.value = 60;
		elements.neverSuspendPinnedElement.checked = true;
		elements.neverSuspendPlayingAudioElement.checked = true;
		saveOptions(e)
	}

	function saveOptions(e) {
		e.preventDefault();
		browser.storage.local.set({
			timeToDiscard: parseInt(elements.timeToSuspendElement.value),
			neverSuspendPinned: elements.neverSuspendPinnedElement.checked === true,
			neverSuspendPlayingAudio: elements.neverSuspendPlayingAudioElement.checked === true
		});
		browser.runtime.reload();
	}
});
