require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');

const sauceRoutes = require("./routes/sauces");
const userRoutes = require('./routes/user');
const path = require('path');

const app = express();

mongoose.connect(`mongodb+srv://${process.env.Mongo_USER}:${process.env.Mongo_PASS}@cluster0.mp4h3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
  
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes)
app.use('/api/auth', userRoutes);

module.exports = app;
