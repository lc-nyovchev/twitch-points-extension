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
            this.createColorPaletteSwitcher(this.colorPalette),
            this.createTable(this.points)
        )
    }

    createHeader() {
        return h1('Twitch Points Extension')
    }

    createDedication() {
        return h4('With ❤️ to Hania')
    }

    createTable(points) {
        return vanX.list(() =>
            table(
                {class: 'points-values'},
                this.createTableHeader()
            ), points, this.createTableRow)
    }

    createTableHeader() {
        return tr(
            th('ChannelName'),
            th('Points'),
            th('Clear')
        )
    }

    createTableRow(scoreRef, deleter, channelName) {
        return tr(
            td(channelName),
            td(scoreRef),
            td(input({
                type: 'button',
                value: 'x',
                onclick: async () => {
                    delete points[channelName]
                }
            }))
        )
    }

    createColorPaletteSwitcher(colorPalette) {
        return div({class: colorPalette},
            this.colorPalette,
            input({
                type: 'button',
                value: 'x',
                onclick: () => {
                    if (colorPalette.val === this.COLOR_PALETTES.LIGHT) {
                        colorPalette.val = this.COLOR_PALETTES.DARK
                    } else {
                        colorPalette.val = this.COLOR_PALETTES.LIGHT
                    }
                }
            })
        )
    }
}

class TwitchInterfaceUpdater {
    constructor(refreshInterval = 5000, points = []) {
        this.refreshInterval = refreshInterval
        this.points = vanX.reactive(points)
        this.interfaceElementsBuilder = new InterfaceElementsBuilder(this.points)
    }

    async getPoints() {
        return await chrome.storage.sync.get()
    }

    createInterface() {
        van.add(document.body, this.interfaceElementsBuilder.createContainer())
    }

    async checkForChanges() {
        const newPoints = await this.getPoints()
        for (const point in newPoints) {
            if (!this.points.hasOwnProperty(point)) {
                this.points[point] = newPoints[point]
            }
        }
    }
}

const twitchInterfaceUpdater = new TwitchInterfaceUpdater()
twitchInterfaceUpdater.checkForChanges().then(() => {
    twitchInterfaceUpdater.createInterface()
})

setInterval(async () => {
    await twitchInterfaceUpdater.checkForChanges()
}, twitchInterfaceUpdater.refreshInterval)
