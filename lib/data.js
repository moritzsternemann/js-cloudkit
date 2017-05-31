const SchemaObject = require('schema-object')

const Data = new SchemaObject({
}, {
  methods: {
    serialize () {
      // console.log('serialize data')
    }
  }
})

module.exports = Data
