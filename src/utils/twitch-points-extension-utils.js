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

export class StorageUtils {
    constructor(engineUtils = new EngineUtils(chrome)) {
        this.engineUtils = engineUtils
    }
    async setTheme(theme) {
        if (theme !== UI_CONSTANTS.COLOR_PALETTES.DARK && theme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
            const msg = `Supported themes are only ${UI_CONSTANTS.COLOR_PALETTES.DARK} and ${UI_CONSTANTS.COLOR_PALETTES.LIGHT}`
            console.error(msg)
            throw new Error(msg)
        }
        return await this.engineUtils.storageSet({ [STORAGE_CONSTANTS.THEME.KEY]: theme })
    }
    async getTheme() {
        const store = await this.engineUtils.storageGet()
        const currentTheme = store[STORAGE_CONSTANTS.THEME.KEY]
        if ((currentTheme !== UI_CONSTANTS.COLOR_PALETTES.DARK && currentTheme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT)) {
            return UI_CONSTANTS.COLOR_PALETTES.DEFAULT
        } else {
            return currentTheme
        }
    }
    async getPoints() {
        const points = await this.engineUtils.storageGet()
        delete points[STORAGE_CONSTANTS.THEME.KEY]
        return Object.fromEntries(
            Object
                .entries(points)
                .map(([key, value]) => {
                    const points = parseInt(value, 10)
                    if (points) {
                        return [key, points]
                    } else {
                        return [key, 0]
                    }
                }))
    }
    async getPointsForChannel(channelName) {
        const allPoints= await this.getPoints()
        const channelPoints = allPoints[channelName]
        if (channelPoints) {
            return channelPoints
        } else {
            return 0
        }
    }
    async setPoints(channelName, points) {
        console.debug(`Points for ${channelName} set to ${points}`)
        return this.engineUtils.storageSet({ [channelName]: points })
    }
    async removePoints(channelName) {
        return await this.engineUtils.storageRemove(channelName)
    }
}