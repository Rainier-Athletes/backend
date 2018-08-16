process.env.NODE_ENV = 'development';
process.env.PORT = 5000;
process.env.MONGODB_URI = 'mongodb://localhost:27017/testing';
// process.env.MONGODB_URI = 'mongodb://heroku_p6pfh9p0:89kmebh54m2286ddj8ehausb8h@ds121332.mlab.com:21332/heroku_p6pfh9p0';
// this string can be any random mumbo jumbo you want
process.env.SECRET = 'Hu;asdfiwknlasgfnwkeo002222njaksdfsdoclxo89834ht25585552';
process.env.CORS_ORIGINS = JSON.stringify(['http://localhost:8080']);
process.env.API_URL = 'http://api.rainierathletes.org/api/v1';
// remember to set your .env vars and add .env in .gitignore
require('dotenv').config();
