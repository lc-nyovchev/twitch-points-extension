class TwitchPointsCollectorUtils {
    async waitForElement(selector) {
        return new Promise((resolve) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector))
            }
            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect()
                    resolve(document.querySelector(selector))
                }
            })
            observer.observe(document.body, { childList: true, subtree: true })
        })
    }
}

class TwitchPointsCollector {
    constructor() {
        this.points = {}
        this.twitchPointsCollectorUtils = new TwitchPointsCollectorUtils()
    }
    get buttonSelector() {
        return '.community-points-summary .tw-transition button'
    }
    get pointsSelector() {
        return '.community-points-summary__points-add-text'
    }
    get channelNameSelector() {
        return '.metadata-layout__support .tw-title'
    }
    parsePoints(scoreElement) {
        return parseInt(scoreElement.textContent.slice(1), 10)
    }
    async getChannelName() {
        const channelNameElement = await this.twitchPointsCollectorUtils.waitForElement(this.channelNameSelector)
        return channelNameElement.textContent
    }
    async preparePointsMessage() {
        const pointsButton = await this.twitchPointsCollectorUtils.waitForElement(this.buttonSelector)
        const pointsMessagePromise = this.twitchPointsCollectorUtils.waitForElement(this.pointsSelector).then(async (scoreElement) => {
            const channelName = await this.getChannelName()
            const points = this.parsePoints(scoreElement)
            return {
                type: 'twitchPoints',
                points: points,
                channelName: channelName
            }
        })
        pointsButton.click()
        return pointsMessagePromise
    }
    async startCollectingPoints() {
        console.debug('Started collecting points')
        chrome.runtime.sendMessage(await this.preparePointsMessage())
        return new Promise((resolve) => {
            resolve(this.startCollectingPoints())
        })
    }
}

const twitchPointsCollector = new TwitchPointsCollector()
twitchPointsCollector.startCollectingPoints()
