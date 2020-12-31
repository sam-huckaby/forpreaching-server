const express = require('express');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const cors = require('cors');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

// Go load environment variables
require('dotenv').config();

// The database connection setup script (with error handling afterwards)
const db = require('./database');
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// TODO: Determine if I need this #####################################################################
// Configure any Passport.js strategies
// const passport = require('./passport/setup');

// Custom routers to handle various subject types
const illustrationRouter = require('./routes/illustration.route');
const unsecuredRouter = require('./routes/unsecured.route');

// Setup the express server
const app = express();
const apiPort = 3001;


app.use(cors());

// In Production, we operate behind a proxy (and we want real IPs, so we can fight off non-Auth0 access)
app.set('trust proxy', true);

// Bodyparser middleware, extended false does not allow nested payloads
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ======================= Auth0 JWT Route Authorization ===================

let jwtCheck = jwt({
      secret: jwks.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: 'https://for-preaching.us.auth0.com/.well-known/jwks.json'
    }),
    // Native Auth0 clientId
    audience: 'https://for-preaching.com/',
    issuer: 'https://for-preaching.us.auth0.com/',
    algorithms: ['RS256']
});

// This will secure ALL routes. (jwtCheck is middleware, so I have alternately put it on individual routes)
//app.use(jwtCheck);

// ======================= Routes ===================

// A ping route to check service health
app.post('/api/test', jwtCheck, (req, res) => {
    res.send('Server Is Alive!');
});

app.use(express.static(__dirname + '/public'));

app.use('/unsecured', unsecuredRouter);

app.use('/api/illustrations', jwtCheck, illustrationRouter);

// app.use('/api/auth', awuthRouter);
// app.use('/api', jwtCheck, businessRouter);

// ======================= Express Init ===================

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
