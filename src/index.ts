import { MongoClient } from "mongodb";
import { Request, Response } from "express";
import * as dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URL ?? "");

export const insertData = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection("transactions");
    const result = await collection.insertOne({
      ...req.body,
      created: new Date(req.body.created),
    });
    res.status(200).send(`Data inserted with ID: ${result.insertedId}`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error inserting data");
  } finally {
    await client.close();
  }
};
