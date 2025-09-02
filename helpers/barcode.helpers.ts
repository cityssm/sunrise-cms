import { DOMImplementation, XMLSerializer } from '@xmldom/xmldom'
import JsBarcode from 'jsbarcode'

export function generateBarcodeSvg(
  barcodeString: string,
  options: JsBarcode.Options
): string {
  const xmlSerializer = new XMLSerializer()

  const barcodeDocument = new DOMImplementation().createDocument(
    'http://www.w3.org/1999/xhtml',
    'html'
  )
  const svgNode = barcodeDocument.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  )

  JsBarcode(svgNode, barcodeString, {
    ...options,
    xmlDocument: barcodeDocument
  })

  return xmlSerializer.serializeToString(svgNode)
}
