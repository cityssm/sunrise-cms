import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

  /*
   * LOGOUT MODAL
   */
;(() => {
  function doLogout(): void {
    const urlPrefix =
      document.querySelector('main')?.getAttribute('data-url-prefix') ?? ''

    globalThis.localStorage.clear()
    globalThis.location.href = `${urlPrefix}/logout`
  }

  document
    .querySelector('#cityssm-theme--logout-button')
    ?.addEventListener('click', (clickEvent) => {
      clickEvent.preventDefault()

      bulmaJS.confirm({
        contextualColorName: 'warning',
        title: 'Log Out?',

        message: 'Are you sure you want to log out?',

        okButton: {
          callbackFunction: doLogout,
          text: 'Log Out'
        }
      })
    })
})()

/*
 * KEEP ALIVE
 */
;(() => {
  const urlPrefix =
    document.querySelector('main')?.getAttribute('data-url-prefix') ?? ''

  const keepAliveMillis = document
    .querySelector('main')
    ?.getAttribute('data-session-keep-alive-millis')

  function doKeepAlive(): void {
    cityssm.postJSON(
      `${urlPrefix}/keepAlive`,
      {
        t: Date.now()
      },
      () => {
        // Do nothing
      }
    )
  }

  if (
    keepAliveMillis !== null &&
    keepAliveMillis !== undefined &&
    keepAliveMillis !== '0'
  ) {
    globalThis.setInterval(doKeepAlive, Number.parseInt(keepAliveMillis, 10))
  }
})()
