import mongoose from "mongoose";
import { DATABASE_URL } from "./env.js";
import express from "express";
import plants from "./data/mock.js";

mongoose.connect(DATABASE_URL).then(() => console.log('Connected to DB'));

const app = express();
app.use(express.json());

//식물 전체 리스트 조회
app.get("/plants", (req, res) => {
  if (plants) {
    res.send(plants);
  } else {
    res.status(404).send({ message: "Cannot find plants information" });
  }
});

//식물 상세 정보 조회
app.get("/plants/:id", (req, res) => {
  const id = Number(req.params.id);
  const plant = plants.find((plant) => plant.id === id);
  if (plant) {
    res.send(plant);
  } else {
    res.status(404).send({ message: "Cannot find given id" });
  }
});

//식물 생성
app.post("/plants", (req, res) => {
  const newPlant = req.body;
  const ids = plants.map((plant) => plant.id);
  newPlant.id = Math.max(...ids) + 1;

  newPlant.temperature = null;
  newPlant.humidity = null;
  newPlant.light = null;
  plants.push(newPlant);
  res.status(201).send(newPlant);
});

//사용자 식물 정보 수정
app.patch("/plants/:id", (req, res) => {
  const id = Number(req.params.id);
  const plant = plants.find((plant) => plant.id === id);
  if (plant) {
    Object.keys(req.body).forEach((key) => {
      plant[key] = req.body[key];
    });
    res.send(plant);
  } else {
    res.status(404).send({ message: "Cannot find given id" });
  }
});

//아두이노로부터 식물 정보 업데이트  (나중에 수정 필요)
app.patch("/plants/:id/sensor-data", (req, res) => {
  const id = Number(req.params.id);
  const plant = plants.find((plant) => plant.id === id);
  if (plant) {
    Object.keys(req.body).forEach((key) => {
      plant[key] = req.body[key];
    });
    res.send(plant);
  } else {
    res.status(404).send({ message: "Cannot find given id" });
  }
});

//식물 삭제
app.delete("/plants/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = plants.findIndex((plant) => plant.id === id);
  if (idx >= 0) {
    plants.splice(idx, 1);
    res.sendStatus(204);
  } else {
    res.status(404).send({ message: "Cannot find given id" });
  }
});

app.listen(3000, () => console.log("Server Started"));
