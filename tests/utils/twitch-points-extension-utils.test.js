import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EngineUtils, MESSAGE_CONSTANTS, STORAGE_CONSTANTS, StorageUtils, UI_CONSTANTS } from '../../src/utils/twitch-points-extension-utils.js'
import testUtils from '../test-utils'

describe('UI_CONSTANTS', () => {
    it('should have the correct color palettes values', () => {
        expect(UI_CONSTANTS.COLOR_PALETTES.DARK).toBe('dark')
        expect(UI_CONSTANTS.COLOR_PALETTES.LIGHT).toBe('light')
        expect(UI_CONSTANTS.COLOR_PALETTES.DEFAULT).toBe('dark')
    })
    it('should have the correct default title', () => {
        expect(UI_CONSTANTS.DEFAULT_TITLE).toBe('Twitch Points Extension')
    })
    it('should have the correct table headers', () => {
        expect(UI_CONSTANTS.TABLE_HEADERS.CHANNEL_NAME).toBe('ChannelName')
        expect(UI_CONSTANTS.TABLE_HEADERS.POINTS).toBe('Points')
        expect(UI_CONSTANTS.TABLE_HEADERS.DELETE).toBe('Delete')
    })
    it('should have the correct change theme title', () => {
        expect(UI_CONSTANTS.CHANGE_THEME_TITLE).toBe('Change theme')
    })
    it('should have the correct default dedication', () => {
        expect(UI_CONSTANTS.CONTROLS.DEDICATION.DEFAULT_DEDICATION).toBe('With ❤️ to Hania')
    })
})

describe('STORAGE_CONSTANTS', () => {
    it('should have the correct theme key', () => {
        expect(STORAGE_CONSTANTS.THEME.KEY).toBe('TWITCH_POINTS_STORAGE_THEME')
    })
    it('should have the correct default theme value', () => {
        expect(STORAGE_CONSTANTS.THEME.DEFAULT_VALUE).toBe('dark')
    })
})

describe('MESSAGE_CONSTANTS', () => {
    it('should have the correct message type key', () => {
        expect(MESSAGE_CONSTANTS.TWITCH_POINTS_MESSAGE).toBe('twitchPoints')
    })
})

describe('EngineUtils', () => {
    beforeEach((context) => {
        const namedMock = name => vi.fn().mockName(name)
        const chrome = {
            storage: {
                sync: {
                    set: namedMock('set'),
                    get: namedMock('get'),
                    remove: namedMock('remove')
                }
            },
            runtime: namedMock('runtime'),
            action: namedMock('action')
        }
        context.chrome = chrome
        context.engineUtils = new EngineUtils(chrome)
    })
    it('storageSet should call the proper internals', async ({ chrome, engineUtils }) => {
        const value = { key: 'value' }

        await engineUtils.storageSet(value)

        expect(chrome.storage.sync.set).toHaveBeenCalledWith(value)
    })
    describe('storageGet', () => {
        it('should call the proper internals', async ({ chrome, engineUtils }) => {
            await engineUtils.storageGet()

            expect(chrome.storage.sync.get).toHaveBeenCalled()
        })
        it('should return the correct value', async ({ chrome, engineUtils }) => {
            const expectedResult = { youtube: '420', google: '1337', gmail: '1911' }
            chrome.storage.sync.get.mockResolvedValueOnce(expectedResult)

            const storage = await engineUtils.storageGet()

            expect(storage).toEqual(expectedResult)
        })
    })
    it('storageRemove call the proper internals', async ({ chrome, engineUtils }) => {
        const website = 'google'

        await engineUtils.storageRemove(website)

        expect(chrome.storage.sync.remove).toHaveBeenCalledWith(website)
    })
    it('runtime call the proper internals', ({ chrome, engineUtils }) => {
        expect(engineUtils.runtime()).toBe(chrome.runtime)
    })
    it('action call the proper internals', ({ chrome, engineUtils }) => {
        expect(engineUtils.action()).toBe(chrome.action)
    })
})

describe('StorageUtils', () => {
    beforeEach((context) => {
        const engineUtils = testUtils.mockEngineUtils()
        context.storageUtils = new StorageUtils(engineUtils)
        context.engineUtils = engineUtils
    })
    describe('setTheme', () => {
        it('should call the proper internals for light', async ({ storageUtils, engineUtils }) => {
            await storageUtils.setTheme('light')

            expect(engineUtils.storageSet).toHaveBeenCalledWith({ [STORAGE_CONSTANTS.THEME.KEY]: 'light' })
        })
        it('should throw error on unsupported theme', async ({ storageUtils, engineUtils }) => {
            await expect(storageUtils.setTheme('unsupported theme'))
                .rejects
                .toThrow('Supported themes are only dark and light')
            expect(engineUtils.storageSet).not.toHaveBeenCalled()
        })
    })
    describe('getTheme', () => {
        it('should return the dark theme by default', async ({ storageUtils, engineUtils }) => {
            engineUtils.storageGet.mockResolvedValueOnce({})

            const theme = await storageUtils.getTheme()

            expect(theme).toBe('dark')
            expect(engineUtils.storageGet).toHaveBeenCalled()
        })
        it('should return the correct theme if set', async ({ storageUtils, engineUtils }) => {
            engineUtils.storageGet.mockResolvedValueOnce({ [STORAGE_CONSTANTS.THEME.KEY]: 'light' })

            const theme = await storageUtils.getTheme()

            expect(theme).toBe('light')
            expect(engineUtils.storageGet).toHaveBeenCalled()
        })
    })
    describe('getPoints', () => {
        it('should return an empty object if things are not set', async ({ storageUtils, engineUtils }) => {
            engineUtils.storageGet.mockResolvedValueOnce({})

            const points = await storageUtils.getPoints()

            expect(points).toEqual({})
            expect(engineUtils.storageGet).toHaveBeenCalled()
        })
        it('should return the correct points converted to int', async ({ storageUtils, engineUtils }) => {
            engineUtils.storageGet.mockResolvedValueOnce({ 'grubby': '420' })

            const points = await storageUtils.getPoints()

            expect(points).toEqual({ grubby: 420 })
        })
        it('should ignore the theme if set',async ({ storageUtils, engineUtils }) => {
            engineUtils.storageGet.mockResolvedValueOnce({
                back2Warcraft: '1911',
                [STORAGE_CONSTANTS.THEME.KEY]: 'light',
                grubby: '420'
            })

            const points = await storageUtils.getPoints()

            expect(points).toEqual({ grubby: 420, back2Warcraft: 1911 })
            expect(engineUtils.storageGet).toHaveBeenCalled()
        })
    })
    describe('getPointsForChannel', () => {
        it('should return the correct points', async ({ storageUtils, engineUtils }) => {
            engineUtils.storageGet.mockResolvedValueOnce({ 'grubby': '420' })

            const points = await storageUtils.getPointsForChannel('grubby')

            expect(points).toBe(420)
            expect(engineUtils.storageGet).toHaveBeenCalled()
        })
        it('should return 0 if channel doesnt exist',  async ({ storageUtils, engineUtils }) => {
            engineUtils.storageGet.mockResolvedValueOnce({ 'grubby': '420' })

            const points = await storageUtils.getPointsForChannel('grubby-with-a-moustache')

            expect(points).toBe(0)
            expect(engineUtils.storageGet).toHaveBeenCalled()
        })
    })
})
