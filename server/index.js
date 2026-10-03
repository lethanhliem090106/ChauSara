import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT) || 3001;
const host =
  process.env.HOST ||
  (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const mealSlots = [
  "Bữa Sáng (07:00)",
  "Bữa Trưa (11:30)",
  "Bữa Tối (18:30)",
  "Bữa Phụ (15:00)",
];

app.use(express.json({ limit: "8kb" }));

app.post("/api/generate-plan", async (req, res) => {
  const { conditions, dislikes, targetCalories } = req.body ?? {};

  if (
    !Array.isArray(conditions) ||
    conditions.length > 10 ||
    conditions.some(
      (condition) =>
        typeof condition !== "string" ||
        condition.trim().length === 0 ||
        condition.length > 100,
    ) ||
    typeof dislikes !== "string" ||
    dislikes.length > 300 ||
    !Number.isInteger(targetCalories) ||
    targetCalories < 500 ||
    targetCalories > 5000
  ) {
    return res.status(400).json({ error: "Thông tin thực đơn không hợp lệ." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error:
        "Chưa cấu hình GEMINI_API_KEY. Hãy tạo file .env theo hướng dẫn rồi khởi động lại ứng dụng.",
    });
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const mealSchema = {
    type: "OBJECT",
    properties: {
      slot: { type: "STRING", enum: mealSlots },
      name: { type: "STRING" },
      grams: { type: "INTEGER" },
      calories: { type: "INTEGER" },
      carbs: { type: "INTEGER" },
      protein: { type: "INTEGER" },
      fat: { type: "INTEGER" },
    },
    required: [
      "slot",
      "name",
      "grams",
      "calories",
      "carbs",
      "protein",
      "fat",
    ],
  };
  const requestBody = {
    systemInstruction: {
      parts: [
        {
          text: "Bạn là trợ lý gợi ý thực đơn bằng tiếng Việt. Không chẩn đoán, điều trị hoặc tuyên bố chữa khỏi bệnh. Xem tình trạng sức khỏe chỉ là ràng buộc ăn uống, không thay thế tư vấn chuyên gia. Ước tính dinh dưỡng, không khẳng định chính xác tuyệt đối.",
        },
      ],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "Tạo thực đơn một ngày gồm đúng 4 bữa, phù hợp với dữ liệu sau:",
              `Tình trạng cần lưu ý: ${conditions.map((value) => value.trim()).join(", ") || "Không có"}.`,
              `Món không thích/yêu cầu: ${dislikes.trim() || "Không có"}.`,
              `Mục tiêu năng lượng: khoảng ${targetCalories} kcal/ngày.`,
              "Ưu tiên món ăn quen thuộc ở Việt Nam, nguyên liệu phổ biến; tôn trọng yêu cầu tránh món/nguyên liệu. Tổng năng lượng 4 bữa nên gần mục tiêu.",
              `Các bữa lần lượt phải dùng đúng nhãn: ${mealSlots.join("; ")}.`,
              "Trả về title, note và meals. Mỗi bữa gồm slot, tên món, tổng khối lượng ước tính (gram, số nguyên), calories, carbs, protein, fat (đều là số nguyên ước tính). Không thêm lời khuyên y tế.",
            ].join("\n"),
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          note: { type: "STRING" },
          meals: {
            type: "ARRAY",
            items: mealSchema,
          },
        },
        required: ["title", "note", "meals"],
      },
    },
  };
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
  );
  url.searchParams.set("key", apiKey);

  let providerResponse;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      providerResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(45_000),
      });
    } catch (error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        return res.status(504).json({
          error: "AI phản hồi quá lâu. Vui lòng thử lại.",
        });
      }

      console.error("Could not reach Gemini API:", error.message);
      return res.status(502).json({
        error: "Không thể kết nối dịch vụ AI. Vui lòng thử lại sau.",
      });
    }

    if (providerResponse.status !== 503 || attempt === 1) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (!providerResponse.ok) {
    let providerMessage;
    try {
      const providerError = await providerResponse.json();
      providerMessage = providerError.error?.message;
    } catch {
      providerMessage = undefined;
    }
    console.error(
      `Gemini API returned HTTP ${providerResponse.status}: ${
        providerMessage || "No error details."
      }`,
    );
    if (providerResponse.status === 429) {
      return res.status(429).json({
        error: "Gemini đang hết hạn mức miễn phí tạm thời. Hãy thử lại sau.",
      });
    }
    if ([401, 403].includes(providerResponse.status)) {
      return res.status(502).json({
        error: "Gemini từ chối API key. Hãy kiểm tra lại key trong file .env.",
      });
    }
    if (providerResponse.status === 503) {
      return res.status(503).json({
        error: "Gemini đang quá tải. Vui lòng đợi một chút rồi thử lại.",
      });
    }
    return res.status(502).json({
      error: "Gemini chưa tạo được thực đơn. Vui lòng thử lại sau.",
    });
  }

  let providerData;
  try {
    providerData = await providerResponse.json();
  } catch {
    console.error("Gemini API returned an invalid JSON response.");
    return res.status(502).json({
      error: "Gemini trả về phản hồi không hợp lệ. Vui lòng thử lại.",
    });
  }

  const responseText = providerData.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");
  let plan;
  try {
    plan = JSON.parse(responseText);
  } catch {
    console.error("Gemini response did not contain a valid meal plan.");
    return res.status(502).json({
      error: "Gemini chưa trả về thực đơn hợp lệ. Vui lòng thử lại.",
    });
  }

  const isValidMeal = (meal) =>
    meal &&
    mealSlots.includes(meal.slot) &&
    typeof meal.name === "string" &&
    meal.name.trim().length > 0 &&
    meal.name.length <= 160 &&
    ["grams", "calories", "carbs", "protein", "fat"].every(
      (key) =>
        Number.isInteger(meal[key]) &&
        meal[key] >= 0 &&
        meal[key] <= 5000,
    );

  if (
    typeof plan.title !== "string" ||
    plan.title.trim().length === 0 ||
    plan.title.length > 160 ||
    typeof plan.note !== "string" ||
    plan.note.length > 600 ||
    !Array.isArray(plan.meals) ||
    plan.meals.length !== mealSlots.length ||
    !plan.meals.every(isValidMeal) ||
    new Set(plan.meals.map((meal) => meal.slot)).size !== mealSlots.length
  ) {
    console.error("Gemini response failed meal plan validation:", {
      titleValid: typeof plan.title === "string" && plan.title.trim().length > 0,
      noteValid: typeof plan.note === "string" && plan.note.length <= 600,
      mealCount: Array.isArray(plan.meals) ? plan.meals.length : null,
    });
    return res.status(502).json({
      error: "Gemini chưa trả về thực đơn hợp lệ. Vui lòng thử lại.",
    });
  }

  plan.meals = mealSlots.map((slot) =>
    plan.meals.find((meal) => meal.slot === slot),
  );

  return res.json(plan);
});

app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  return next(error);
});

app.use(express.static(path.join(projectRoot, "dist")));
app.get("/{*path}", (req, res, next) => {
  res.sendFile(path.join(projectRoot, "dist", "index.html"), (error) => {
    if (error) next(error);
  });
});

app.listen(port, host, () => {
  console.log(`CleanBite server listening on ${host}:${port}`);
});
