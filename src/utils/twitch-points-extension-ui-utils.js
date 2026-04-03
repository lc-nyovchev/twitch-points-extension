import { STORAGE_CONSTANTS, StorageUtils, UI_CONSTANTS } from './twitch-points-extension-utils.js'

const { h2, h3, table, thead, tbody, div, tr, td, th, i } = van.tags

export class InterfaceElementsBuilder {
    constructor(
        state = {},
        storageUtils = new StorageUtils()
    ) {
        this.state = state
        this.storageUtils = storageUtils
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
        return h2(UI_CONSTANTS.DEFAULT_TITLE)
    }
    createDedication() {
        return h3(UI_CONSTANTS.CONTROLS.DEDICATION.DEFAULT_DEDICATION)
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
                th(UI_CONSTANTS.TABLE_HEADERS.CHANNEL_NAME),
                th(UI_CONSTANTS.TABLE_HEADERS.POINTS),
                th(UI_CONSTANTS.TABLE_HEADERS.DELETE)
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
                            await this.storageUtils.removePoints(channelName)
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
                    await this.storageUtils.setTheme(theme)
                    state.colorPalette = theme
                },
                title: UI_CONSTANTS.CHANGE_THEME_TITLE
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

export class TwitchInterfaceUpdater {
    constructor(
        colorPalette = STORAGE_CONSTANTS.THEME.DEFAULT_VALUE,
        points = {},
        refreshInterval = 5000,
        storageUtils = new StorageUtils()
    ) {
        this.refreshInterval = refreshInterval
        this.storageUtils = storageUtils
        this.state = vanX.reactive({
            points: points,
            colorPalette: colorPalette
        })
        this.interfaceElementsBuilder = new InterfaceElementsBuilder(this.state, this.storageUtils)
    }
    createInterface() {
        van.add(document.body, this.interfaceElementsBuilder.createContainer())
    }
    async checkForChanges() {
        const newPoints = await this.storageUtils.getPoints()
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

export const init = () => {
    Promise.resolve(new StorageUtils()).then(storageUtils => {
        Promise.all([
            storageUtils.getTheme(),
            storageUtils.getPoints()
        ]).then(([theme, points]) => {
            const twitchInterfaceUpdater = new TwitchInterfaceUpdater(
                theme, points, 5000, storageUtils
            )
            twitchInterfaceUpdater
                .checkForChanges()
                .then(() => {twitchInterfaceUpdater.createInterface()})
            setInterval(async () => {
                await twitchInterfaceUpdater.checkForChanges()
            }, twitchInterfaceUpdater.refreshInterval)
        })
    })
}