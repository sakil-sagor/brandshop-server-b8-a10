const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


require('dotenv').config()
app.use(express.json())

const port = process.env.PORT || 5000
// middleware
var cors = require('cors')
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9clk0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const database = client.db("Lotus-Park");
        const productsCollection = database.collection("products");
        const brandsCollection = database.collection("brands");


        // get products 
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find();
            const result = await cursor.toArray();
            res.json(result);
        })
        // get brands 
        app.get('/brands', async (req, res) => {
            const cursor = brandsCollection.find();
            const result = await cursor.toArray();
            res.json(result);
        })


        // add single product 
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product)
            res.json(result);
        })

        // add single product 
        app.post('/brands', async (req, res) => {
            const product = req.body;
            const result = await brandsCollection.insertOne(product)
            res.json(result);
        })



    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Node Server')
})

app.listen(port, () => {
    console.log(`Running Node Server at http://localhost:${port}`)
})
