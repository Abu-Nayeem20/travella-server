const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f1hps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travella');
        const packageCollection = database.collection('packages');
        const bookingCollection = database.collection('bookings');

        // GET PACKAGE API 
        app.get('/packages', async (req, res) => {
            const cursor = packageCollection.find({});
            const packages = await cursor.toArray();
            res.send(packages);
        });
        // GET BOOKING API 
        app.get('/bookings', async (req, res) => {
            const cursor = bookingCollection.find({});
            const bookings = await cursor.toArray();
            res.send(bookings);
        });
        // GET API FOR A SINGLE PACKAGE
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await packageCollection.findOne(query);
            // console.log("Find a package");
            res.json(package);
        })
        // POST API FOR PACKAGE
        app.post('/packages', async (req, res) => {
            const newPackage = req.body;
            const result = await packageCollection.insertOne(newPackage);
            // console.log("new package added");
            res.json(result);
        });
        // POST API FOR BOOKIGNS
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const newBooking = {...booking, status: "Pending"};
            const result = await bookingCollection.insertOne(newBooking);
            // console.log("new package added");
            res.json(result);
        });
        // DELETE API FOR DELETING BOOKING
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        });
        // UPDATE API
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBooking = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: updatedBooking.status
                }
            };
            const result = await bookingCollection.updateOne(filter, updatedDoc, options);
            res.json(result);
        });
    }
    finally {
        // await client.close();
    }

}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("Travella Server in running");
});

app.listen(port, () => {
    console.log("Travella server port", port);
});