#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include "settings.h"

static struct Settings* constructor(uint32_t timeToDiscard, bool neverSuspendPinned, bool neverSuspendUnsavedFormInput,
                                    bool neverSuspendPlayingAudio, bool desaturateFavicon) {
  struct Settings* self = malloc(sizeof(struct Settings));
  self->timeToDiscard = timeToDiscard;
  self->neverSuspendPinned = neverSuspendPinned;
  self->neverSuspendUnsavedFormInput = neverSuspendUnsavedFormInput;
  self->neverSuspendPlayingAudio = neverSuspendPlayingAudio;
  self->desaturateFavicon = desaturateFavicon;
  return self;
}

static void destructor(struct Settings* self) {
  free(self);
}

settings_namespace const Settings = { constructor, destructor };
