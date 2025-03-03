import type { Sunrise } from './types.js'

declare const exports: Record<string, unknown>
;(() => {
  const mapContainerElement: HTMLElement | null =
    document.querySelector('#burialSite--cemeterySvg')

  if (mapContainerElement !== null) {
    ;(exports.sunrise as Sunrise).highlightMap(
      mapContainerElement,
      mapContainerElement.dataset.cemeterySvgId ?? '',
      'success'
    )
  }
})()
