import mongoose from "mongoose";

const PlantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 30,
  },

  species: {
    type: String,
    required: true,
  },

  startDate: {
    type: Date,
    default: Date.now,
  },

  photoUrl: {
    type: String,
    default: "https://via.placeholder.com/150/FFFFFF/FFFFFF?text=No+Image",
  },

  temperature: {
    type: Number,
    default: null,
  },

  humidity: {
    type: Number,
    default: null,
  },

  light: {
    type: Number,
    default: null,
  },
  soilMoisture: {
    type: Number,
    default: null,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 유저와 연결
});

const Plant = mongoose.model("Plant", PlantSchema);
export default Plant;
