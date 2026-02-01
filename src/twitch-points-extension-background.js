import { MESSAGE_CONSTANTS, EngineUtils } from './twitch-points-extension-utils.js'

class TwitchPointsStorage {

    async getPoints(channelName) {
        const scoreObj = await EngineUtils.storageGet()
        const score = parseInt(scoreObj[channelName], 10)
        if (score) {
            return score
        }
        return 0
    }

    async setPoints(channelName, points) {
        console.debug(`Points for ${channelName} set to ${points}`)
        return EngineUtils.storageSet({ [channelName]: points })
    }
}

const twitchPointsStorage = new TwitchPointsStorage()

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

EngineUtils.runtime().onMessage.addListener(onContentScriptMessage)
