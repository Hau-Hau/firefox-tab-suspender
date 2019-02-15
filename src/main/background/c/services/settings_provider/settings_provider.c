#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>
#include "settings_provider.h"
#include "../../models/settings.h"

static struct Settings *settings;

//0 uint32_t timeToDiscard,
//1 bool neverSuspendPinned,
//2 bool neverSuspendPlayingAudio,
//3 bool neverSuspendUnsavedFormInput
//4 bool desaturateFavicon
static void initialize(uint32_t timeToDiscard, bool neverSuspendPinned, bool neverSuspendUnsavedFormInput,
                       bool neverSuspendPlayingAudio, bool desaturateFavicon) {
    settings = malloc(sizeof(struct Settings));
    settings->timeToDiscard = timeToDiscard;
    settings->neverSuspendPinned = neverSuspendPinned;
    settings->neverSuspendPlayingAudio = neverSuspendPlayingAudio;
    settings->neverSuspendUnsavedFormInput = neverSuspendUnsavedFormInput;
    settings->desaturateFavicon = desaturateFavicon;
}

static uint32_t getTimeToDiscard() {
    return settings->timeToDiscard;
}

static bool getNeverSuspendPinned() {
    return settings->neverSuspendPinned;
}

static bool getNeverSuspendPlayingAudio() {
    return settings->neverSuspendPlayingAudio;
}

static bool getNeverSuspendUnsavedFormInput() {
    return settings->neverSuspendUnsavedFormInput;
}

static bool getDesaturateFavicon() {
    return settings->desaturateFavicon;
}

settings_provider_namespace const SettingsProvider = {
        initialize,
        getTimeToDiscard,
        getNeverSuspendPinned,
        getNeverSuspendPlayingAudio,
        getNeverSuspendUnsavedFormInput,
        getDesaturateFavicon
};
