import {RenderConfig} from './types'
import {drawQRCode} from './drawQRCode'
import {generateId} from './shared'

const renderQRCode = <T>(container: HTMLElement, config: RenderConfig<T>) => {
  const id = generateId()
  const canvas = document.createElement('canvas')
  canvas.id = id

  drawQRCode({...config, canvas})

  container.append(canvas)

  return {
    update: updateQRCode<T>(id, container),
    remove: removeQRCode(id, container),
  }
}

const updateQRCode = <T>(id: string, container: HTMLElement) => <T>(config: RenderConfig<T>) => {
  const canvas = container.querySelector<HTMLCanvasElement>(`#${id}`)

  if (!canvas) return

  drawQRCode({...config, canvas})
}

const removeQRCode = (id: string, container: HTMLElement) => () => {
  const canvas = container.querySelector(`#${id}`)

  if (canvas) canvas.remove()
}

export {renderQRCode}
