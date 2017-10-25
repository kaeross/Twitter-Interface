/*****************************************************
 * Modules
 *****************************************************/
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8000;
//routes module
const mainRoutes = require('./js/routes/index.js');

/*****************************************************
 * Middleware
 *****************************************************/

app.use(bodyParser.urlencoded({ 'extended': false }));

app.use('/static', express.static('public'));

app.use(mainRoutes);

app.set('view engine', 'pug');

/*****************************************************
 * Errors
 *****************************************************/

app.use((err,req,res,next)=>{
    next();
});

app.use((req, res, next) => {
	let err = new Error('Page Not Found...');
	err.status = 404;
	res.locals.error = err;
	next(err);
});

app.use((req, res, next) => {
	let err = new Error('Internal Server Error');
	err.status = 500;
	res.locals.error = err;
	next(err);
});

app.use((err, req, res, next) => {
	res.status(err.status);
	res.locals.error = err;
	res.render('error', { error: err });
});


app.listen(port, () => {
	console.log(`The application is running on ${port}`);
});