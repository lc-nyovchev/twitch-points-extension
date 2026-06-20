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
		describe('createTableHeader', () => {
			it('should generate the proper table header', async ({ interfaceBuilder }) => {
				const tableHeader = testUtils.mockVanJSRender(interfaceBuilder.createTableHeader())

				expect(tableHeader.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
					<thead>
						<tr>
							<th>${UI_CONSTANTS.TABLE_HEADERS.CHANNEL_NAME}</th>
							<th>${UI_CONSTANTS.TABLE_HEADERS.POINTS}</th>
							<th>${UI_CONSTANTS.TABLE_HEADERS.DELETE}</th>
						</tr>
					</thead>
				`))
			})
		})
		describe('createTable', () => {
			it('should generate the proper table', async ({ interfaceBuilder }) => {
				const points = vanX.reactive({ 'grubby': 420, 'back2Warcraft': 1911 })

				const table = testUtils.mockVanJSRender(interfaceBuilder.createTable(points))

				expect(table.outerHTML).toMatchInlineSnapshot(testUtils.sanitizeHtml(`
					<table>
						<thead>
							<tr>
								<th>${UI_CONSTANTS.TABLE_HEADERS.CHANNEL_NAME}</th>
								<th>${UI_CONSTANTS.TABLE_HEADERS.POINTS}</th>		
								<th>${UI_CONSTANTS.TABLE_HEADERS.DELETE}</th>
							</tr>	
						</thead>
						<tbody>
							<tr>
								<td>grubby</td>
								<td>420</td>
								<td>
									<div class="clear-button">
										<i class="fa-solid fa-trash fa-xs" title="${UI_CONSTANTS.TABLE_ROWS.CONTROLS.DELETE_BUTTON_TITLE}"></i> 
									</div>
								</td>
							</tr>
							<tr>
								<td>back2Warcraft</td>
								<td>1911</td>
								<td>
									<div class="clear-button">
										<i class="fa-solid fa-trash fa-xs" title="${UI_CONSTANTS.TABLE_ROWS.CONTROLS.DELETE_BUTTON_TITLE}"></i> 
									</div> 
								</td>
							</tr>
						</tbody>
					</table>
				`))
			})
			it('should delete the row when delete is pressed', async ({ interfaceBuilder, storageUtils }) => {
				const points = vanX.reactive({'grubby': 420, 'back2Warcraft': 1911})
				const removePointsSpy = vi.spyOn(storageUtils, 'removePoints')
				const table = testUtils.mockVanJSRender(interfaceBuilder.createTable(points))
				const rows = table.querySelectorAll('tbody tr')

				expect(rows).toHaveLength(2)

				rows[0].querySelector('.clear-button')
					.click()

				await testUtils.verifyAsync(async () => {
					expect(vanX.compact(points)).toEqual({ 'back2Warcraft': 1911 })
					expect(removePointsSpy).toHaveBeenCalledWith('grubby')

					const newRows = table.querySelectorAll('tbody tr')
					expect(newRows).toHaveLength(1)
					expect(newRows[0].querySelector('td').textContent).toBe('back2Warcraft')
				})
			})
		})
	})
})