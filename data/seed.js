import mongoose from "mongoose";
import data from "./mock.js";
import Plant from "../models/Plant.js";
import * as dotenv from "dotenv";


dotenv.config({ path: "../ploony-backend/app.env" });

mongoose.connect(process.env.DATABASE_URL);

await Plant.deleteMany({});
await Plant.insertMany(data);

mongoose.connection.close();
