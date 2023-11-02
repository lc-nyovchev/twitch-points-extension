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
        pointsValuesDiv.innerHTML = '<tr><th>Channel Name</th><th>Points</th></tr>'
        for (const point of points) {
            pointsValuesDiv.appendChild(this.createPointElement(point.channelName, point.score))
        }
    }
    createPointElement(channelName, score) {
        const el = document.createElement('tr')
        el.innerHTML = `<td>${channelName}</td><td>${score}</td>`
        return el
    }
}

const twitchInterfaceUpdater = new TwitchInterfaceUpdater()

twitchInterfaceUpdater.updateInterface()
setInterval(() => {
    twitchInterfaceUpdater.updateInterface()
}, twitchInterfaceUpdater.refreshInterval)
