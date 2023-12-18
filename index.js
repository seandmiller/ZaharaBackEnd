const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const routes = require('./routes/routes');

const app = express();


var corsOptions = {
    origin: ['http://localhost:3000', 'https://mentalhphelp.com', 'https://quiet-lowlands-62573-2c3c77d42eb8.herokuapp.com', '/\.herokuapp\.com$/'],
  


    }


app.use(cors(corsOptions));

app.use(express.json());
app.use('/api', routes);

const PORTLOCAL = 8080;

const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error);
})

database.once('connected', () => {
    console.log('Database Connected');

})


app.listen(
    process.env.PORT || PORTLOCAL,
    console.log(`running host on :${PORTLOCAL}`)
)


