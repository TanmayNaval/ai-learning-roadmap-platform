import mongoose from "mongoose";

const { Schema } = mongoose;

const userInputSchema = new Schema(
  {
    name: String,
    skills: String,
    interests: String,
    goals: String,
    roadmap: String
  },
  { timestamps: true }
);

const UserInput = mongoose.model("UserInput", userInputSchema);

export default UserInput;
