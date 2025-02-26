import type { LOS } from './types.js'

declare const exports: Record<string, unknown>
;(() => {
  const mapContainerElement: HTMLElement | null =
    document.querySelector('#burialSite--cemeterySvg')

  if (mapContainerElement !== null) {
    ;(exports.los as LOS).highlightMap(
      mapContainerElement,
      mapContainerElement.dataset.cemeterySvgId ?? '',
      'success'
    )
  }
})()
