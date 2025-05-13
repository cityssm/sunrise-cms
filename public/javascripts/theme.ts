import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

declare const cityssm: cityssmGlobal
declare const bulmaJS: BulmaJS

  /*
   * LOGOUT MODAL
   */
;(() => {
  function doLogout(): void {
    const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''

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

  const keepAliveMillis =
    document.querySelector('main')?.dataset.sessionKeepAliveMillis

  let keepAliveInterval: NodeJS.Timeout | undefined

  function doKeepAlive(): void {
    cityssm.postJSON(
      `${urlPrefix}/keepAlive`,
      {
        t: Date.now()
      },
      (rawResponseJson: unknown) => {
        const responseJson = rawResponseJson as {
          activeSession: boolean
        }

        if (!responseJson.activeSession) {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Session Expired',

            message: 'Your session has expired. Please log in again.',

            okButton: {
              callbackFunction: () => {
                globalThis.location.reload()
              },
              text: 'Refresh Page'
            }
          })

          globalThis.clearInterval(keepAliveInterval)
        }
      }
    )
  }

  if (keepAliveMillis !== undefined && keepAliveMillis !== '0') {
    keepAliveInterval = globalThis.setInterval(
      doKeepAlive,
      Number.parseInt(keepAliveMillis, 10)
    )
  }
})()
