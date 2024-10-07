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
  plants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Plant" }]  // 유저가 가진 식물 목록
});

const User = mongoose.model("User", userSchema);

export default User;
