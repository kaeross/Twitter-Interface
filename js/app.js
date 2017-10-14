/*****************************************************
 * Modules
 *****************************************************/
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8000;
//routes module
const mainRoutes = require('../js/routes/index.js');

/*****************************************************
 * Middleware
 *****************************************************/

app.use(bodyParser.urlencoded({'extended': false}));

app.use('/static', express.static('public'));

app.use('/', mainRoutes);

app.set('view engine', 'pug');

/*****************************************************
 * Errors
 *****************************************************/

app.use((req, res, next) => {
	let err = new Error("Page Not Found");
	err.status = 404;
	next(err);
  });
  
  app.use((req, res, next) => {
	let err = new Error("Internal Server Error");
	err.status = 500;
	next(err);
  });
  
  app.use((err, req, res, next) => {
	res.locals.error = err;
	res.status(err.status);
	res.render('error');
  });
  

app.listen(port, () => {
	console.log(`The application is running on ${port}`);
});