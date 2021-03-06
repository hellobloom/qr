import {Config, Options, ErrorCorrectionLevel, Result} from './types'
import {getBloomLogo} from './getBloomLogo'

const QRCodeImpl = require('qr.js/lib/QRCode')

const defaultOptions: Options = {
  hideLogo: false,
  ecLevel: 'L',
  size: 128,
  bgColor: '#fff',
  fgColor: '#6067f1',
  padding: 0,
}

type CellInfo = {
  top: number
  left: number
  size: number
  color: string
}

const drawDot = (ctx: CanvasRenderingContext2D, info: CellInfo) => {
  const centerX = info.left + info.size / 2
  const centerY = info.top + info.size / 2
  const radius = (info.size / 2) * 0.85

  ctx.save()
  ctx.beginPath()

  ctx.fillStyle = info.color

  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
  ctx.fill()

  ctx.closePath()
  ctx.restore()
}

const drawRect = (ctx: CanvasRenderingContext2D, color: string, rect: {x: number; y: number; w: number; h: number}) => {
  ctx.save()
  ctx.beginPath()

  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  ctx.rect(rect.x, rect.y, rect.w, rect.h)
  ctx.fill()
  ctx.stroke()

  ctx.closePath()
  ctx.restore()
}

enum CornerType {
  none,
  topLeft,
  topRight,
  bottomRight,
  bottomLeft,
}

enum EyePart {
  inner,
  outer,
}

const drawCorner = (ctx: CanvasRenderingContext2D, info: CellInfo, type: CornerType, part: EyePart) => {
  const outerRadius = part === EyePart.outer ? info.size : info.size / 4
  const innerRadius = outerRadius / 2

  const {top, left} = info
  const bottom = top + info.size
  const right = left + info.size
  const halfSize = info.size / 2

  ctx.save()
  ctx.beginPath()

  ctx.fillStyle = info.color
  ctx.strokeStyle = info.color
  ctx.lineWidth = 1
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  switch (type) {
    case CornerType.topLeft:
      ctx.moveTo(left, bottom)
      ctx.arcTo(left, top, right, top, outerRadius)
      ctx.lineTo(right, top)
      ctx.lineTo(right, bottom)
      ctx.lineTo(right + halfSize, bottom)
      ctx.arcTo(right, bottom, right, bottom + 5, innerRadius)
      ctx.lineTo(right, bottom + 5)
      ctx.lineTo(right, bottom)
      ctx.lineTo(left, bottom)
      break
    case CornerType.topRight:
      ctx.moveTo(left, bottom)
      ctx.lineTo(left, top)
      ctx.arcTo(right, top, right, bottom, outerRadius)
      ctx.lineTo(right, bottom)
      ctx.lineTo(left, bottom)
      ctx.lineTo(left, bottom + halfSize)
      ctx.arcTo(left, bottom, left - halfSize, bottom, innerRadius)
      ctx.lineTo(left - halfSize, bottom)
      ctx.lineTo(left, bottom)
      break
    case CornerType.bottomRight:
      ctx.moveTo(left, bottom)
      ctx.lineTo(left, top)
      ctx.lineTo(left - halfSize, top)
      ctx.arcTo(left, top, left, top - halfSize, innerRadius)
      ctx.lineTo(left, top - halfSize)
      ctx.lineTo(left, top)
      ctx.lineTo(right, top)
      ctx.arcTo(right, bottom, left, bottom, outerRadius)
      ctx.lineTo(left, bottom)
      break
    case CornerType.bottomLeft:
      ctx.moveTo(left, top)
      ctx.lineTo(right, top)
      ctx.lineTo(right, top - halfSize)
      ctx.arcTo(right, top, right + halfSize, top, innerRadius)
      ctx.lineTo(right + halfSize, top)
      ctx.lineTo(right, top)
      ctx.lineTo(right, bottom)
      ctx.arcTo(left, bottom, left, top, outerRadius)
      ctx.lineTo(left, top)
      break
    default:
      break
  }

  ctx.fill()
  ctx.stroke()

  ctx.closePath()
  ctx.restore()
}

class ConnectionType {
  static readonly none = 0
  static readonly left = 1 << 0
  static readonly right = 1 << 1
  static readonly top = 1 << 2
  static readonly bottom = 1 << 4
}

const drawEyeBit = (ctx: CanvasRenderingContext2D, info: CellInfo, connectionType: number, part: EyePart) => {
  const centerX = info.left + info.size / 2
  const centerY = info.top + info.size / 2
  const halfSize = info.size / 2

  const isLeft = (connectionType & ConnectionType.left) === ConnectionType.left
  const isRight = (connectionType & ConnectionType.right) === ConnectionType.right
  const isTop = (connectionType & ConnectionType.top) === ConnectionType.top
  const isBottom = (connectionType & ConnectionType.bottom) === ConnectionType.bottom

  if (isLeft !== isRight && isTop !== isBottom) {
    let cornerType = CornerType.none

    if (isBottom && isRight) {
      cornerType = CornerType.topRight
    } else if (isBottom && isLeft) {
      cornerType = CornerType.topLeft
    } else if (isTop && isRight) {
      cornerType = CornerType.bottomRight
    } else if (isTop && isLeft) {
      cornerType = CornerType.bottomLeft
    }

    drawCorner(ctx, info, cornerType, part)
  } else {
    if (isLeft) {
      drawRect(ctx, info.color, {x: centerX, y: info.top, w: halfSize, h: info.size})
    }

    if (isRight) {
      drawRect(ctx, info.color, {x: info.left, y: info.top, w: halfSize, h: info.size})
    }

    if (isTop) {
      drawRect(ctx, info.color, {x: info.left, y: info.top, w: info.size, h: halfSize})
    }

    if (isBottom) {
      drawRect(ctx, info.color, {x: info.left, y: centerY, w: info.size, h: halfSize})
    }
  }
}

const draw = <T>(canvas: HTMLCanvasElement, config: Config<T>) => {
  const options = {...defaultOptions, ...config.options}
  const {ecLevel, size, bgColor, fgColor, hideLogo, padding} = options

  const qr = new QRCodeImpl(-1, ErrorCorrectionLevel[ecLevel])
  qr.addData(JSON.stringify(config.data))
  qr.make()

  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const scale = window.devicePixelRatio || 1
  const cells: [boolean[]] = qr.modules
  const cellSize = size / cells.length
  // Add 4 to account for:
  // - The 1 extra on top and left of each cell
  // - The 1 extra from the border on top/left
  canvas.height = canvas.width = size * scale + 4
  canvas.style.height = canvas.style.width = `${size}px`
  canvas.style.padding = `${size * (padding / 100 / 2)}px`
  canvas.style.boxSizing = 'border-box'
  canvas.style.backgroundColor = bgColor
  ctx.scale(scale, scale)

  drawRect(ctx, bgColor, {x: 0, y: 0, w: size, h: size})

  cells.forEach((row: boolean[], rowIndex: number) => {
    row.forEach((cell: boolean, cellIndex: number) => {
      // This is a data bit
      if (cell) {
        const isTopLeftEye = cellIndex <= 7 && rowIndex <= 7
        const isTopRightEye = cellIndex >= cells.length - 7 && rowIndex <= 7
        const isBottomLeftEye = cellIndex <= 7 && rowIndex >= row.length - 7
        const isEye = isTopLeftEye || isTopRightEye || isBottomLeftEye

        // Add an extra 1 to the top/left so the border isn't cut off by the edge of the canvas
        const cellInfo = {
          color: fgColor,
          left: cellIndex * cellSize + 1,
          top: rowIndex * cellSize + 1,
          size: cellSize,
        }

        // Round the edges of eye bits
        if (isEye) {
          let connectionType = ConnectionType.none

          if (rowIndex > 0 && cells[rowIndex - 1][cellIndex]) {
            connectionType = connectionType | ConnectionType.top
          }

          if (rowIndex < cells.length - 1 && cells[rowIndex + 1][cellIndex]) {
            connectionType = connectionType | ConnectionType.bottom
          }

          if (cellIndex > 0 && cells[rowIndex][cellIndex - 1]) {
            connectionType = connectionType | ConnectionType.right
          }

          if (cellIndex < row.length - 1 && cells[rowIndex][cellIndex + 1]) {
            connectionType = connectionType | ConnectionType.left
          }

          const isInnerEyeX = (cellIndex >= 2 && cellIndex <= 4) || (cellIndex >= cells.length - 7 && cellIndex <= cells.length)
          const isInnerEyeY = (rowIndex >= 2 && rowIndex <= 4) || (rowIndex >= cells.length - 5 && rowIndex <= cells.length - 3)
          const isInnerEye = isInnerEyeX && isInnerEyeY

          const eyePart = isInnerEye ? EyePart.inner : EyePart.outer

          drawEyeBit(ctx, cellInfo, connectionType, eyePart)
        } else {
          drawDot(ctx, cellInfo)
        }
      }
    })
  })

  // If hideLogo is true then don't render any logo
  // If logoImage is not set default to BloomLogo with colors matching the rest of the QR code
  // Otherwise display the provided logo
  if (!hideLogo) {
    const {logoWidth, logoHeight, logoOpacity} = options
    const logoImage = options.logoImage || getBloomLogo({fgColor: fgColor, bgColor: bgColor})

    const image = new Image()
    image.onload = () => {
      const numberOfCellsToCover = Math.floor(cells.length * 0.2)
      const addExtra = numberOfCellsToCover % 2 === 0
      const defaultWidth = numberOfCellsToCover * cellSize + (addExtra ? cellSize : 0)
      const dwidth = logoWidth || defaultWidth
      const dheight = logoHeight || dwidth
      // Add 1 to accomodate for the 1 shift of the cells
      const dx = (size - dwidth) / 2 + 1
      const dy = (size - dheight) / 2 + 1
      image.width = dwidth
      image.height = dheight

      ctx.save()
      ctx.globalAlpha = logoOpacity || 1
      ctx.drawImage(image, dx, dy, dwidth, dheight)
      ctx.restore()
    }
    image.src = logoImage
  }
}

export const drawQRCode = <T>(canvas: HTMLCanvasElement, config: Config<T>): Result<T> => {
  draw(canvas, config)

  return {
    update: updateConfig => {
      draw(canvas, updateConfig)
    },
    remove: () => {
      canvas.remove()
    },
  }
}
