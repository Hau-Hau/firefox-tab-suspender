#include "settings_data_source.h"
#include "../../models/settings/settings.h"

static struct Settings* MySettings;

static void initialize(uint32_t timeToDiscard, bool neverSuspendPinned, bool neverSuspendUnsavedFormInput,
                       bool neverSuspendPlayingAudio, bool desaturateFavicon) {
  MySettings = Settings.constructor(timeToDiscard, neverSuspendPinned, neverSuspendUnsavedFormInput,
                                    neverSuspendPlayingAudio, desaturateFavicon);
}

static struct Settings* getSettings() {
  return MySettings;
}

settings_data_source_namespace const SettingsDataSource = { initialize, getSettings };
