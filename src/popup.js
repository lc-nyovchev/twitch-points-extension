const {tr, td, th, input} = van.tags

class TwitchInterfaceUpdater {
    constructor(refreshInterval = 5000, points = {}) {
        this.refreshInterval = refreshInterval
        this.points = points
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
        if (await this.isChanged()) {
            const points = await this.getPoints()
            const pointsValuesDiv = document.querySelector(this.pointsValuesSelector)
            van.add(pointsValuesDiv, this.createHeader())
            for (const point of points) {
                van.add(pointsValuesDiv, this.createPointsRow(point.channelName, point.score))
            }
        }
    }

    async isChanged() {
        const newPoints = await this.getPoints()
        const changed = JSON.stringify(Object.entries(newPoints).sort()) !== JSON.stringify(Object.entries(this.points).sort())
        if (changed) {
            this.points = newPoints
        }
        return changed
    }

    createHeader() {
        return tr(
            th('ChannelName'),
            th('Points'),
            th('Clear')
        )
    }

    createPointsRow(channelName, score) {
        const self = this
        return tr(
            td(channelName),
            td(score),
            td(
                input({
                    type: 'button',
                    value: 'x',
                    onclick: async () => {
                        await chrome.storage.sync.remove(channelName)
                        await self.updateInterface()
                    }
                })
            )
        )
    }
}

const twitchInterfaceUpdater = new TwitchInterfaceUpdater()
twitchInterfaceUpdater.updateInterface().then(() => {
    setInterval(async () => {
        if (await twitchInterfaceUpdater.isChanged()) {
            await twitchInterfaceUpdater.updateInterface()
        }
    }, twitchInterfaceUpdater.refreshInterval)

})