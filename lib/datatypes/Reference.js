const Data = require('../data')

const Reference = Data.extend({
  recordName: { type: String, required: true },
  zoneID: String,
  action: { type: String, enum: ['NONE', 'DELETE_SELF', 'VALIDATE'] }
})

module.exports = Reference
