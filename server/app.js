const path = require('path');
const express = require('express');
const db = require('./db');
const { Product, Order, LineItem, User } = db.models;
const jwt = require('jwt-simple');
const ejs = require('ejs');


const app = express();

try{
  Object.assign(process.env, require('../.env'));
}
catch(ex){
  console.log(ex);
}

app.engine('html', ejs.renderFile);

module.exports = app;

app.use(require('body-parser').json());

app.use('/dist', express.static(path.join(__dirname, '../dist')));

const index = path.join(__dirname, '../index.html');

app.get('/', (req, res)=> {
  res.render(index, { token: req.query.token })
});

app.use((req, res, next)=> {
  const token = req.headers.authorization;
  if(!token){
    return next();
  }
  let id;
  try{
    id = jwt.decode(token, process.env.JWT_SECRET).id;
  }
  catch(ex){
    return next({ status: 401 });
  }
  User.findById(id)
    .then( user => {
      req.user = user;
      next();
    })
    .catch(next);
});

app.use('/api', require('./api'));


app.use((err, req, res, next)=> {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});
