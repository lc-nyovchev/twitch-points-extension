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
            return {channelName, score}
        })
    }

    async updateInterface() {
        const points = await this.getPoints()
        const pointsValuesDiv = document.querySelector(this.pointsValuesSelector)
        pointsValuesDiv.innerHTML = '<tr><th>Channel Name</th><th>Points</th><th>Clear</th></tr>'
        for (const point of points) {
            pointsValuesDiv.appendChild(this.createPointElement(point.channelName, point.score))
        }
    }

    createPointElement(channelName, score) {
        const el = document.createElement('tr')
        el.innerHTML = `
            <td>${channelName}</td>
            <td>${score}</td>
            <td><input type="button" value="x"></td>
        `
        const self = this
        el.children[2].addEventListener('click', async () => {
            await chrome.storage.sync.remove(channelName)
            await self.updateInterface()
        })
        return el
    }
}

const twitchInterfaceUpdater = new TwitchInterfaceUpdater()

twitchInterfaceUpdater.updateInterface()
setInterval(() => {
    twitchInterfaceUpdater.updateInterface()
}, twitchInterfaceUpdater.refreshInterval)
