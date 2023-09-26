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
            observer.observe(document.body, {childList: true, subtree: true})
        })
    }
}

class TwitchPointsCollector {
    constructor() {
        this.started = false
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
    get channelName() {
        return document.querySelector(this.channelNameSelector).textContent
    }
    parsePoints(scoreElement) {
        return parseInt(scoreElement.textContent.slice(1), 10)
    }
    startCollectingPoints() {
        if (this.started) {
            console.debug('Already collecting points')
        } else {
            this.started = true
            console.debug('Started collecting points')
            this.twitchPointsCollectorUtils.waitForElement(this.buttonSelector).then((pointsButton) => {
                this.twitchPointsCollectorUtils.waitForElement(this.pointsSelector).then((scoreElement) => {
                    const message = {
                        type: 'twitchPoints',
                        points: this.parsePoints(scoreElement),
                        channelName: this.channelName
                    }
                    console.log(`Points collected: ${message}`)
                    browser.runtime.sendMessage(message);
                })
                pointsButton.click()
            })
        }
    }
}

const twitchPointsCollector = new TwitchPointsCollector()
twitchPointsCollector.startCollectingPoints()