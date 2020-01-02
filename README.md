# QR

A Canvas QR Renderer

- [Usage](#usage)
  - [renderQRCode](#render-qr-code)
  - [drawQRCode](#draw-qr-code)

## Installation

```
npm install --save @bloomprotocol/qr
```

## Usage

QR comes with two entry points so you can pick what fits your need best

![Sample QR](https://github.com/hellobloom/qr/raw/master/images/sampleQR.png)

### `renderQRCode`

When you want to render a QR code into an existing DOM node.

```typescript
import {renderQRCode} from '@bloomprotocol/qr'

const container = document.createElement('div')
const {update, remove} = renderQRCode(container, {data: 'Hello World'})

update({data: 'Updated Data'})

remove()
```

### `drawQRCode`

When you want to draw on an existing canvas element.

```typescript
import {drawQRCode} from '@bloomprotocol/qr'

const canvas = document.createElement('canvas')
const {update, remove} = drawQRCode(canvas, {data: 'Hello World'})

update({data: 'Updated Data'})

remove()
```
