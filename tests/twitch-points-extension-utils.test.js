import { beforeEach, describe, it, expect, vi } from 'vitest'
import { EngineUtils, MESSAGE_CONSTANTS, STORAGE_CONSTANTS, UI_CONSTANTS } from '../src/twitch-points-extension-utils.js'

describe('UI_CONSTANTS', () => {
    it('should have the correct color palettes values', () => {
        expect(UI_CONSTANTS.COLOR_PALETTES.DARK).toBe('dark')
        expect(UI_CONSTANTS.COLOR_PALETTES.LIGHT).toBe('light')
        expect(UI_CONSTANTS.COLOR_PALETTES.DEFAULT).toBe('dark')
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
        vi.stubGlobal('chrome', chrome)
    })
    it('storageSet should call the proper internals', async ({ chrome }) => {
        const value = { key: 'value' }
        await EngineUtils.storageSet(value)
        expect(chrome.storage.sync.set).toHaveBeenCalledWith(value)
    })
    describe('storageGet', () => {
        it('should call the proper internals', async ({ chrome }) => {
            await EngineUtils.storageGet()
            expect(chrome.storage.sync.get).toHaveBeenCalled()
        })
        it('should return the correct value', async ({ chrome }) => {
            const expectedResult = { youtube: '420', google: '1337', gmail: '1911' }
            chrome.storage.sync.get.mockResolvedValueOnce(expectedResult)
            const storage = await EngineUtils.storageGet()
            expect(storage).toEqual(expectedResult)
        })
    })
    it('storageRemove call the proper internals', async ({ chrome }) => {
        const website = 'google'
        await EngineUtils.storageRemove(website)
        expect(chrome.storage.sync.remove).toHaveBeenCalledWith(website)
    })
    it('runtime call the proper internals', ({ chrome }) => {
        expect(EngineUtils.runtime()).toBe(chrome.runtime)
    })
    it('action call the proper internals', ({ chrome }) => {
        expect(EngineUtils.action()).toBe(chrome.action)
    })
})
