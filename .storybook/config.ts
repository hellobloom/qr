const configure = require('@storybook/html').configure
function loadStories() {
  require('./index')
}
configure(loadStories, module)
