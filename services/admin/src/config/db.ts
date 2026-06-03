import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export const connectDb = async (): Promise<Db> => {
  if (db) return db;

  client = new MongoClient(process.env.MONGO_URI!);
  await client.connect();
  db = client.db();

  console.log("Admin service connected to mongodb");
  console.log("DB NAME:", db.databaseName);


  return db;
};
