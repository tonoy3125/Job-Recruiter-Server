const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000


// Middleware 
app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3il8g6r.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // Collections
        const jobCollection = client.db("jobDB").collection("job")

        // Get jobs By id
        app.get('/jobs/:id', async (req, res) => {
            try {
                const id = req.params.id
                const query = { _id: new ObjectId(id) }
                const cursor = jobCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            } catch (error) {
                // Handle the error
                console.error(error)
            }
        })

        // Get jobs by category_name
        app.get('/job/:category_name', async (req, res) => {
            try {
                const categoryName = req.params.category_name
                const query = { category_name: categoryName }
                const cursor = jobCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            } catch (error) {
                // Handle the error
                console.error(error)
            }
        })



        // Add a Job Get Method*
        app.get('/job', async (req, res) => {
            try {
                const cursor = jobCollection.find()
                const result = await cursor.toArray()
                res.send(result)
            } catch (error) {
                // Handle the error
                console.error(error)
            }
        })


        app.get('/postedjob/:email', async (req, res) => {
            try {
                const find = req.params.email;
                console.log(find);
                const query = { email: find };
                const cursor = jobCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
            }
        });


        // Add a Job Post Method*
        app.post('/job', async (req, res) => {
            try {
                const newJob = req.body;
                console.log('added this job', newJob);
                const result = await jobCollection.insertOne(newJob);
                res.send(result);
            } catch (error) {
                // Handle the error
                console.error('Error adding job:', error);
            }
        });




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




// Basic Server Run
app.get('/', (req, res) => {
    res.send('job recruiter website server is running');
})

app.listen(port, () => {
    console.log(`job recruiter website server running on port : ${port}`)
})