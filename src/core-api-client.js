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
      return json.item.id
    })
}

module.exports = {
  createDisplay
}
