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
		describe('createControls', () => {
			it('it should create the proper controls on default', async ({ interfaceBuilder }) => {
				const controls = testUtils.mockVanJSRender(interfaceBuilder.createControls({}))

				expect(controls.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
							<div class="controls-container">
								<div class="clear-button color-switcher" title="${UI_CONSTANTS.CHANGE_THEME_TITLE}">
									<i class="fa-regular fa-moon fa-lg"></i>
								</div>
 							</div>
						`
					)
				)
			})
			it('it should create the proper controls on white theme', async ({ interfaceBuilder }) => {
				const state = vanX.reactive({ colorPalette: UI_CONSTANTS.COLOR_PALETTES.LIGHT })
				const controls = testUtils.mockVanJSRender(interfaceBuilder.createControls(state))

				expect(controls.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
							<div class="controls-container">
								<div class="clear-button color-switcher" title="${UI_CONSTANTS.CHANGE_THEME_TITLE}">
									<i class="fa-regular fa-sun fa-lg"></i>
								</div>
 							</div>
						`
					)
				)
			})
			it('it should switch the theme upon click', async ({ interfaceBuilder, storageUtils }) => {
				const state = vanX.reactive({ colorPalette: UI_CONSTANTS.COLOR_PALETTES.LIGHT })
				const controls = testUtils.mockVanJSRender(interfaceBuilder.createControls(state))
				const setThemeSpy = vi.spyOn(storageUtils, 'setTheme')

				expect(controls.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
							<div class="controls-container">
								<div class="clear-button color-switcher" title="${UI_CONSTANTS.CHANGE_THEME_TITLE}">
									<i class="fa-regular fa-sun fa-lg"></i>
								</div>
 							</div>
						`
					)
				)
				expect(state.colorPalette).toBe(UI_CONSTANTS.COLOR_PALETTES.LIGHT)

				controls.querySelector('.color-switcher')
					.click()

				await testUtils.verifyAsync(async () => {
					expect(state.colorPalette).toBe(UI_CONSTANTS.COLOR_PALETTES.DARK)
					expect(setThemeSpy).toHaveBeenCalledWith(UI_CONSTANTS.COLOR_PALETTES.DARK)
					expect(controls.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
								<div class="controls-container">
									<div class="clear-button color-switcher" title="${UI_CONSTANTS.CHANGE_THEME_TITLE}">
										<i class="fa-regular fa-moon fa-lg"></i>
									</div>
								</div>
							`
						)
					)
				})
			})
		})
	})
})