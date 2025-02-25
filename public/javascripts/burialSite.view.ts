import type { LOS } from '../../types/globalTypes.js'

declare const exports: Record<string, unknown>
;(() => {
  const mapContainerElement: HTMLElement | null =
    document.querySelector('#lot--map')

  if (mapContainerElement !== null) {
    ;(exports.los as LOS).highlightMap(
      mapContainerElement,
      mapContainerElement.dataset.mapKey ?? '',
      'success'
    )
  }
})()
