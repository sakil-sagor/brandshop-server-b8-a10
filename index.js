const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


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
        const addToCartCollection = database.collection("addToCart");


        // get products 
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find();
            const result = await cursor.toArray();
            res.json(result);
        })
        // app.get('/products/:id', async (req, res) => {
        //     const id = req.params._id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await productsCollection.findOne(query);
        //     res.json(result)
        // })

        // get brands 
        app.get('/brands', async (req, res) => {
            const cursor = brandsCollection.find();
            const result = await cursor.toArray();
            res.json(result);
        })
        // get brands 
        app.get('/brands/:_id', async (req, res) => {
            const id = req.params._id;
            const query = { _id: new ObjectId(id) }
            const brdName = await brandsCollection.findOne(query);
            console.log(brdName.brandName)
            let productQuery = {};
            productQuery = { brandName: brdName.brandName }
            const cursor = productsCollection.find(productQuery);
            const result = await cursor.toArray();

            res.json(result)
        })
        // get all add to cart
        app.get('/addToCart', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = addToCartCollection.find(query);
            const addToCart = await cursor.toArray();
            let addToCartProducts = [];
            for (let product of addToCart) {
                const query = { _id: new ObjectId(product?.id) }
                let cursor = await productsCollection.findOne(query)
                addToCartProducts.push(cursor)
            }
            res.send(addToCartProducts);
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
        // add to cart
        app.post('/addToCart', async (req, res) => {
            const addToCart = req.body;
            const productId = addToCart.id
            const email = addToCart.email;
            const query = { id: productId, email: email }
            const result = await addToCartCollection.findOne(query)
            if (!result) {
                const result = await addToCartCollection.insertOne(addToCart)
                res.json(result);
            } else {
                res.json(0);
            }
        })

        // update products 
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const product = req.body;
            // const filter = { id: product._id };
            console.log(product)
            const options = { upsert: true }

            // const coffee = {
            //     $set: {
            //         name: updatedCoffee.name,
            //         quantity: updatedCoffee.quantity,
            //         supplier: updatedCoffee.supplier,
            //         taste: updatedCoffee.taste,
            //         category: updatedCoffee.category,
            //         details: updatedCoffee.details,
            //         photo: updatedCoffee.photo
            //     }
            // }

            const updateDoc = {
                $set: {
                    productName: product.productName,
                    brandName: product.brandName,
                    type: product.type,
                    price: product.price,
                    rating: product.rating,
                    description: product.description,
                    image: product.image,

                }
            };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            console.log(result)
            res.json(result);
        })



        // single add to cart delete 
        app.delete('/addToCart', async (req, res) => {
            const addToCart = req.query;
            console.log(addToCart)
            const productId = addToCart.id
            const email = addToCart.email;
            const query = { id: productId, email: email }
            // const query = { _id: new ObjectId(id) }
            const result = await addToCartCollection.deleteOne(query);
            // console.log(result);
            res.json(result)
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
