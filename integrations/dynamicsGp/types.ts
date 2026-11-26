export type DynamicsGpDocument = {
  documentType: 'Cash Receipt' | 'Invoice'

  documentDate: Date
  documentNumber: string

  documentDescription: string[]
  documentTotal: number
}
