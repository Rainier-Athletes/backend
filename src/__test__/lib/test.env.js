process.env.NODE_ENV = 'development';
process.env.PORT = 5000;
process.env.MONGODB_URI = 'mongodb://localhost:27017/testing';

// this string can be any random mumbo jumbo you want
process.env.SECRET = 'Hu;asdfiwknlasgfnwkeo002222njaksdfsdoclxo89834ht25585552';
process.env.CORS_ORIGINS = JSON.stringify(['http://localhost:8080']);
process.env.API_URL = 'http://localhost:3000/api/v1';
// remember to set your .env vars and add .env in .gitignore
require('dotenv').config();
