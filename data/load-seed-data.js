const client = require('../lib/client');
// import our seed data:
const trucks = require('./trucks.js');
const models = require('./models.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );
    await Promise.all(
      models.map(model => {
        return client.query(`
            INSERT INTO models (name)
            VALUES ($1)
            RETURNING *;
          `,
          [model.name]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      trucks.map(truck => {
        return client.query(`
                    INSERT INTO trucks (model_id, desire_level, affordability, owner_id)
                    VALUES ($1, $2, $3, $4);
                `,
          [truck.model_id, truck.desire_level, truck.affordability, user.id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
