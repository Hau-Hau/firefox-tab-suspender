#ifndef FTS_SETTINGS_H
#define FTS_SETTINGS_H

#include <stdbool.h>
#include <stdint.h>

struct Settings {
  uint32_t timeToDiscard;
  bool neverSuspendPinned;
  bool neverSuspendUnsavedFormInput;
  bool neverSuspendPlayingAudio;
  bool desaturateFavicon;
};

#endif
