const {h1, h4, table, div, tr, td, th, input} = van.tags


class InterfaceElementsBuilder {
    COLOR_PALETTES = {
        DARK: 'dark',
        LIGHT: 'light'
    }

    constructor(points) {
        this.points = points
        this.colorPalette = van.state(this.COLOR_PALETTES.LIGHT)
    }

    createContainer() {
        return div(
            {class: 'container'},
            this.createHeader(),
            this.createDedication(),
            this.createColorPaletteSwitcher(),
            this.createTable()
        )
    }

    createHeader() {
        return h1('Twitch Points Extension')
    }

    createDedication() {
        return h4('With ❤️ to Hania')
    }

    createTable() {
        return table(
            {class: 'points-values'},
            this.createTableHeader(),
            Object.entries(this.points.val).map(entry => this.createTableRow(entry[1].channelName,  entry[1].score))
        )
    }

    createTableHeader() {
        return tr(
            th('ChannelName'),
            th('Points'),
            th('Clear')
        )
    }

    createTableRow(channelName, score) {
        return tr(
            td(channelName),
            td(score),
            td(
                input({
                    type: 'button',
                    value: 'x',
                    onclick: async () => {
                      //  await chrome.storage.sync.remove(channelName)
                        this.points.val = [...this.points.val.filter(point => point.channelName !== channelName)]
                    }
                })
            )
        )
    }

    createColorPaletteSwitcher() {
        return div({class: this.colorPalette},
            this.colorPalette,
            input({
                type: 'button',
                value: 'x',
                onclick: () => {
                    if (this.colorPalette.val === this.COLOR_PALETTES.LIGHT) {
                        this.colorPalette.val = this.COLOR_PALETTES.DARK
                    } else {
                        this.colorPalette.val = this.COLOR_PALETTES.LIGHT
                    }
                }
            })
        )
    }
}

class TwitchInterfaceUpdater {
    constructor(refreshInterval = 5000, points = []) {
        this.refreshInterval = refreshInterval
        this.points = van.state(points)
        van.derive(() => console.log('aaa', this.points.val))
        this.interfaceElementsBuilder = new InterfaceElementsBuilder(this.points)
    }

    async getPoints() {
        const pointsRaw = await chrome.storage.sync.get()
        return Object.entries(pointsRaw).map(([channelName, score]) => {
            return {channelName, score}
        })
    }

    createInterface() {
        van.add(document.body, this.interfaceElementsBuilder.createContainer())
    }

    async checkForChanges() {
        this.points.val = await this.getPoints()

    }
}

const twitchInterfaceUpdater = new TwitchInterfaceUpdater()
twitchInterfaceUpdater.checkForChanges().then(() => {
    twitchInterfaceUpdater.createInterface()
})

setInterval(async () => {
    await twitchInterfaceUpdater.checkForChanges()
}, twitchInterfaceUpdater.refreshInterval)
