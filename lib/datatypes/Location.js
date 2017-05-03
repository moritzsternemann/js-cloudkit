const Data = require('../data')

const Location = Data.extend({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  horizontalAccuracy: Number,
  verticalAccuracy: Number,
  altitude: Number,
  speed: Number,
  course: String,
  timestampe: Number
})

module.exports = Location
