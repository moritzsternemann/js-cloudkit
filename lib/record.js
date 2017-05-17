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

      for (var key in response.fields) {
        response[key] = response.fields[key].value
      }
      this.populate(response)
      return this
    },
    async query() {
      const connection = require('../dist/main').connection // TODO:
      const response = await connection.query(this.recordType, {
        // filterBy: [{
        //   comparator: 'EQUALS',
        //   fieldName: 'email',
        //   fieldValue: { value: foobar }
        // }]
      }, {
        // resultsLimit: 1
      })

      const model = connection.getModel(this.recordType)
      const result = []
      for (var r = 0; r < response.length; r++) {
        const res = response[r]
        for (var key in res.fields) {
          const field = res.fields[key]
          res[key] = res.fields[key].value
        }

        result.push(new model(res))
      }

      return result
    }
  }
})

module.exports = Record
