import mongoose from "mongoose";
import * as dotenv from "dotenv";
import express from "express";
import Plant from "./models/Plant.js";
import cors from 'cors';

dotenv.config({ path: "./app.env" });

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to DB"));

const app = express();
app.use(cors());
app.use(express.json());

//비동기 오류 처리
function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      if (e.name === "ValidationError") {
        res.status(400).send({ message: e.message });
      } else if (e.name === "CastError") {
        res.status(404).send({ message: "Cannot find given id" });
      } else {
        res.status(500).send({ message: e.message });
      }
    }
  };
}

//식물 전체 리스트 조회
app.get(
  "/plants",
  asyncHandler(async (req, res) => {
    const plants = await Plant.find();
    if (plants) {
      res.send(plants);
    } else {
      res.status(404).send({ message: "Cannot find plants information" });
    }
  })
);

//식물 상세 정보 조회
app.get(
  "/plants/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const plant = await Plant.findById(id);
    if (plant) {
      res.send(plant);
    } else {
      res.status(404).send({ message: "Cannot find given id" });
    }
  })
);

//식물 생성
app.post(
  "/plants",
  asyncHandler(async (req, res) => {
    const newPlant = await Plant.create(req.body);
    res.status(201).send(newPlant);
  })
);

//사용자 식물 정보 수정
app.patch(
  "/plants/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const plant = await Plant.findById(id);
    if (plant) {
      Object.keys(req.body).forEach((key) => {
        plant[key] = req.body[key];
      });
      await plant.save();
      res.send(plant);
    } else {
      res.status(404).send({ message: "Cannot find given id" });
    }
  })
);

//아두이노로부터 식물 정보 업데이트  (나중에 수정 필요)
app.patch(
  "/plants/:id/sensor-data",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const plant = await Plant.findById(id);
    if (plant) {
      Object.keys(req.body).forEach((key) => {
        plant[key] = req.body[key];
      });
      await plant.save();
      res.send(plant);
    } else {
      res.status(404).send({ message: "Cannot find given id" });
    }
  })
);

//식물 삭제
app.delete(
  "/plants/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const plant = await Plant.findOneAndDelete(id);
    if (plant) {
      res.sendStatus(204);
    } else {
      res.status(404).send({ message: "Cannot find given id" });
    }
  })
);

app.listen(process.env.PORT || 10000, () => console.log("Server Started"));
