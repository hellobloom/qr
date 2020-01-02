import React, {useRef, useEffect, useState} from 'react'
import {storiesOf} from '@storybook/react'

import {renderQRCode, drawQRCode, Result, Options} from '../src/index'

const RenderComp: React.FC<{data: {url: string}; options?: Partial<Options>}> = props => {
  const container = useRef<HTMLDivElement>(null)
  const requestElementResult = useRef<Result<{url: string}> | undefined>(undefined)

  const {data, options} = props

  useEffect(() => {
    if (!container.current) return

    if (requestElementResult.current) {
      requestElementResult.current.update({
        data,
        options,
      })
    } else {
      requestElementResult.current = renderQRCode(container.current, {
        data,
        options,
      })
    }

    return () => {
      requestElementResult.current?.remove()
      requestElementResult.current = undefined
    }
  }, [container, data, options])

  return <div ref={container} />
}

const RenderUpdating: React.FC<{data: {url: string}; options?: Partial<Options>}> = props => {
  const [count, setCount] = useState(0)

  return (
    <React.Fragment>
      <RenderComp
        data={{
          url: `${props.data.url}?count=${count}`,
        }}
      />
      <button onClick={() => setCount(count + 1)}>Update QR Code</button>
    </React.Fragment>
  )
}

storiesOf('qr/renderQRCode', module)
  .add('Basic', () => <RenderComp data={{url: 'https://bloom.co'}} />)
  .add('Colors', () => (
    <RenderComp
      data={{url: 'https://bloom.co'}}
      options={{
        bgColor: '#EBF0F1',
        fgColor: '#3C3C3D',
      }}
    />
  ))
  .add('Updating', () => <RenderUpdating data={{url: 'https://bloom.co'}} />)
  .add('Size', () => <RenderComp data={{url: 'https://bloom.co'}} options={{size: 256}} />)
  .add('Padding', () => (
    <RenderComp
      data={{url: 'https://bloom.co'}}
      options={{
        padding: 10,
        bgColor: '#EBF0F1',
        fgColor: '#3C3C3D',
      }}
    />
  ))

const DrawComp: React.FC<{data: {url: string}; options?: Partial<Options>}> = props => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const requestElementResult = useRef<Result<{url: string}> | undefined>(undefined)

  const {data, options} = props

  useEffect(() => {
    if (!canvas.current) return

    if (requestElementResult.current) {
      requestElementResult.current.update({
        data,
        options,
      })
    } else {
      requestElementResult.current = drawQRCode(canvas.current, {
        data,
        options,
      })
    }
  }, [canvas, data, options])

  return <canvas ref={canvas} />
}

const DrawUpdating: React.FC<{data: {url: string}; options?: Partial<Options>}> = props => {
  const [count, setCount] = useState(0)

  return (
    <React.Fragment>
      <DrawComp
        data={{
          url: `${props.data.url}?count=${count}`,
        }}
      />
      <button onClick={() => setCount(count + 1)}>Update QR Code</button>
    </React.Fragment>
  )
}

storiesOf('qr/drawQRCode', module)
  .add('Basic', () => <DrawComp data={{url: 'https://bloom.co'}} />)
  .add('Colors', () => (
    <DrawComp
      data={{url: 'https://bloom.co'}}
      options={{
        bgColor: '#EBF0F1',
        fgColor: '#3C3C3D',
      }}
    />
  ))
  .add('Updating', () => <DrawUpdating data={{url: 'https://bloom.co'}} />)
  .add('Size', () => <DrawComp data={{url: 'https://bloom.co'}} options={{size: 256}} />)
  .add('Padding', () => (
    <DrawComp
      data={{url: 'https://bloom.co'}}
      options={{
        padding: 10,
        bgColor: '#EBF0F1',
        fgColor: '#3C3C3D',
      }}
    />
  ))
