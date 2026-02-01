export const UI_CONSTANTS = {
    COLOR_PALETTES: {
        DARK: 'dark',
        LIGHT: 'light',
        DEFAULT: 'dark'
    },
    HEADER_CONSTANT: 'TWITCH_POINTS_EXTENSION_HEADER'
}

export const STORAGE_CONSTANTS = {
    THEME: {
        KEY: 'TWITCH_POINTS_STORAGE_THEME',
        DEFAULT_VALUE: UI_CONSTANTS.COLOR_PALETTES.DARK
    }
}

export const MESSAGE_CONSTANTS = {
    TWITCH_POINTS_MESSAGE: 'twitchPoints'
}

export const EngineUtils = {
    storageSet: async (obj) => {
        return chrome.storage.sync.set(obj)
    },
    storageGet: async () => {
        return chrome.storage.sync.get()
    },
    storageRemove: async (key) => {
        return chrome.storage.sync.remove(key)
    },
    runtime: () => {
        return chrome.runtime
    },
    action: () => {
        return chrome.action
    }
}