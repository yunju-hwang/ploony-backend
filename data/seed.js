import mongoose from "mongoose";
import data from "./mock.js";
import Plant from "../models/Plant.js";
import { DATABASE_URL } from "../env.js";

mongoose.connect(DATABASE_URL);

await Plant.deleteMany({});
await Plant.insertMany(data);

mongoose.connection.close();
