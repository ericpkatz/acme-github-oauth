const app = require('express').Router();
const jwt = require('jwt-simple');
const { Product, Order, LineItem, User } = require('./db').models;
const axios = require('axios');
const queryString = require('query-string');

module.exports = app;

const loggedIn = (req, res, next)=> {
  next(req.user ? null : { status: 401 });
};

const isMe = (paramKey)=> {
  return (req, res, next)=> {
    next(req.user.isAdmin || req.user.id === req.params[paramKey] ? null : {
      status: 401
    });
  };
}; 

app.get('/auth/github', (req, res, next)=> {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}`;
  res.redirect(url);
});

app.get('/auth/github/callback', async(req, res, next)=> {
  try{
    let response = await axios.post('https://github.com/login/oauth/access_token', {
          code: req.query.code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          redirect_uri: process.env.GITHUB_REDIRECT_URI,
        });
    const parsed = queryString.parse(response.data);
    const { error, access_token } = parsed;
    if(error){
      throw ({ message: error })
    }
    response = await axios.get(`https://api.github.com/user?access_token=${ access_token }`);
    const { id, login } = response.data;
    const attr = {
      githubUserId: id
    };
    let user = await User.findOne({ where: attr });
    if(!user){
      attr.name = `github: ${ login }`;
      user = await User.create(attr);
    }
    const token = jwt.encode({ id: user.id}, process.env.JWT_SECRET);
    res.redirect(`/?token=${token}`);
  }
  catch(ex){
    next(ex);
  }
});


app.post('/auth', (req, res, next)=> {
  const { name, password } = req.body;
  User.findOne({
    where: { name, password } 
  })
  .then( user => {
    if(!user){
      return next({ status: 401 });
    }
    const token = jwt.encode({id: user.id}, process.env.JWT_SECRET);
    res.send({ token });
  })
  .catch(next);
});

app.get('/auth', (req, res, next)=> {
  if(!req.user){
    return next({ status: 401 });
  }
  res.send(req.user);
});

app.get('/products', (req, res, next)=> {
  Product.findAll()
    .then( products => res.send(products))
    .catch(next);
});

app.get('/count', (req, res, next)=> {
  return LineItem.findAll({
    include: [ {
      model: Order,
      where: { status: 'ORDER'}
    }]
  })
  .then( lineItems => {
    return lineItems.reduce((memo, lineItem)=> {
      memo += lineItem.quantity;
      return memo;
    }, 0);
  })
  .then( count => {
    res.send({ count });
  }) 
  .catch(next);
});

app.get('/users/:id/orders', loggedIn, isMe('id'), async (req, res, next)=> {
  const attr = {
    userId: req.params.id,
    status: 'CART'
  };
  let cart = await Order.findOne({
    where: attr
  });

  if(!cart){
    await Order.create(attr);
  }
  Order.findAll({
    where: {
      userId: req.params.id
    },
    include: [ LineItem ]
  })
  .then( orders => res.send(orders))
  .catch(next);
});

app.get('/users/:id/orders', loggedIn, isMe('id'), async (req, res, next)=> {
  const attr = {
    status: 'CART',
    userId: req.user.id
  };
  try {
  let cart = await Order.findOne({ where: attr });
  if(!cart){
    cart = await Order.create(attr); 
  }
  const orders = await Order.findAll({
    where: {
      userId: req.user.id
    },
    include: [ LineItem ],
    order: [['createdAt', 'DESC']]
  })
  res.send(orders);
  }
  catch(ex){
    next(ex);
  }
});


app.put('/users/:userId/orders/:orderId/lineItems/:id', loggedIn, isMe('userId'), (req, res, next)=> {
  LineItem.findById(req.params.id)
    .then( lineItem => lineItem.update(req.body))
    .then( lineItem => res.send(lineItem))
    .catch(next);
});

app.delete('/users/:userId/orders/:orderId/lineItems/:id', loggedIn, isMe('userId'), (req, res, next)=> {
  LineItem.destroy({
    where: {
      orderId: req.params.orderId,
      id: req.params.id
    }
  })
    .then(()=> res.sendStatus(204))
    .catch(next);
});

app.post('/users/:userId/orders/:orderId/lineItems/', loggedIn, isMe('userId'), (req, res, next)=> {
  LineItem.create({ orderId: req.params.orderId, quantity: req.body.quantity, productId: req.body.productId })
    .then( lineItem => res.send(lineItem))
    .catch(next);
});

app.put('/users/:userId/orders/:id', loggedIn, isMe('userId'), (req, res, next)=> {
  Order.findById(req.params.id)
    .then( order => order.update(req.body))
    .then( order => res.send(order))
    .catch(next);
});

app.post('/reset', (req, res, next)=> {
    Order.destroy({ cascade: true, truncate: true })
    .then(()=> res.sendStatus(204))
    .catch(next);
});
