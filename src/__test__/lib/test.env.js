process.env.NODE_ENV = 'development';
process.env.PORT = 5000;
process.env.MONGODB_URI = 'mongodb://localhost:27017/testing';
process.env.SECRET = 'Hu;asdfiwknlasgfnwkeo002222njaksdfsdoclxo89834ht25585552';
process.env.CORS_ORIGINS = JSON.stringify(['http://localhost:8080']);
process.env.API_URL = 'http://api.rainierathletes.org/api/v1';

require('dotenv').config();
