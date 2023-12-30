const {h1, h4, table, div, tr, td, th, input, text} = van.tags

const CONSTANTS = {
    COLOR_PALETTES: {
        DARK: 'dark',
        LIGHT: 'light'
    }
}

class InterfaceElementsBuilder {


    constructor(state) {
        this.state = state
    }

    createContainer() {
        return div(
            {class: `container ${this.state.colorPalette}`},
            this.createHeader(),
            this.createDedication(),
            this.createColorPaletteSwitcher(this.state),
            this.createTable(this.state.points)
        )
    }

    createHeader() {
        return h1('Twitch Points Extension')
    }

    createDedication() {
        return h4('With ❤️ to Hania')
    }

    createTable(points) {
        return vanX.list(
            () => table({class: 'points-values'}, this.createTableHeader()),
            points,
            (scoreRef, deleter, channelName) => this.createTableRow(scoreRef, deleter, channelName)
        )
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
                    delete this.state.points[channelName]
                }
            }))
        )
    }

    createColorPaletteSwitcher(state) {
        return div({class: () => `container ${state.colorPalette}`},
            text(() => state.colorPalette),
            input({
                type: 'button',
                value: 'x',
                onclick: () => {
                    if (state.colorPalette === CONSTANTS.COLOR_PALETTES.LIGHT) {
                        state.colorPalette = CONSTANTS.COLOR_PALETTES.DARK
                    } else {
                        state.colorPalette = CONSTANTS.COLOR_PALETTES.LIGHT
                    }
                }
            })
        )
    }
}

class TwitchInterfaceUpdater {
    constructor(refreshInterval = 5000, points = []) {
        this.refreshInterval = refreshInterval
        this.state = vanX.reactive({
            points: points,
            colorPalette: CONSTANTS.COLOR_PALETTES.LIGHT
        })
        setTimeout(() => {
            this.state.points['a'] = 520
        }, 5000)
        this.interfaceElementsBuilder = new InterfaceElementsBuilder(this.state)
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
            if (!this.state.points.hasOwnProperty(point)) {
                this.state.points[point] = newPoints[point]
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
