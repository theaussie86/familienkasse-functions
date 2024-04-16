import { CloudEvent, cloudEvent } from "@google-cloud/functions-framework";

import { MongoClient } from "mongodb";

const client = new MongoClient(
  `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@familienkasse.i5hq0pp.mongodb.net/?retryWrites=true&w=majority&appName=Familienkasse`
);

cloudEvent(
  "insertData",
  async (
    cloudEvent: CloudEvent<{
      created: string;
      isPaid: boolean;
      amount: number;
      account: string;
      description: string;
    }>
  ) => {
    if (!cloudEvent.data) {
      throw "CloudEvent does not contain data.";
    }

    console.log("Data received:", cloudEvent.data);

    if (
      !cloudEvent.data?.account ||
      !["spenden", "sparen", "investieren"].includes(
        cloudEvent.data?.account.trim().toLowerCase()
      )
    ) {
      throw "account field is missing  or invalid";
    }

    if (!cloudEvent.data?.amount) {
      throw "amount field is missing";
    }

    if (!cloudEvent.data?.description) {
      throw "description field is missing";
    }

    try {
      await client.connect();
      const database = client.db(process.env.DB_NAME);
      const collection = database.collection("transactions");
      const result = await collection.insertOne({
        ...cloudEvent.data,
        created: cloudEvent.data?.created
          ? cloudEvent.data?.created
          : new Date(),
        isPaid: cloudEvent.data?.isPaid === true ? true : false,
      });
      console.log(`Data inserted with ID: ${result.insertedId}`);
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
  }
);
