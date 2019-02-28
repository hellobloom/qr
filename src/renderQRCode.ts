import {RenderConfig} from './types'
import {drawQRCode} from './drawQRCode'

const renderQRCode = <T>(container: HTMLElement, config: RenderConfig<T>) => {
  const canvas = document.createElement('canvas')

  drawQRCode({...config, canvas})

  return container.appendChild(canvas)
}

export {renderQRCode}
