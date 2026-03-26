export const UI_CONSTANTS = {
    COLOR_PALETTES: {
        DARK: 'dark',
        LIGHT: 'light',
        DEFAULT: 'dark'
    },
    DEFAULT_TITLE: 'Twitch Points Extension',
    TABLE_HEADERS: {
        CHANNEL_NAME: 'ChannelName',
        POINTS: 'Points',
        DELETE: 'Delete'
    },
    CHANGE_THEME_TITLE: 'Change theme',
    CONTROLS: {
        DEDICATION: {
            DEFAULT_DEDICATION: 'With ❤️ to Hania'
        }
    }
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

export class EngineUtils {
    constructor(chrome = chrome) {
        this.chrome = chrome
    }
    storageSet = async (obj) => {
        return this.chrome.storage.sync.set(obj)
    }
    storageGet = async () => {
        return this.chrome.storage.sync.get()
    }
    storageRemove = async (key) => {
        return this.chrome.storage.sync.remove(key)
    }
    runtime = () => {
        return this.chrome.runtime
    }
    action = () => {
        return this.chrome.action
    }
}