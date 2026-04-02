import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeUtils } from '../../src/utils/twitch-points-extension-ui-utils.js'
import testUtils from '../test-utils'
import { STORAGE_CONSTANTS } from '../../src/utils/twitch-points-extension-utils'

vi.hoisted(async () => {
    const van = await import('vanjs-core')
    const vanX = await import('vanjs-ext')
    globalThis.van = van.default || van
    globalThis.vanX = vanX
})

describe('ThemeUtils', () => {
    beforeEach((context) => {
        const engineUtils = testUtils.mockEngineUtils()
        context.themeUtils = new ThemeUtils(engineUtils)
        context.engineUtils = engineUtils
    })
    describe('setTheme', () => {
        it('should call the proper internals for light', async ({ themeUtils, engineUtils }) => {
            await themeUtils.setTheme('light')

            expect(engineUtils.storageSet).toHaveBeenCalledWith({ [STORAGE_CONSTANTS.THEME.KEY]: 'light' })
        })
        it('should throw error on unsupported theme', async ({themeUtils, engineUtils}) => {
            await expect(themeUtils.setTheme('unsupported theme'))
                .rejects
                .toThrow('Supported themes are only dark and light')
            expect(engineUtils.storageSet).not.toHaveBeenCalled()
        })
    })
})