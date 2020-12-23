const mongoose = require('mongoose');
// Go load environment variables
require('dotenv').config();

mongoose
    .connect('mongodb://'+process.env.DB_HOST+':'+process.env.DB_PORT+'/illustrations', {
        useNewUrlParser:true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .catch(e => {
        console.error('Connection error', e.message)
    });

const db = mongoose.connection;

db.once('open', function() {
  console.log('Database Connection Established');
});

module.exports = db;