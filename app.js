const express = require('express');
const dotenv = require('dotenv');
const app = express();

const cors=require('cors');

dotenv.config({ path: './config.env' })

//database connection
require('./db/conn');
// const Member=require('./model/memberSchema');

app.use(express.json());

app.use(cors({
    origin:'*',
    methods: ["GET", "POST", "PUT", "DELETE"]
}))

//linking router files
app.use(require('./router/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
