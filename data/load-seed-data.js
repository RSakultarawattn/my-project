const client = require('../lib/client');
// import our seed data:
const trucks = require('./trucks.js');
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

    const user = users[0].rows[0];

    await Promise.all(
      trucks.map(truck => {
        return client.query(`
                    INSERT INTO trucks (make, model, desire_level, affordability)
                    VALUES ($1, $2, $3, $4);
                `,
          [truck.make, truck.model, truck.desire_level, truck.affordability]);
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
