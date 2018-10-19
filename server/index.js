const port = process.env.PORT || 3000;
const db = require('./db');

require('./app').listen(port, ()=> console.log(`listening on port ${port}`));

db.syncAndSeed();
