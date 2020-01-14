#ifndef FTS_SETTINGS_DATA_SOURCE_H
#define FTS_SETTINGS_DATA_SOURCE_H

#include <stdbool.h>
#include <stdint.h>

typedef struct {
  void (*const initialize)(uint32_t timeToDiscard, bool neverSuspendPinned, bool neverSuspendUnsavedFormInput,
                           bool neverSuspendPlayingAudio, bool desaturateFavicon);

  struct Settings* (*const getSettings)();
} settings_data_source_namespace;

extern settings_data_source_namespace const SettingsDataSource;

#endif
