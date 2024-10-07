import axios from 'axios';  
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import express from "express";
import Plant from "./models/Plant.js";
import cors from "cors";
import { analyzePlantData } from "./openai.js";
import User from './models/User.js';

dotenv.config({ path: "./app.env" });

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to DB"));

const app = express();
app.use(cors());
app.use(express.json());

// 비동기 오류 처리
function asyncHandler(handler) {
    return async function (req, res) {
      try {
        await handler(req, res);
      } catch (e) {
        console.error("Error caught in asyncHandler:", e); // 오류 로그 추가
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
  
// Kakao 로그인 처리 엔드포인트 추가
app.post("/auth/kakao", asyncHandler(async (req, res) => {
    const { accessToken } = req.body;  // 클라이언트에서 전송한 액세스 토큰을 받음
  
    if (!accessToken) {
      return res.status(400).json({ message: "Access token is required" });
    }
  
    try {
      // Kakao API를 사용해 사용자 정보를 가져옴
      const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`  // Bearer 토큰 방식으로 Kakao API 호출
        }
      });
  
      const kakaoProfile = response.data;  // 카카오에서 반환된 사용자 정보
  
      // 필요한 사용자 정보를 추출 (예: 카카오 고유 ID, 닉네임 등)
      const kakaoId = kakaoProfile.id;
      const nickname = kakaoProfile.properties.nickname;
  
      // 사용자 정보 저장 (이미 존재하는지 확인한 후 없으면 저장)
      let user = await User.findOne({ kakaoId });  // MongoDB에서 kakaoId로 사용자를 찾음
      if (!user) {
        user = new User({
          kakaoId,
          nickname,
        });
        await user.save();  // 새 사용자 저장
      }
  
      // MongoDB _id와 함께 사용자 정보를 반환
      res.status(200).json({
        message: "User authenticated successfully",
        user: {
          _id: user._id,  // MongoDB의 _id 반환
          kakaoId: user.kakaoId,
          nickname: user.nickname,
        }
      });
    } catch (error) {
      console.error("Kakao API error:", error.response?.data || error.message);
      res.status(500).json({ message: "Failed to authenticate with Kakao" });
    }
  }));
  

// 유저의 모든 식물 조회
app.get(
    "/users/:userId/plants",
    asyncHandler(async (req, res) => {
      const userId = req.params.userId;
  
      // 유저와 그 유저가 가진 모든 식물을 조회 (populate를 사용하여 연결된 식물 정보 포함)
      const user = await User.findById(userId).populate("plants");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json(user.plants);
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
    "/users/:userId/plants",
    asyncHandler(async (req, res) => {
      const userId = req.params.userId;
      const { name, species, temperature, humidity, light } = req.body;
  
      // 유저를 찾아서 확인
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // 새로운 식물 생성
      const plant = new Plant({
        name,
        species,
        temperature,
        humidity,
        light,
        owner: user._id  // 해당 식물의 소유자 설정
      });
  
      // 식물 저장
      const savedPlant = await plant.save();
  
      // 유저의 식물 목록에 추가
      user.plants.push(savedPlant._id);
      await user.save();
  
      res.status(201).json({ message: "Plant created successfully", plant: savedPlant });
    })
  );
  

//아두이노에게 최신 id값 전달해주기 (처음 시작할 때 일회성 코드)
app.get("/recent/plants", asyncHandler(async (req, res) => {
    try {
      const recentPlant = await Plant.findOne().sort({ _id: -1 });
      console.log("Recent Plant:", recentPlant); // 디버깅 로그
  
      if (recentPlant) {
        res.status(200).send({
          plantId: recentPlant._id,
        });
      } else {
        res.status(404).send({
          message: "No recently created plant found",
        });
      }
    } catch (error) {
      console.error("Error retrieving recent plant:", error); // 오류 로그
      res.status(500).send({ message: "Internal server error" });
    }
  }));
  
  
  
  

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
app.patch(
  "/plants/:id/sensor-data",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const { temperature, humidity, light, soilMoisture } = req.body;

    try {
      const plant = await Plant.findById(id); // 해당 식물 찾기 (단일 식물 관리 시)
      plant.temperature = temperature;
      plant.humidity = humidity;
      plant.light = light;
      plant.soilMoisture = soilMoisture;

      await plant.save();
      res.status(200).send({ message: "Sensor data updated successfully" });
    } catch (error) {
      res.status(500).send({ message: error.message });
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
