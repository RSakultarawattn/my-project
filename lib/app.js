const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/trucks', async (req, res) => {
  try {
    const data = await client.query('SELECT * from trucks');

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/trucks/:id', async (req, res) => {
  try {
    const truckId = req.params.id;

    const data = await client.query(`
        SELECT * FROM trucks 
        WHERE trucks.id=$1 
    `, [truckId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/trucks', async (req, res) => {
  try {
    const newMake = req.body.make;
    const newModel = req.body.model;
    const desireLevel = req.body.desire_level;
    const affordability = req.body.affordability;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
        INSERT INTO trucks (make, model, desire_level, affordability, owner_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *

    `, [newMake, newModel, desireLevel, affordability, newOwnerId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put('/trucks/:id', async (req, res) => {
  try {
    const newMake = req.body.make;
    const newModel = req.body.model;
    const desireLevel = req.body.desire_level;
    const affordability = req.body.affordability;
    const newOwnerId = req.body.owner_id;

    const data = await client.query(`
        UPDATE trucks
        SET make = $1,
            model = $2,
            desire_level = $3,
            affordability = $4,
            owner_id = $5
            WHERE trucks.id = $6
            RETURNING *;
    `, [newMake, newModel, desireLevel, affordability, newOwnerId, req.params.id]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/trucks/:id', async (req, res) => {
  try {
    const truckId = req.params.id
    const data = await client.query(`
        DELETE from trucks 
        WHERE trucks.id=$1

    `, [truckId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
