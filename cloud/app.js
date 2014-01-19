
// These two lines are required to initialize Express in Cloud Code.
var express = require('express');
var routes = require('cloud/routes.js');
// These lines make it so user sessions can be persisted in the browser using cookies
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var parseExpressCookieSession = require('parse-express-cookie-session');

// initializes express
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(parseExpressHttpsRedirect());  // Require user to be on HTTPS.
app.use(express.bodyParser());
app.use(express.cookieParser('YOUR_SIGNING_SECRET')); // You would use an encoded key for a real site to be secure
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));

// This is an example of hooking up a request handler with a specific request
// path and HTTP verb using the Express routing API.
app.get('/', routes.index);
app.get('/login', routes.showLogin);
app.post('/login', routes.loginOrSignup);
app.get('/logout', routes.logout);
app.post('/snapshot', routes.create);
app.get('/snapshot/:objectId', routes.show);
app.get('/profile/:userId', routes.profile);
app.get('/me', routes.me);
app.get('/appointments', routes.appointments);
// Attach the Express app to Cloud Code.
app.listen();
