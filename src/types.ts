enum ErrorCorrectionLevel {
  'L' = 1,
  'M' = 0,
  'Q' = 3,
  'H' = 2,
}

type Options = {
  ecLevel: keyof typeof ErrorCorrectionLevel
  size: number
  bgColor: string
  fgColor: string
  hideLogo: boolean
  padding: number
  logoImage?: string
  logoWidth?: number
  logoHeight?: number
  logoOpacity?: number
}

type BaseConfig<T> = {
  data: T
  options?: Partial<Options>
}

type DrawConfig<T> = BaseConfig<T> & {
  canvas: HTMLCanvasElement
}

type RenderConfig<T> = BaseConfig<T>

type RenderResult<T> = {
  update: (config: RenderConfig<T>) => void
  remove: () => void
}

type DrawResult<T> = {
  update: (config: DrawConfig<T>) => void
  remove: () => void
}

export {ErrorCorrectionLevel, Options, DrawConfig, RenderConfig, DrawResult, RenderResult}
