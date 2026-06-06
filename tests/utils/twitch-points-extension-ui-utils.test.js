/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InterfaceElementsBuilder } from '../../src/utils/twitch-points-extension-ui-utils'
import { StorageUtils, UI_CONSTANTS } from '../../src/utils/twitch-points-extension-utils'
import testUtils from '../test-utils'


vi.hoisted(async () => {
    const van = await import('vanjs-core')
    const vanX = await import('vanjs-ext')
    globalThis.van = van.default || van
    globalThis.vanX = vanX
})

describe('ui-utils', () => {
    beforeEach((context) => {
        const engineUtils = testUtils.mockEngineUtils()
        context.storageUtils = new StorageUtils(engineUtils)
        context.engineUtils = engineUtils
        context.interfaceBuilder = new InterfaceElementsBuilder({}, context.storageUtils)
    })
    describe('InterfaceElementsBuilder', () => {
        describe('createHeader', () => {
            it('should generate the proper header', async ({ interfaceBuilder }) => {
                const header = testUtils.mockVanJSRender(interfaceBuilder.createHeader())
                expect(header.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`<h2>${UI_CONSTANTS.DEFAULT_TITLE}</h2>`))
            })
        })
        describe('createDedication', () => {
            it('should use the default dedication', async ({ interfaceBuilder }) => {
                const dedication = testUtils.mockVanJSRender(interfaceBuilder.createDedication())
                expect(dedication.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`<h3>${UI_CONSTANTS.CONTROLS.DEDICATION.DEFAULT_DEDICATION}</h3>`))
            })
        })
    })
})