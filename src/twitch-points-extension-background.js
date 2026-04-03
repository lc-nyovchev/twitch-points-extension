import { EngineUtils, MESSAGE_CONSTANTS, StorageUtils } from './utils/twitch-points-extension-utils.js'

Promise.resolve(new EngineUtils(chrome)).then(engineUtils => {
    const storageUtils = new StorageUtils(engineUtils)
    const onContentScriptMessage = async (message, sender) => {
        if (sender.id === engineUtils.runtime().id) {
            if (message.type === MESSAGE_CONSTANTS.TWITCH_POINTS_MESSAGE) {
                const channelName = message.channelName
                const points = message.points
                const existingPoints = await storageUtils.getPointsForChannel(channelName)
                await storageUtils.setPoints(channelName, existingPoints + points)
            }
        }
    }
    engineUtils.runtime().onMessage.addListener(onContentScriptMessage)
})

