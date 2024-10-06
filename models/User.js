import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  kakaoId: {
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    required: true
  },
});

const User = mongoose.model("User", userSchema);

export default User;
