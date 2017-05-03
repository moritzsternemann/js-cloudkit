const SchemaObject = require('schema-object')

const Record = new SchemaObject({
  recordType: String,
  recordName: String,
  recordChangeTag: String
}, {
  constructors: {

  },
  methods: {
    async save() {
      const connection = require('../dist/main').connection // TODO:
      const fields = this.toObject()
      for (var key in fields) {
        if (key === 'recordType' || key === 'recordName' || key === 'recordChangeTag') {
          delete fields[key]
        }
      }
      const response = await connection.saveRecord(this.recordType, {}, this.recordName, this.recordChangeTag)
      return (response !== undefined)
    },
    async fetch(recordName) {
      const connection = require('../dist/main').connection // TODO:
      const response = await connection.fetchFirstRecord(recordName)
      const result = {}
      for (var key in response.fields) {
        response[key] = response.fields[key].value
      }
      this.populate(response)
      return this
    }
  }
})

module.exports = Record
