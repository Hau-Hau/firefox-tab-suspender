#ifndef FTS_SETTINGS_REPOSITORY_H
#define FTS_SETTINGS_REPOSITORY_H

typedef struct {
  uint32_t (*const getTimeToDiscard)();

  bool (*const getNeverSuspendPinned)();

  bool (*const getNeverSuspendUnsavedFormInput)();

  bool (*const getNeverSuspendPlayingAudio)();

  bool (*const getDesaturateFavicon)();
} settings_repository_namespace;

extern settings_repository_namespace const SettingsRepository;

#endif
