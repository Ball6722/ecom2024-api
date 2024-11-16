// step import .....

const express = require("express");
const morgan = require("morgan");
const app = express();
const { readdirSync }  = require('fs')
const cors = require('cors')

// middleware
app.use(morgan("dev"));
app.use(express.json({ limit: '20mb' }));
app.use(cors())
 

// step 3 router
readdirSync('./routes').map((c)=>app.use('/api',require('./routes/'+c)))


// step 2 start server
app.listen(5000, () => console.log("Server is running on port 5000"));
