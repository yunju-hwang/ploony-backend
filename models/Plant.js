import mongoose from "mongoose";

const PlantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 30
  },

  species: {
    type: String,
    required: true
  },

  startDate: {
    type: Date,
  },

  photoUrl: {
    type: String,
  },

  temperature: {
    type: Number,
    default: null
  },

  humidity: {
    type: Number,
    default: null
  },

  light: {
    type: Number,
    default: null
  },
});

const Plant = mongoose.model("Plant", PlantSchema);
export default Plant;
