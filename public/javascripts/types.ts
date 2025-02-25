export interface LOS {
  urlPrefix: string
  apiKey: string

  highlightMap: (
    mapContainerElement: HTMLElement,
    mapKey: string,
    contextualClass: 'success' | 'danger'
  ) => void

  initializeDatePickers: (containerElement: HTMLElement) => void
  // initializeTimePickers: (containerElement: HTMLElement) => void;

  initializeUnlockFieldButtons: (containerElement: HTMLElement) => void

  populateAliases: (containerElement: HTMLElement) => void

  escapedAliases: {
    ExternalReceiptNumber: string
    externalReceiptNumber: string
    contractStartDate: string
    contractStartDate: string
    WorkOrderOpenDate: string
    workOrderOpenDate: string
    WorkOrderCloseDate: string
    workOrderCloseDate: string
  }

  dynamicsGPIntegrationIsEnabled: boolean

  getRandomColor: (seedString: string) => string

  setUnsavedChanges: () => void
  clearUnsavedChanges: () => void
  hasUnsavedChanges: () => boolean

  getMoveUpDownButtonFieldHTML: (
    upButtonClassNames: string,
    downButtonClassNames: string,
    isSmall?: boolean
  ) => string
  getLoadingParagraphHTML: (captionText?: string) => string
  getSearchResultsPagerHTML: (
    limit: number,
    offset: number,
    count: number
  ) => string

  getMapURL: (cemeteryId?: number | string, edit?: boolean, time?: boolean) => string
  getLotURL: (lotId?: number | string, edit?: boolean, time?: boolean) => string
  getBurialSiteContractURL: (
    burialSiteContractId?: number | string,
    edit?: boolean,
    time?: boolean
  ) => string
  getWorkOrderURL: (
    workOrderId?: number | string,
    edit?: boolean,
    time?: boolean
  ) => string
}
