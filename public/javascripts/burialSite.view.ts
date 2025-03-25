import type { Sunrise } from './types.js'

declare const exports: {
  sunrise: Sunrise
}
;(() => {
  const mapContainerElement: HTMLElement | null = document.querySelector(
    '#burialSite--cemeterySvg'
  )

  if (mapContainerElement !== null) {
    exports.sunrise.highlightMap(
      mapContainerElement,
      mapContainerElement.dataset.cemeterySvgId ?? '',
      'success'
    )
  }

  document
    .querySelector('#burialSite--contractsToggle')
    ?.addEventListener('click', () => {
      const tableRowElements = document.querySelectorAll(
        '#burialSite--contractsTbody tr[data-is-active="false"]'
      )

      for (const tableRowElement of tableRowElements) {
        tableRowElement.classList.toggle('is-hidden')
      }
    })
})()
