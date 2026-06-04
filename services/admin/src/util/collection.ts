import { connectDb } from "../config/db.js";

export const getStoreCollection = async () => {
  const db = await connectDb();
  console.log("DB NAME:", db.databaseName);

  return db.collection("stores");
};

export const getRiderCollection = async () => {
  const db = await connectDb();

  return db.collection("riders");
};
