const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URL);

exports.insertData = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  if (!req.body) {
    res.status(400).send("Request body is missing");
    return;
  }

  if (
    !req.body.account ||
    !["spenden", "sparen", "investieren"].includes(
      req.body.account.trim().toLowerCase()
    )
  ) {
    res.status(400).send("account field is missing  or invalid");
    return;
  }

  if (!req.body.amount) {
    res.status(400).send("amount field is missing");
    return;
  }

  if (!req.body.description) {
    res.status(400).send("description field is missing");
    return;
  }

  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection("transactions");
    const result = await collection.insertOne({
      ...req.body,
      created: new Date(req.body.created),
      isPaid: req.body.isPaid === "true" ? true : false,
    });
    res.status(200).send(`Data inserted with ID: ${result.insertedId}`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error inserting data");
  } finally {
    await client.close();
  }
};
