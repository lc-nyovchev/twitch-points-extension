import { vi } from 'vitest'
import { EngineUtils } from '../src/utils/twitch-points-extension-utils'

export default {
	namedMock: name => vi.fn().mockName(name),
	mockChrome() {
		return {
			storage: {
				sync: {
					set: this.namedMock('set'),
					get: this.namedMock('get'),
					remove: this.namedMock('remove')
				}
			},
			runtime: {
				sendMessage: this.namedMock('sendMessage')
			},
			action: this.namedMock('action')
		}
	},
	mockEngineUtils() {
		const mockEngineUtils = new EngineUtils(this.mockChrome())
		Object.keys(mockEngineUtils).forEach(key => {
			const value = mockEngineUtils[key]
			if (typeof value === 'function') {
				vi.spyOn(mockEngineUtils, key)
			}
		})
		return mockEngineUtils
	},
	mockVanJSRender(element) {
		Object.defineProperty(element, 'isConnected', { get: () => true, configurable: true })
		for (const child of element.childNodes) {
			this.mockVanJSRender(child)
		}
		return element
	},
	sanitizeHtml(html) {
		return `"${html.replace(/\s+</g, '<').replace(/>\s+/g, '>').trim()}"`
	},
	async verifyAsync(func) {
		await new Promise(resolve => setTimeout(resolve, 0))
		return func()
	}
}