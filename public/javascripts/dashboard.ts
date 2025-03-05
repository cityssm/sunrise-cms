import type { Sunrise } from './types.js'

declare const exports: Record<string, unknown>
;(() => {
  const sunrise = exports.sunrise as Sunrise

  const workOrderNumberCircleElements: NodeListOf<HTMLElement> =
    document.querySelectorAll('.fa-circle[data-work-order-number]')

  for (const workOrderNumberCircleElement of workOrderNumberCircleElements) {
    workOrderNumberCircleElement.style.color = sunrise.getRandomColor(
      workOrderNumberCircleElement.dataset.workOrderNumber ?? ''
    )
  }
})()
