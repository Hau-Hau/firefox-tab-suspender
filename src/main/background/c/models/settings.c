#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>

static uint32_t timeToDiscard;
static bool neverSuspendPinned;
static bool neverSuspendPlayingAudio;
static bool neverSuspendUnsavedFormInput;
static bool desaturateFavicon;


//0 uint32_t timeToDiscard,
//1 bool neverSuspendPinned,
//2 bool neverSuspendPlayingAudio,
//3 bool neverSuspendUnsavedFormInput
//4 bool desaturateFavicon
void initialize(newTimeToDiscard, newNeverSuspendPinned, newNeverSuspendPlayingAudio,
                newNeverSuspendUnsavedFormInput, newDesaturateFavicon) {
    timeToDiscard = newTimeToDiscard;
    neverSuspendPinned = newNeverSuspendPinned;
    neverSuspendPlayingAudio = newNeverSuspendPlayingAudio;
    neverSuspendUnsavedFormInput = newNeverSuspendUnsavedFormInput;
    desaturateFavicon = newDesaturateFavicon;
}

uint32_t getTimeToDiscard() {
    return timeToDiscard;
}

bool getNeverSuspendPinned() {
    return neverSuspendPinned;
}

bool getNeverSuspendPlayingAudio() {
    return neverSuspendPlayingAudio;
}

bool getNeverSuspendUnsavedFormInput() {
    return neverSuspendUnsavedFormInput;
}

bool getDesaturateFavicon() {
    return desaturateFavicon;
}
