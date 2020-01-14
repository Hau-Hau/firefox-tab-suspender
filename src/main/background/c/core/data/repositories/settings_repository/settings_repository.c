#include <stdbool.h>
#include <stdint.h>
#include "../../data_sources/settings_data_source/settings_data_source.h"
#include "../../models/settings/settings.h"
#include "settings_repository.h"

static uint32_t getTimeToDiscard() {
  return SettingsDataSource.getSettings()->timeToDiscard;
}

static bool getNeverSuspendPinned() {
  return SettingsDataSource.getSettings()->neverSuspendPinned;
}

static bool getNeverSuspendPlayingAudio() {
  return SettingsDataSource.getSettings()->neverSuspendPlayingAudio;
}

static bool getNeverSuspendUnsavedFormInput() {
  return SettingsDataSource.getSettings()->neverSuspendUnsavedFormInput;
}

static bool getDesaturateFavicon() {
  return SettingsDataSource.getSettings()->desaturateFavicon;
}

settings_repository_namespace const SettingsRepository = { getTimeToDiscard, getNeverSuspendPinned,
                                                           getNeverSuspendPlayingAudio, getNeverSuspendUnsavedFormInput,
                                                           getDesaturateFavicon };
