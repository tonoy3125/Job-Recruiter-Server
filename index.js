const express = require('express')
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')


const app = express()
const port = process.env.PORT || 5000


// Middleware 
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://job-recruiter-assignment.web.app'
    ],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())


// middlewares
const logger = (req, res, next) => {
    console.log('log info', req.method, req.url)
    next()
}

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token
    // console.log('token in the middleware', token)
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.user = decoded
        next()
    })

}





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3il8g6r.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const dbConnect = async () => {
    try {
        client.connect()
        console.log('DB Connected Successfully✅')
    } catch (error) {
        console.log(error.name, error.message)
    }
}
dbConnect()









// Collections
const jobCollection = client.db("jobDB").collection("job")
const bidCollection = client.db("jobDB").collection("bid")

app.get('/', (req, res) => {
    res.send('job recruiter website server is running');
})


// Auth Related Api

app.post('/jwt', async (req, res) => {
    const user = req.body
    console.log(user)
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    res
        .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
})

app.post('/logout', async (req, res) => {
    const user = req.body
    console.log('user hitten', user)
    res
        .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
})








// Get Bid By Buyer Email
app.get('/bidjob/bid/:buyeremail', async (req, res) => {
    try {
        const find = req.params.buyeremail;
        console.log(find);
        const query = { buyeremail: find };
        const cursor = bidCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// Get Bid By User email

app.get('/bid/:useremail', async (req, res) => {
    try {
        const find = req.params.useremail;
        console.log(find);
        const query = { useremail: find };
        const sortBaseOnStatus = { status: 1 };
        const cursor = bidCollection.find(query).sort(sortBaseOnStatus);
        const result = await cursor.toArray();
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});


// Bid Get method

app.get('/bid', async (req, res) => {
    try {
        const cursor = bidCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    } catch (error) {
        console.error(error)
    }
})

// Get a bid by Id
app.get('/reqbid/bid/:id', async (req, res) => {
    try {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const cursor = bidCollection.find(query)
        const result = await cursor.toArray()
        res.send(result)
    } catch (error) {
        // Handle the error
        console.error(error)
    }
})


// Patch a bid by id
app.patch('/reqbid/bid/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const updatedbid = req.body
    console.log(updatedbid)
    const updatedoc = {
        $set: {
            status: updatedbid.status
        }
    }
    const result = await bidCollection.updateOne(query, updatedoc)
    res.send(result)
})


// Post Method

app.post('/bid', async (req, res) => {
    try {
        const newBid = req.body;
        console.log('Added this bid', newBid);
        const result = await bidCollection.insertOne(newBid);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

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

// Get Job by email
app.get('/postedjob/:email', async (req, res) => {
    try {
        const find = req.params.email;
        console.log('token owner info', req.user)
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

// Get a job for update
app.get('/jobupdate/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await jobCollection.findOne(query)
        res.send(result)
    } catch (error) {
        // Handle the error
        console.error(error);
    }
})



// Put a job for update
app.put('/jobs/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const options = { upsert: true };
        const updatedJob = req.body
        const jobs = {
            $set: {
                name: updatedJob.name,
                category_name: updatedJob.category_name,
                email: updatedJob.email,
                deadline: updatedJob.deadline,
                minimum_price: updatedJob.minimum_price,
                maximum_price: updatedJob.maximum_price,
                description: updatedJob.description
            }
        }
        const result = await jobCollection.updateOne(filter, jobs, options)
        res.send(result)
    } catch (error) {
        // Handle the error
        console.error(error);
    }
})

// Delete a job
app.delete('/jobs/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await jobCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});









// Basic Server Run


app.listen(port, () => {
    console.log(`job recruiter website server running on port : ${port}`)
})