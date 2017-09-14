const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const router = express.Router();
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({'extended': false}));
app.use(cookieParser());
app.use('/static', express.static('public'));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
	const username = '@kateross01';
	res.render('index',  { username }  );
})

// app.use((req, res, next) => {
// 	const err = new Error('Not Found');

// 	err.status = 404;
// 	next(err);
// });

// app.use((err, req, res) => {
// 	res.locals.error = err;
// 	res.status(err.status);
// 	res.render('error');
// });

app.listen(port, () => {
	console.log(`The application is running on ${port}`);
});