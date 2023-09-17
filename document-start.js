const injectScript = () => {
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL('twitch-points-extension.js')
    ;(document.head || document.documentElement).appendChild(script)
}

injectScript()
