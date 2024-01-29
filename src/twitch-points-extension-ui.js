const {h1, h3, table, div, tr, td, th, input, text, i} = van.tags

const CONSTANTS = {
    COLOR_PALETTES: {
        DARK: 'dark',
        LIGHT: 'light',
        DEFAULT: 'dark'
    },
    COLOR_PALETTES_THEME_STORE_KEY: 'TWITCH_POINTS_STORAGE_THEME',
    HEADER_CONSTANT: 'TWITCH_POINTS_EXTENSION_HEADER'
}

const ThemeUtils = {
    async setTheme(theme) {
        if (theme !== CONSTANTS.COLOR_PALETTES.DARK && theme !== CONSTANTS.COLOR_PALETTES.LIGHT) {
            console.error(`Supported themes are only ${CONSTANTS.COLOR_PALETTES.DARK} and ${CONSTANTS.COLOR_PALETTES.LIGHT}`)
        }
        return await chrome.storage.sync.set({[CONSTANTS.COLOR_PALETTES_THEME_STORE_KEY]: theme})
    },
    async getTheme() {
        const store = await chrome.storage.sync.get()
        const currentTheme = store[CONSTANTS.COLOR_PALETTES_THEME_STORE_KEY]
        if ((currentTheme !== CONSTANTS.COLOR_PALETTES.DARK && currentTheme !== CONSTANTS.COLOR_PALETTES.LIGHT)) {
            return CONSTANTS.COLOR_PALETTES.DEFAULT
        } else {
            return currentTheme
        }
    }
}

class InterfaceElementsBuilder {

    constructor(state) {
        this.state = state
    }

    createContainer() {
        return div(
            {class: () => `container ${this.state.colorPalette}`},
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
        return h3('With ❤️ to Hania')
    }

    createTable(points) {
        return vanX.list(
            () => table({class: 'points-values'}),
            points,
            (score, deleter, channelName) => this.createTableRow(score, deleter, channelName)
        )
    }

    createTableHeader() {
        return tr(
            th('ChannelName'),
            th('Points'),
            th('Delete')
        )
    }

    createTableRow(score, deleter, channelName) {
        if (channelName === CONSTANTS.HEADER_CONSTANT) {
            return this.createTableHeader()
        }
        return tr(
            td(channelName),
            td(score),
            td(
                div({
                        class: 'clear-button',
                        onclick: async () => {
                            await chrome.storage.sync.remove(channelName)
                            deleter()
                        }
                    },
                    i({class: 'fa-solid fa-trash'})
                )
            )
        )
    }

    createColorPaletteSwitcher(state) {
        return div(
            {
                class: 'clear-button color-switcher',
                onclick: async () => {
                    const theme = state.colorPalette === CONSTANTS.COLOR_PALETTES.LIGHT ? CONSTANTS.COLOR_PALETTES.DARK : CONSTANTS.COLOR_PALETTES.LIGHT
                    await ThemeUtils.setTheme(theme)
                    state.colorPalette = theme
                }
            },
            text(() => state.colorPalette),
            i({
                class: () => {
                    if (state.colorPalette === CONSTANTS.COLOR_PALETTES.LIGHT) {
                        return 'fa-regular fa-sun'
                    } else {
                        return 'fa-regular fa-moon'
                    }
                }
            }),
        )
    }
}

class TwitchInterfaceUpdater {
    constructor(colorPalette = CONSTANTS.COLOR_PALETTES.DEFAULT, points = {}, refreshInterval = 5000) {
        this.refreshInterval = refreshInterval
        this.state = vanX.reactive({
            points: Object.assign(points, {[CONSTANTS.HEADER_CONSTANT]: 420}),
            colorPalette: colorPalette
        })
        this.interfaceElementsBuilder = new InterfaceElementsBuilder(this.state)
    }

    async getPoints() {
        const points = await chrome.storage.sync.get()
        delete points[CONSTANTS.COLOR_PALETTES_THEME_STORE_KEY]
        return points
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

ThemeUtils.getTheme().then((theme) => {
    const twitchInterfaceUpdater = new TwitchInterfaceUpdater(theme)
    twitchInterfaceUpdater.checkForChanges().then(() => {
        twitchInterfaceUpdater.createInterface()
    })

    setInterval(async () => {
        await twitchInterfaceUpdater.checkForChanges()
    }, twitchInterfaceUpdater.refreshInterval)
})