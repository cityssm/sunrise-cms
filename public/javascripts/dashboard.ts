import type { LOS } from '../../types/globalTypes.js'

declare const exports: Record<string, unknown>
;(() => {
  const los = exports.sunrise as LOS

  const workOrderNumberCircleElements: NodeListOf<HTMLElement> =
    document.querySelectorAll('.fa-circle[data-work-order-number]')

  for (const workOrderNumberCircleElement of workOrderNumberCircleElements) {
    workOrderNumberCircleElement.style.color = los.getRandomColor(
      workOrderNumberCircleElement.dataset.workOrderNumber ?? ''
    )
  }
})()
