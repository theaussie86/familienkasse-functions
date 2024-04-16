"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_framework_1 = require("@google-cloud/functions-framework");
const mongodb_1 = require("mongodb");
const client = new mongodb_1.MongoClient(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@familienkasse.i5hq0pp.mongodb.net/?retryWrites=true&w=majority&appName=Familienkasse`);
(0, functions_framework_1.cloudEvent)("insertData", async (cloudEvent) => {
    var _a, _b, _c, _d, _e, _f;
    if (!cloudEvent.data) {
        throw "CloudEvent does not contain data.";
    }
    console.log("Data received:", cloudEvent.data);
    if (!((_a = cloudEvent.data) === null || _a === void 0 ? void 0 : _a.account) ||
        !["spenden", "sparen", "investieren"].includes((_b = cloudEvent.data) === null || _b === void 0 ? void 0 : _b.account.trim().toLowerCase())) {
        throw "account field is missing  or invalid";
    }
    if (!((_c = cloudEvent.data) === null || _c === void 0 ? void 0 : _c.amount)) {
        throw "amount field is missing";
    }
    if (!((_d = cloudEvent.data) === null || _d === void 0 ? void 0 : _d.description)) {
        throw "description field is missing";
    }
    try {
        await client.connect();
        const database = client.db(process.env.DB_NAME);
        const collection = database.collection("transactions");
        const result = await collection.insertOne({
            ...cloudEvent.data,
            created: new Date((_e = cloudEvent.data) === null || _e === void 0 ? void 0 : _e.created),
            isPaid: ((_f = cloudEvent.data) === null || _f === void 0 ? void 0 : _f.isPaid) === true ? true : false,
        });
        console.log(`Data inserted with ID: ${result.insertedId}`);
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await client.close();
    }
});
//# sourceMappingURL=index.js.map