#ifndef FTS_SETTINGS_PROVIDER_SERVICE_H
#define FTS_SETTINGS_PROVIDER_SERVICE_H

typedef struct {
    void (*const initialize)(
            uint32_t timeToDiscard,
            bool neverSuspendPinned,
            bool neverSuspendUnsavedFormInput,
            bool neverSuspendPlayingAudio,
            bool desaturateFavicon
    );

    uint32_t (*const getTimeToDiscard)();

    bool (*const getNeverSuspendPinned)();

    bool (*const getNeverSuspendUnsavedFormInput)();

    bool (*const getNeverSuspendPlayingAudio)();

    bool (*const getDesaturateFavicon)();
} settings_provider_service_namespace;

extern settings_provider_service_namespace const SettingsProviderService;

#endif

