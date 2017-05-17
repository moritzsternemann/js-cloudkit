class Connection {
  constructor(config) {
    this.user = {}

    this.models = {}
  }

  async init(config) {
    if (!window || !document) {
      throw new Error('can not add CloudKit include to <head>')
      return
    }

    // handle config
    config = config || {}
    if (!config.containerIdentifier) {
      throw new Error('containerIdentifier missing')
      return
    }
    if (!config.apiToken) {
      throw new Error('apiToken missing')
      return
    }
    if (!config.environment) {
      throw new Error('environment missing')
      return
    }
    this.config = config

    // add CloudKit to <head>
    const script = document.createElement('script')
    script.src = 'https://cdn.apple-cloudkit.com/ck/2/cloudkit.js'
    script.async = true
    document.getElementsByTagName('head')[0].appendChild(script)

    // wait for CloudKit init
    return new Promise(resolve => {
      window.addEventListener('cloudkitloaded', async () => {
        await this._configure()
        resolve()
      })
    })
  }

  async _configure() {
    if (!window.CloudKit) {
      throw new Error('CloudKit could not be initialized properly')
      return
    }

    this.ck = window.CloudKit

    this.ck.configure({
      containers: [{
        containerIdentifier: this.config.containerIdentifier,
        apiTokenAuth: {
          apiToken: this.config.apiToken,
          persist: true
        },
        environment: this.config.environment
      }]
    })

    this.defaultContaier = this.ck.getDefaultContainer()
    this.publicDatabase = this.defaultContaier.getDatabaseWithDatabaseScope(
      this.ck.DatabaseScope['PUBLIC']
    )

    // setup auth
    return new Promise(async (resolve, reject) => {
      this.defaultContaier.setUpAuth()
        .then(async userIdentity => {
          // try {
          if (userIdentity) {
            await this._gotoAuthenticatedState(userIdentity)
          } else {
            await this._gotoUnauthenticatedState()
          }
          resolve()
          // } catch (error) {
          //   this._handle
          // }
        })
    })
  }

  async _gotoAuthenticatedState(userIdentity) {
    console.log('gotoAuthenticatedState')
    this.user = userIdentity
    this.user.isAuthenticated = true

    this.defaultContaier
      .whenUserSignsOut()
      .then(this._gotoUnauthenticatedState.bind(this))
  }

  async _gotoUnauthenticatedState(error) {
    console.log('gotoUnauthenticatedState')
    if (error) {
      throw error
      return
    }

    this.user = {}

    this.defaultContaier
      .whenUserSignsIn()
      .then(this._gotoAuthenticatedState.bind(this))
      .catch(this._gotoUnauthenticatedState.bind(this))
  }

  /** Fetch a record **/
  async fetchFirstRecord(recordName) {
    let response = await this._promisify(
      this.publicDatabase.fetchRecords(recordName)
    )

    if (!response.records[0]) {
      throw new Error('Empty response when fetching record: ' + recordName)
      return
    }

    return response.records[0]
  }

  /** query the database **/
  async query(recordType, query, options) {
    query.recordType = recordType

    let response = await this._promisify(
      this.publicDatabase.performQuery(query, options)
    )

    if (!response.records) {
      throw new Error('No results for query')
      return
    }

    return response.records
  }

  async saveRecord(recordType, fields, recordName, recordChangeTag) {
    const response = await this._saveRecord('PUBLIC', recordName, recordChangeTag, recordType, null, null, null, null, null, null, null, fields, null)
    if (!response.records[0]) {
      throw new Error('Emptry response when saving record: ' + recordName)
      return
    }

    return response.records[0]
  }

  /** Create or update a record **/
  _saveRecord(databaseScope, recordName, recordChangeTag, recordType, zoneName, forRecordName, forRecordChangeTag, publicPermission, ownerRecordName, participants, parentRecordName, fields, createShortGUID) {
    const options = {}

    // IF no zoneName is provided the record will be saved to the default zone.
    if (zoneName) {
      options.zoneID = { zoneName }
      if (ownerRecordName) {
        options.zoneID.ownerRecordName = ownerRecordName
      }
    }

    const record = {
      recordType
    }

    // If no recordName is supplied the server will generate one.
    if (recordName) {
      record.recordName = recordName
    }

    // To modify an existing record, supply a recordChangeTag.
    if (recordChangeTag) {
      record.recordChangeTag = recordChangeTag
    }

    // Convert the fields to the appropriate format
    record.fields = Object.keys(fields).reduce((obj, key) => {
      obj[key] = { value: fields[key] }
      return obj
    }, {})

    // If we are going to want to share the record we need to request a stable short GUID.
    if (createShortGUID) {
      record.createShortGUID = true
    }

    // If we want to share the record via a parent reference we need to set the record's parent property.
    if (parentRecordName) {
      record.parent = { recordName: parentRecordName }
    }

    if (publicPermission) {
      record.publicPermission = this.
      this.CloudKit.ShareParticipantPermission[publicPermission]
    }

    // If we are creating a share record, we must specify the record which we are sharing.
    if (forRecordName && forRecordChangeTag) {
      record.forRecord = {
        recordName: forRecordName,
        recordChangeTag: forRecordChangeTag
      }
    }

    if (participants) {
      record.participants = participants.map(function (participant) {
        return {
          userIdentity: {
            lookupInfo: { emailAddress: participant.emailAddress }
          },
          permission: this.CloudKit.ShareParticipantPermission[participant.permission],
          type: participant.type,
          acceptanceStatus: participant.acceptanceStatus
        }
      })
    }

    return this._promisify(
      this.publicDatabase.saveRecords(record, options)
    )
  }


  /** Promise handling **/
  _promisify(ckPromise) {
    return new Promise((resolve, reject) => {
      ckPromise.then((response) => {
        if (response.hasErrors) {
          return reject(response.errors)
        }

        resolve(response)
      })
    })
  }

  /** Model handling **/
  registerModel(name, schema) {
    const model = schema.extend({
      recordType: { type: String, default: name, readOnly: true }
    })

    this.models[name] = model

    return model
  }

  getModel(name) {
    if (!this.models[name]) {
      return require('./record')
    }

    return this.models[name]
  }
}

module.exports = Connection
