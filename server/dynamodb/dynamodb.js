const dotenv = require('dotenv')
const AWS = require('aws-sdk')
const moment = require('moment')
dotenv.config({ path: '../../.env' })
AWS.config.update({
  region: 'eu-west-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })

const addWalkingUser = async (channelId, userId, user) => {
  const thirtyMinutes = moment()
    .add(30, 'minutes')
    .unix()
  let params = {
    TableName: 'WATERCOOLERv1',
    Item: {
      PK: channelId,
      SK: `WALKING#${userId}`,
      ...user,
      expireAt: thirtyMinutes
    }
  }

  try {
    await docClient.put(params).promise()
    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 400,
      error: `Could not fetch: ${error.stack}`
    }
  }
}

const getWalkingUsers = async channelId => {
  const params = {
    TableName: 'WATERCOOLERv1',
    // give nicknames to the partition and sort keys
    ExpressionAttributeNames: {
      '#pk': 'PK',
      '#sk': 'SK'
    },
    // use nicknames and values for nicknames
    KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :sk)',
    // define values for the actual values of the nicknames
    ExpressionAttributeValues: {
      ':pk': channelId,
      ':sk': 'WALKING'
    }
  }
  try {
    const data = await docClient.query(params).promise()
    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not fetch: ${error.stack}`
    }
  }
}
const findInteraction = async (channelId, userId) => {
  // sort params to return the latest item
  const params = {
    TableName: 'WATERCOOLERv1',
    // give nicknames to the partition and sort keys
    ExpressionAttributeNames: {
      '#pk': 'PK',
      '#sk': 'SK'
    },
    // use nicknames and values for nicknames
    KeyConditionExpression: '#pk = :pk AND #sk = :sk',
    // define values for the actual values of the nicknames
    ExpressionAttributeValues: {
      ':pk': channelId,
      ':sk': `USER#${userId}`
    }
  }

  try {
    const data = await docClient.query(params).promise()
    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not fetch: ${error.stack}`
    }
  }
}

const addInteraction = async (idOne, idTwo, userOneId, userTwoId) => {
  let firstUser = {
    TableName: 'WATERCOOLERv1',
    Item: {
      PK: idOne,
      SK: `USER#${userOneId}`,
      linkedUser: { channel: idTwo, user: userTwoId },
      response: false
    }
  }

  let secondUser = {
    TableName: 'WATERCOOLERv1',
    Item: {
      PK: idTwo,
      SK: `USER#${userTwoId}`,
      linkedUser: { channel: idOne, user: userOneId },
      response: false
    }
  }

  try {
    await docClient.put(firstUser).promise()
    await docClient.put(secondUser).promise()
    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) }
  } catch (error) {
    console.log(error)
    return {
      statusCode: 400,
      error: `Could not fetch: ${error.stack}`
    }
  }
}

const updateInteraction = async (channelId, userId, content) => {
  let params = {
    TableName: 'WATERCOOLERv1',
    Item: {
      PK: channelId,
      SK: `USER#${userId}`,
      ...content
    }
  }

  try {
    await docClient.put(params).promise()
    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) }
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not fetch: ${error.stack}`
    }
  }
}

const storeInstall = async (teamId, content) => {
  let params = {
    TableName: 'WATERCOOLERv1',
    Item: {
      PK: teamId,
      SK: `TEAM#${teamId}`,
      ...content
    }
  }

  try {
    await docClient.put(params).promise()
    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) }
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not fetch: ${error.stack}`
    }
  }
}

const fetchInstall = async teamId => {
  const params = {
    TableName: 'WATERCOOLERv1',
    // give nicknames to the partition and sort keys
    ExpressionAttributeNames: {
      '#pk': 'PK',
      '#sk': 'SK'
    },
    // use nicknames and values for nicknames
    KeyConditionExpression: '#pk = :pk AND #sk = :sk',
    // define values for the actual values of the nicknames
    ExpressionAttributeValues: {
      ':pk': teamId,
      ':sk': `TEAM#${teamId}`
    }
  }

  try {
    const data = await docClient.query(params).promise()
    return data.Items[0]
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not fetch: ${error.stack}`
    }
  }
}

const saveState = async (stateId, content) => {
  let params = {
    TableName: 'WATERCOOLERv1',
    Item: {
      PK: stateId,
      SK: `STATE#${stateId}`,
      ...content
    }
  }

  try {
    await docClient.put(params).promise()
    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) }
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not fetch: ${error.stack}`
    }
  }
}

const getState = async stateId => {
  const params = {
    TableName: 'WATERCOOLERv1',
    ExpressionAttributeNames: {
      '#pk': 'PK',
      '#sk': 'SK'
    },
    KeyConditionExpression: '#pk = :pk AND #sk = :sk',
    ExpressionAttributeValues: {
      ':pk': stateId,
      ':sk': `STATE#${stateId}`
    }
  }

  try {
    const data = await docClient.query(params).promise()
    return data.Items[0]
  } catch (error) {
    return {
      statusCode: 400,
      error: `Could not fetch: ${error.stack}`
    }
  }
}

module.exports = {
  addWalkingUser,
  getWalkingUsers,
  findInteraction,
  addInteraction,
  updateInteraction,
  storeInstall,
  fetchInstall,
  saveState,
  getState
}
