import { MESSAGE_CONSTANTS, EngineUtils } from './utils/twitch-points-extension-utils.js'

class TwitchPointsStorage {
    constructor(engineUtils = new EngineUtils(chrome)) {
        this.engineUtils = engineUtils
    }
    async getPoints(channelName) {
        const scoreObj = await this.engineUtils.storageGet()
        const score = parseInt(scoreObj[channelName], 10)
        if (score) {
            return score
        }
        return 0
    }
    async setPoints(channelName, points) {
        console.debug(`Points for ${channelName} set to ${points}`)
        return this.engineUtils.storageSet({ [channelName]: points })
    }
}

Promise.resolve(new EngineUtils(chrome)).then(engineUtils => {
    const twitchPointsStorage = new TwitchPointsStorage(engineUtils)
    const onContentScriptMessage = async (message, sender) => {
        if (sender.id === EngineUtils.runtime().id) {
            if (message.type === MESSAGE_CONSTANTS.TWITCH_POINTS_MESSAGE) {
                const channelName = message.channelName
                const points = message.points
                const existingPoints = await twitchPointsStorage.getPoints(channelName)
                await twitchPointsStorage.setPoints(channelName, existingPoints + points)
            }
        }
    }
    engineUtils.runtime().onMessage.addListener(onContentScriptMessage)
})

