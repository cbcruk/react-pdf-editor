export type ReactPdfStyle = Record<string, string | number>

export type IrComponent = 'View' | 'Text' | 'Image'

export interface IrTextNode {
  type: 'text'
  value: string
}

export interface IrElementNode {
  type: 'element'
  component: IrComponent
  style: ReactPdfStyle
  children: IrNode[]
  src?: string
}

export type IrNode = IrTextNode | IrElementNode

export interface MigrateOptions {
  componentName?: string
}

export interface RequiredFont {
  family: string
  weights: number[]
}

export type MigrateMode = 'reconstruct' | 'faithful'

export interface CapturedRect {
  x: number
  y: number
  width: number
  height: number
}

export interface CapturedElement {
  type: 'element'
  tag: string
  style: Record<string, string>
  rect: CapturedRect
  children: CapturedNode[]
  src?: string
}

export interface CapturedTextNode {
  type: 'text'
  value: string
}

export type CapturedNode = CapturedElement | CapturedTextNode

export interface CaptureSource {
  html?: string
  url?: string
}

export interface CaptureOptions {
  media?: 'screen' | 'print'
}

export interface BrowserMigrateOptions extends MigrateOptions {
  mode?: MigrateMode
  media?: 'screen' | 'print'
}
