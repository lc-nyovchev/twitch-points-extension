class TwitchPointsCollector {
    constructor(intervalTimeoutInMs = 5000) {
        this.intervalTimeoutInMs = intervalTimeoutInMs
        this.interval = null
    }
    get started() {
        return !!this.interval
    }
    get button() {
        return document.querySelector(
            '.community-points-summary .tw-transition button'
        )
    }
    collectPoints() {
        console.info(`Checking for points...`)
        const button = this.button
        if (button) {
            button.click()
            console.info('Juicy points!')
        }
    }
    startCollectingPoints() {
        if (this.started) {
            console.debug('Already collecting points')
        } else {
            console.debug('Started collecting points')
            this.interval = setInterval(
                this.collectPoints.bind(this),
                this.intervalTimeoutInMs
            )
        }
    }
    stopCollectingPoints() {
        if (!this.started) {
            console.debug('Already stopped')
        } else {
            console.debug('Stopping collecting points')
            clearInterval(this.interval)
            this.interval = null
        }
    }
}

const twitchPointsCollector = new TwitchPointsCollector()
twitchPointsCollector.startCollectingPoints()
