import { CloudEvent, cloudEvent } from "@google-cloud/functions-framework";

import { MongoClient } from "mongodb";

const client = new MongoClient(
  `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@familienkasse.i5hq0pp.mongodb.net/?retryWrites=true&w=majority&appName=Familienkasse`
);

type Transaction = {
  created?: Date;
  isPaid?: boolean;
  amount: number;
  account: string;
  description: string;
};

cloudEvent(
  "insertData",
  async (
    cloudEvent: CloudEvent<{
      message: {
        data: string;
      };
    }>
  ) => {
    if (!cloudEvent.data) {
      throw "CloudEvent does not contain data.";
    }

    console.log("Data received:", cloudEvent.data);
    const data: Transaction = JSON.parse(
      Buffer.from(cloudEvent.data.message.data, "base64").toString("utf-8")
    );

    if (
      !data.account ||
      !["spenden", "sparen", "investieren"].includes(
        data.account.trim().toLowerCase()
      )
    ) {
      throw "account field is missing  or invalid";
    }

    if (!data.amount) {
      throw "amount field is missing";
    }

    if (!data.description) {
      throw "description field is missing";
    }

    try {
      await client.connect();
      const database = client.db(process.env.DB_NAME);
      const collection = database.collection("transactions");
      const result = await collection.insertOne({
        ...data,
        created: data.created ? data.created : new Date(),
        isPaid: data.isPaid === true ? true : false,
      });
      console.log(`Data inserted with ID: ${result.insertedId}`);
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
  }
);
