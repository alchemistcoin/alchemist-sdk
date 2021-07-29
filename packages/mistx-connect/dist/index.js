
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./mistx-connect.cjs.production.min.js')
} else {
  module.exports = require('./mistx-connect.cjs.development.js')
}
