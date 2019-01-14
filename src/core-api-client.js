const fetch = require('node-fetch')

const coreUrl = 'https://rvaserver2.appspot.com/_ah/api/core/v1'

function createDisplay (displayName, companyId, authToken) {
  const url = `${coreUrl}/display?companyId=${companyId}`
  const body = {
    data: {
      name: displayName,
      status: 1,
      useCompanyAddress: true,
      restartEnabled: true,
      restartTime: '02:00',
      width: 1920,
      height: 1080,
      monitoringEnabled: true
    }
  }

  return fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
    .then(response => response.json())
    .then(json => {
      if (json.error) {
        return Promise.reject(json)
      }
      console.log(`Display ${json.item.id} created`)
      return createSchedule(json.item.id, displayName, companyId, authToken)
    })
}

function createSchedule (displayId, displayName, companyId, authToken) {
  const url = `${coreUrl}/schedule?companyId=${companyId}`
  const body = {
    data: {
      name: displayName,
      content: [{
        duration: 10,
        type: 'presentation',
        objectReference: '5bd901dc-7d89-4217-9e8a-e5cf915e9b51',
        name: 'Copy of School Foyer News and Weather Version 2',
        timeDefined: false
      }],
      distribution: [displayId],
      distributeToAll: false,
      timeDefined: false
    }
  }
  return fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` } })
    .then(response => response.json())
    .then(json => {
      if (json.error) {
        return Promise.reject(json)
      }
      console.log(`Schedule ${json.item.id} created`)
      return displayId
    })
}

module.exports = {
  createDisplay
}
