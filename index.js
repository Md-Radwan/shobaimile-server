import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from "cors"
const app = express()
const port = 4000;

app.use(cors())
app.use(express.json())


const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB();

const db = mongoClient.db("shobaimile");
const eventCollection = db.collection("event")


app.post('/create-event', async(req, res) => {
  const data = req.body
  const result = await eventCollection.insertOne(data)

  console.log(result)

  res.send(result)
})

app.get('/upcoming-events', async(req, res)=>{
  const query = {}
  const options = {}

  // ?limit=N → the next N upcoming events (future dates only, soonest
  // first) using MongoDB's .limit(). Used by the home page's
  // "Recent Upcoming Drives" section. Without the param, behaviour is
  // unchanged: every event, in creation order.
  const limit = parseInt(req.query.limit, 10)
  if (Number.isInteger(limit) && limit > 0) {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    // eventDate is a "YYYY-MM-DD" string, so lexicographic compare works.
    query.eventDate = { $gte: today }
    options.sort = { eventDate: 1, _id: -1 }
    options.limit = limit
  }

  const result = await eventCollection.find(query, options).toArray()
  res.send(result)
})

app.get('/upcoming-events/:id', async(req, res)=>{
  const {id} = req.params
  const result = await eventCollection.findOne({_id: new ObjectId(id)})
  res.send(result)
})

app.get('/', (req, res) => {
  res.send({message: "Server is running fine!"})
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`)
})