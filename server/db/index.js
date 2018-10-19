const conn = require('./conn');

const Product = require('./Product');
const LineItem = require('./LineItem');
const Order = require('./Order');
const User = require('./User');

LineItem.belongsTo(Order);
LineItem.belongsTo(Product);
Order.hasMany(LineItem);
Order.belongsTo(User);
User.hasMany(Order);

const syncAndSeed = ()=> {
  return conn.sync({ force: true })
    .then(async()=> {
      const [ moe, larry, curly ] = await Promise.all([
          User.create({ name: 'moe', password: 'MOE'}),
          User.create({ name: 'larry', password: 'LARRY'}),
          User.create({ name: 'curly', password: 'CURLY'}),
      ]);
      const [ foo, bar, bazz] = await Promise.all([
        Product.create({ name: 'foo', password: 'MOE' }),
        Product.create({ name: 'bar', password: 'LARRY' }),
        Product.create({ name: 'bazz', password: 'CURLY' }),
        Product.create({ name: 'quq', password: 'CURLY' }),
      ]);

      const order1 = await Order.create({status: 'ORDER', userId: moe.id });
      const order2 = await Order.create({status: 'ORDER', userId: moe.id  });
      await Promise.all([
        LineItem.create({ productId: foo.id, orderId: order1.id, quantity: 2 }),
        LineItem.create({ productId: foo.id, orderId: order2.id, quantity: 5 }),
        LineItem.create({ productId: bar.id, orderId: order1.id, quantity: 3 })
      ]);
    });
};

module.exports = {
  models: {
    Product,
    Order,
    LineItem,
    User
  },
  syncAndSeed
};
