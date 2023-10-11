class TwitchInterfaceUpdater {
    constructor(refreshInterval = 5000) {
        this.refreshInterval = refreshInterval
    }
    get pointsValuesSelector() {
        return '.points-values'
    }
    async getPoints() {
        const pointsRaw = await chrome.storage.sync.get()
        return Object.entries(pointsRaw).map(([channelName, score]) => {
            return { channelName, score }
        })
    }
    async updateInterface() {
        const points = await this.getPoints()
        const pointsValuesDiv = document.querySelector(this.pointsValuesSelector)
        pointsValuesDiv.innerHTML = ''
        for (const point of points) {
            console.log(point)
            pointsValuesDiv.appendChild(this.createPointElement(point.channelName, point.score))
        }
    }
    createPointElement(channelName, score) {
        const el = document.createElement('div')
        el.innerText = `channelName: ${channelName}, score: ${score}`
        el.className = 'points-values-entry'
        return el
    }
}

const twitchInterfaceUpdater = new TwitchInterfaceUpdater()

setInterval(() => {
    twitchInterfaceUpdater.updateInterface()
}, twitchInterfaceUpdater.refreshInterval)
