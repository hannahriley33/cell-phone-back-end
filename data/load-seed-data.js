require('dotenv').config();
const pg = require('pg');
const Client = pg.Client;
// import our seed data:
const types = require('./types');
const cell = require('./cell');
run();
async function run() {
    const client = new Client(process.env.DATABASE_URL);
    try {
        await client.connect();
        // First save types and get each returned row which has
        // the id of the type. Notice use of RETURNING:
        const savedTypes = await Promise.all(
            types.map(async type => {
                const result = await client.query(`
                    INSERT INTO types (name)
                    VALUES ($1)
                    RETURNING *;
                `,
                    [type]);
                return result.rows[0];
            })
        );
        [
            { name: 'orange tabby', id: 1 },
            { name: 'tuxedo', id: 2 },
            { name: 'angora', id: 3 },
        ];
        [
            {
                name:'iphone',
                type:'smartphone',
                image:'',
                year:2007,
                brand:'Apple',
                color:'Gold',
            },
            {
                name: 'Garfield',
                type: 'Orange Tabby',
                url: 'assets/cell-phones/garfield.jpeg',
                year: 1978,
                lives: 7,
                isSidekick: false
            },
        ]
        await Promise.all(
            cell.map(cat => {
                // Find the corresponding type id
                // find the id of the matching cat type!
                const type = savedTypes.find(type => {
                    return type.name === cat.type;
                });
                return client.query(`
                    INSERT INTO cell (name, type_id, url, year, lives, is_sidekick)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
                [cell.name, type.id, cell.url, cat.year, cat.lives, cat.isSidekick]);
            })
        );
        console.log('seed data load complete');
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.end();
    }
}