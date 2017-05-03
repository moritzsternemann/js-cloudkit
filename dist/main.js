'use strict'

const Connection = require('../lib/connection')
const c = new Connection()

module.exports = {
  connection: c,
  model: c.registerModel.bind(c),

  Record: require('../lib/record'),
  Data: {
    Basic: require('../lib/data'),
    Asset: require('../lib/datatypes/Asset'),
    DateTime: require('../lib/datatypes/DateTime'),
    Location: require('../lib/datatypes/Location'),
    Reference: require('../lib/datatypes/Reference')
  }
}
