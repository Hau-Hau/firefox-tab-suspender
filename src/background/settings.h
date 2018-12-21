#ifndef TESTC_SETTINGS_H
#define TESTC_SETTINGS_H

#include <stdbool.h>
#include <stdint.h>

struct Settings {
  uint32_t timeToDiscard;
  bool neverSuspendPinned;
  bool neverSuspendUnsavedFormInput;
  bool neverSuspendPlayingAudio;
};

#endif
