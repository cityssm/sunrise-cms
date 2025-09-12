;(() => {
  function toggleFilterBlock(event: Event): void {
    event.preventDefault()

    const target = event.currentTarget as HTMLElement

    target.querySelector('.fa-caret-right')?.classList.toggle('fa-rotate-90')

    const nextElement = target.nextElementSibling as HTMLElement | null

    if (nextElement !== null) {
      nextElement.classList.toggle('is-hidden')
    }
  }

  const filterBlockToggleElements = document.querySelectorAll(
    '.filter-block-toggle'
  )

  for (const filterBlockToggleElement of filterBlockToggleElements) {
    filterBlockToggleElement.addEventListener('click', toggleFilterBlock)
  }
})()
