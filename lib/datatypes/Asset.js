const Data = require('../data')

const Asset = Data.extend({
  fileChecksum: { type: String, required: true },
  size: { type: Number, required: true },
  referenceChecksum: { type: String, required: true },
  wrappingKey: { type: String },
  receipt: { type: String },
  downloadURL: { type: String }
})

module.exports = Asset
