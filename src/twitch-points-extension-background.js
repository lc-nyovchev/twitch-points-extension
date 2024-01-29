class TwitchPointsStorage {

    async getPoints(channelName) {
        const scoreObj = await chrome.storage.sync.get()
        const score = parseInt(scoreObj[channelName], 10)
        if (score) {
            return score
        }
        return 0
    }

    async setPoints(channelName, points) {
        console.debug(`Points for ${channelName} set to ${points}`)
        return await chrome.storage.sync.set({[channelName]: points})
    }
}

twitchPointsStorage = new TwitchPointsStorage()

const onContentScriptMessage = async (message, sender) => {
    if (sender.id === chrome.runtime.id) {
        if (message.type === 'twitchPoints') {
            const channelName = message.channelName
            const points = message.points
            const existingPoints = await twitchPointsStorage.getPoints(channelName)
            await twitchPointsStorage.setPoints(channelName, existingPoints + points)
        }
    }
}

chrome.runtime.onMessage.addListener(onContentScriptMessage)
