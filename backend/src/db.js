import fs from 'node:fs'
import path from 'node:path'
import { MongoClient } from 'mongodb'
import { config } from './config.js'

const file = path.join(config.dataDir, 'db.json')
const collectionName = 'app_state'
const stateId = 'adji_cash'
const empty = { users: [], transactions: [], messages: [], subscribers: [], resets: [] }
let cache
let client
let collection
let writeQueue = Promise.resolve()

function readLocalState() {
  fs.mkdirSync(config.dataDir, { recursive: true })
  if (!fs.existsSync(file)) return structuredClone(empty)
  return { ...empty, ...JSON.parse(fs.readFileSync(file, 'utf8')) }
}

export async function connectDatabase() {
  if (config.mongodbUri) {
    client = new MongoClient(config.mongodbUri)
    await client.connect()
    collection = client.db(config.databaseName).collection(collectionName)

    const document = await collection.findOne({ _id: stateId })
    if (document) {
      const { _id, ...state } = document
      cache = { ...empty, ...state }
    } else {
      cache = readLocalState()
      await collection.insertOne({ _id: stateId, ...cache })
    }
    console.log(`Connected to MongoDB database "${config.databaseName}".`)
    return
  }

  cache = readLocalState()
  console.warn('MONGODB_URI is not set; using the local JSON database.')
}

export function db() {
  if (!cache) throw new Error('Database has not been initialized.')
  return cache
}

export function save() {
  const snapshot = structuredClone(db())
  const write = writeQueue.catch(() => {}).then(async () => {
    if (collection) {
      await collection.replaceOne({ _id: stateId }, { _id: stateId, ...snapshot }, { upsert: true })
      return
    }

    fs.mkdirSync(config.dataDir, { recursive: true })
    const tmp = file + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(snapshot, null, 2))
    fs.renameSync(tmp, file)
  })
  writeQueue = write
  return write
}

export async function closeDatabase() {
  await writeQueue
  if (client) await client.close()
}

export const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
