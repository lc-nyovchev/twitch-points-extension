const {div, tr, td, th, input} = van.tags


class InterfaceElementsBuilder {
    COLOR_PALETTES = {
        DARK: 'dark',
        LIGHT: 'light'
    }

    constructor(twitchInterfaceUpdater) {
        this.twitchInterfaceUpdater = twitchInterfaceUpdater
    }

    colorPalette = van.state(this.COLOR_PALETTES.LIGHT)

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
                        await self.twitchInterfaceUpdater.updateInterface()
                    }
                })
            )
        )
    }

    createColorPaletteSwitcher() {
        const self = this
        return div({class: this.colorPalette},
            this.colorPalette,
            input({
                type: 'button',
                value: 'x',
                onclick: () => {
                    if (self.colorPalette.val === self.COLOR_PALETTES.LIGHT) {
                        self.colorPalette.val = self.COLOR_PALETTES.DARK
                    } else {
                        self.colorPalette.val = self.COLOR_PALETTES.LIGHT
                    }
                }
            })
        )
    }
}

class TwitchInterfaceUpdater {
    constructor(refreshInterval = 5000, points = {}) {
        this.refreshInterval = refreshInterval
        this.points = points
        this.interfaceElementsBuilder = new InterfaceElementsBuilder(this)
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
            pointsValuesDiv.innerHTML = ''
            van.add(pointsValuesDiv, this.interfaceElementsBuilder.createHeader())
            for (const point of points) {
                van.add(pointsValuesDiv, this.interfaceElementsBuilder.createPointsRow(point.channelName, point.score))
            }
            van.add(pointsValuesDiv, this.interfaceElementsBuilder.createColorPaletteSwitcher())
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
}

const twitchInterfaceUpdater = new TwitchInterfaceUpdater()
twitchInterfaceUpdater.updateInterface().then(() => {
    setInterval(async () => {
        if (await twitchInterfaceUpdater.isChanged()) {
            await twitchInterfaceUpdater.updateInterface()
        }
    }, twitchInterfaceUpdater.refreshInterval)

})