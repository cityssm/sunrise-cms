{
  const panelBlockToggleElements = document.querySelectorAll(
    '.is-panel-block-toggle'
  )

  panelBlockToggleElements.forEach((element) => {
    element.addEventListener('click', () => {
      const panelBlock = element.nextElementSibling

      if (panelBlock === null) {
        return
      }

      element.querySelector('.fa-caret-right')?.classList.toggle('fa-rotate-90')

      panelBlock.classList.toggle('is-hidden')
    })
  })
}
