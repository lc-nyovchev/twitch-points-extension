import { EngineUtils, UI_CONSTANTS, STORAGE_CONSTANTS } from './twitch-points-extension-utils.js'

const { h2, h3, table, thead, tbody, div, tr, td, th, i } = van.tags

const ThemeUtils = {
    async setTheme(theme) {
        if (theme !== UI_CONSTANTS.COLOR_PALETTES.DARK && theme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
            console.error(`Supported themes are only ${UI_CONSTANTS.COLOR_PALETTES.DARK} and ${UI_CONSTANTS.COLOR_PALETTES.LIGHT}`)
        }
        return await EngineUtils.storageSet({ [STORAGE_CONSTANTS.THEME.KEY]: theme })
    },
    async getTheme() {
        const store = await EngineUtils.storageGet()
        const currentTheme = store[STORAGE_CONSTANTS.THEME.KEY]
        if ((currentTheme !== UI_CONSTANTS.COLOR_PALETTES.DARK && currentTheme !== UI_CONSTANTS.COLOR_PALETTES.LIGHT)) {
            return UI_CONSTANTS.COLOR_PALETTES.DEFAULT
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
        van.derive(() => {
            document.body.className = this.state.colorPalette
        })
        return div(
            { class: 'container' },
            this.createHeader(),
            this.createControls(this.state),
            this.createDedication(),
            this.createTable(this.state.points)
        )
    }

    createHeader() {
        return h2('Twitch Points Extension')
    }

    createDedication() {
        return h3('With ❤️ to Hania')
    }

    createControls(state) {
        return div(
            { class: 'controls-container' },
            this.createColorPaletteSwitcher(state)
        )
    }

    createTable(points) {
        return table(
            this.createTableHeader(),
            vanX.list(tbody, points, (score, deleter, channelName) => this.createTableRow(score, deleter, channelName))
        )
    }

    createTableHeader() {
        return thead(
            tr(
                th('ChannelName'),
                th('Points'),
                th('Delete')
            )
        )
    }

    createTableRow(score, deleter, channelName) {
        return tr(
            td(channelName),
            td(score),
            td(
                div({
                        class: 'clear-button',
                        onclick: async () => {
                            await EngineUtils.storageRemove(channelName)
                            deleter()
                        }
                    },
                    i({ class: 'fa-solid fa-trash fa-xs', title: 'Delete' })
                )
            )
        )
    }

    createColorPaletteSwitcher(state) {
        return div(
            {
                class: 'clear-button color-switcher',
                onclick: async () => {
                    const theme = state.colorPalette === UI_CONSTANTS.COLOR_PALETTES.LIGHT ? UI_CONSTANTS.COLOR_PALETTES.DARK : UI_CONSTANTS.COLOR_PALETTES.LIGHT
                    await ThemeUtils.setTheme(theme)
                    state.colorPalette = theme
                },
                title: 'Change theme'
            },
            i({
                class: () => {
                    if (state.colorPalette === UI_CONSTANTS.COLOR_PALETTES.LIGHT) {
                        return 'fa-regular fa-sun fa-lg'
                    } else {
                        return 'fa-regular fa-moon fa-lg'
                    }
                }
            })
        )
    }
}

class TwitchInterfaceUpdater {
    constructor(colorPalette = STORAGE_CONSTANTS.THEME.DEFAULT_VALUE, points = {}, refreshInterval = 5000) {
        this.refreshInterval = refreshInterval
        this.state = vanX.reactive({
            points: points,
            colorPalette: colorPalette
        })
        this.interfaceElementsBuilder = new InterfaceElementsBuilder(this.state)
    }

    async getPoints() {
        const points = await EngineUtils.storageGet()
        delete points[STORAGE_CONSTANTS.THEME.KEY]
        return points
    }

    createInterface() {
        van.add(document.body, this.interfaceElementsBuilder.createContainer())
    }

    async checkForChanges() {
        const newPoints = await this.getPoints()
        for (const point in this.state.points) {
            if (!newPoints.hasOwnProperty(point)) {
                delete this.state.points[point]
            }
        }
        for (const point in newPoints) {
            if (this.state.points[point] !== newPoints[point]) {
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