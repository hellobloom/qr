import {Config, Result} from './types'
import {drawQRCode} from './drawQRCode'

export const renderQRCode = <T>(container: HTMLElement, config: Config<T>): Result<T> => {
  const canvas = document.createElement('canvas')
  container.append(canvas)

  return drawQRCode(canvas, config)
}
