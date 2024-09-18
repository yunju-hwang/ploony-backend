import mongoose from "mongoose";

const PlantSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  species: {
    type: String,
  },

  startDate: {
    type: Date,
  },

  photoUrl: {
    type: String,
  },

  temperature: {
    type: Number,
  },

  humidity: {
    type: Number,
  },

  light: {
    type: Number,
  },
});

const Plant = mongoose.model("Plant", PlantSchema);
export default Plant;
