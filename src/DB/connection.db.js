import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";
import { UserModel } from "./models/index.js";


export const authenticationDB = async () => {
  try {
    const connection = await mongoose.connect(DB_URI , {serverSelectionTimeoutMS: 30000});

    console.log("DB Connection Successfully");
    await UserModel.syncIndexes();
  } catch (error) {
    console.log("DB Connection Failed", error);
  }
};
