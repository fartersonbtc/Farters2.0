const { Client } = require('pg');

exports.handler = async (event) => {
  const address = event.queryStringParameters.address?.trim();

  if (!address || !address.startsWith('bc1')) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Invalid Taproot address' }),
    };
  }

 const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});


  try {
    await client.connect();
    const res = await client.query(
      'SELECT 1 FROM wallets WHERE taproot_address = $1 LIMIT 1',
      [address]
    );
    await client.end();

    const isFartlisted = res.rowCount > 0;

    return {
      statusCode: 200,
      body: JSON.stringify({
        address,
        status: isFartlisted ? 'FartListed' : 'Not FartListed',
      }),
    };
  } catch (err) {
    console.error('DB error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'Server error' }),
    };
  }
};
