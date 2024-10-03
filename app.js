import mongoose from "mongoose";
import * as dotenv from "dotenv";
import express from "express";
import Plant from "./models/Plant.js";
import cors from 'cors';
import { analyzePlantData } from "./openai.js";


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

//식물 생성 (프론트)
app.post(
  "/plants",
  asyncHandler(async (req, res) => {
    const newPlant = await Plant.create(req.body);
    res.status(201).send(newPlant);
  })
);

//아두이노로 id 보내기
app.get(
    "/plants/recent",
    asyncHandler(async (req, res) => {
      // 최근 생성된 식물 ID를 DB에서 찾음
      const recentPlant = await Plant.findOne().sort({ _id: -1 }); // 가장 최근 생성된 식물 찾기
  
      if (recentPlant) {
        // 최근 생성된 식물이 있으면 그 ID를 반환
        res.status(200).send({
          plantId: recentPlant._id,
        });
      } else {
        // 최근 생성된 식물이 없으면 오류 메시지 반환
        res.status(404).send({
          message: "No recently created plant found",
        });
      }
    })
  );
  

//사용자 식물 정보 수정 (프론트)
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



//Sensor data update API
app.patch("/plants/:id/sensor-data", asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { temperature, humidity, light } = req.body;
  
    try {
      const plant = await Plant.findById(id); // 해당 식물 찾기 (단일 식물 관리 시)
      plant.temperature = temperature;
      plant.humidity = humidity;
      plant.light = light;
      
      await plant.save();
      res.status(200).send({ message: "Sensor data updated successfully" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
}));

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

// 식물 데이터를 분석하는 API 엔드포인트
app.post(
    "/plants/analyze/:id",
    asyncHandler(async (req, res) => {
      const plantId = req.params.id;
      const plant = await Plant.findById(plantId);
      
      if (plant) {
        // 분석 로직 호출 (OpenAI API 등을 사용할 수 있음)
        const analysis = await analyzePlantData(plant);
  
        res.status(200).send({
          message: "Plant analysis completed",
          analysis,
        });
      } else {
        res.status(404).send({ message: "Cannot find plant with the given ID" });
      }
    })
  );

app.listen(process.env.PORT || 10000, () => console.log("Server Started"));
