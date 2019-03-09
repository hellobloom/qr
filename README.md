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
import {renderQRCode, RenderConfig} from '@bloomprotocol/qr'

const container = document.createElement('div')

const config: RenderConfig<string> = {data: 'Hello World'}
const {update, remove} = renderQRCode(container, config)

const newConfig: RenderConfig<string> = {data: 'Updated Data'}
update(newConfig)

remove()
```

### `drawQRCode`

When you want to draw on an existing canvas element.

```typescript
import {drawQRCode, DrawConfig} from '@bloomprotocol/qr'

const canvas = document.createElement('canvas')
const config: DrawConfig<string> = {canvas, data: 'Hello World'}
const {update, remove} = drawQRCode(config)

const newConfig: DrawConfig<string> = {data: 'Updated Data'}
update(newConfig)

remove()
```
