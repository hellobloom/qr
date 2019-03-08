const storiesOf = require('@storybook/html').storiesOf
import {renderQRCode} from '../index'

storiesOf('qr', module).add('Bloom branded https://bloom.co QR', () => {
  const div = document.createElement('div')
  div.style.padding = '25px'
  renderQRCode(div, {
    data: {url: 'https://bloom.co'},
  })
  return div
})
