import React, { useState, useMemo } from "react";
import { calculateBMI, calculateDiet, calculateGrams } from "./Calculator";
import {
  VIETNAM_FOOD_DATABASE,
  CATEGORIES,
  DEFAULT_CONDITIONS,
} from "./FoodsData";

// ===================== LOGO VECTOR CLEANBITE THEO BẢN THIẾT KẾ =====================
function CleanBiteLogo({ className = "w-8 h-8" }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="55" fill="url(#cbGrad)" />
      {/* Vành chiếc lá uốn cong tạo chữ C */}
      <path
        d="M 145 60 C 120 30 70 35 48 65 C 24 100 35 145 75 165 C 115 180 150 155 160 125 C 145 142 112 152 82 140 C 56 128 48 95 65 72 C 82 50 120 48 140 68 Z"
        fill="white"
      />
      {/* Đầu lá trên */}
      <path
        d="M 112 40 C 135 40 160 55 160 80 C 135 80 115 65 112 40 Z"
        fill="white"
      />
      {/* Hình chiếc nĩa và thìa ôm trong lòng */}
      <path
        d="M 85 92 L 95 92 L 95 106 C 95 116 102 122 112 122 L 118 122 C 128 122 136 114 136 104 C 136 96 128 88 118 90 C 112 91 106 97 106 104 L 106 100 C 106 94 100 88 94 88 L 85 88 Z"
        fill="#10b981"
      />
      <rect x="88" y="78" width="3" height="12" rx="1.5" fill="#10b981" />
      <rect x="93" y="78" width="3" height="12" rx="1.5" fill="#10b981" />
      <rect x="98" y="78" width="3" height="12" rx="1.5" fill="#10b981" />
    </svg>
  );
}

export default function App() {
  // Mặc định là Chế độ sáng (Light Mode)
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("journal");
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Bộ chọn ngày
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 8)); // 8 thg 9

  // Hồ sơ người dùng
  const [profile, setProfile] = useState({
    name: "Bảo Châu",
    gender: "Nữ",
    weight: 43,
    height: 152,
    age: 21,
    activity: 1.2,
    conditions: ["Đau dạ dày"],
    carbsRatio: 35,
    proteinRatio: 35,
    fatRatio: 30,
    waterReminder: true,
  });

  // Tự nhập bệnh lý khác
  const [customConditionInput, setCustomConditionInput] = useState("");

  // Tính toán qua Calculator.js
  const bmiInfo = calculateBMI(profile.weight, profile.height);
  const dietInfo = calculateDiet(
    profile.gender,
    profile.weight,
    profile.height,
    profile.age,
    profile.activity,
  );
  const targetCalories = 1235;

  // Macros mục tiêu (gram)
  const targetCarbsGrams = Math.round(
    (targetCalories * (profile.carbsRatio / 100)) / 4,
  );
  const targetProteinGrams = Math.round(
    (targetCalories * (profile.proteinRatio / 100)) / 4,
  );
  const targetFatGrams = Math.round(
    (targetCalories * (profile.fatRatio / 100)) / 9,
  );

  // 8 ly nước (mỗi ly 250ml)
  const [waterCount, setWaterCount] = useState(3); // 750ml

  // Nhật ký 4 bữa ăn
  const [mealLogs, setMealLogs] = useState({
    breakfast: [
      {
        id: "b1",
        name: "Yến mạch cán dẹt nguyên chất",
        grams: 60,
        calories: 233,
        carbs: 40,
        protein: 8,
        fat: 4,
        icon: "🥣",
      },
      {
        id: "b2",
        name: "Trứng gà luộc (1 quả)",
        grams: 55,
        calories: 78,
        carbs: 1,
        protein: 7,
        fat: 5,
        icon: "🥚",
      },
    ],
    lunch: [
      {
        id: "l1",
        name: "Cơm gạo lứt huyết rồng",
        grams: 150,
        calories: 168,
        carbs: 35,
        protein: 4,
        fat: 1,
        icon: "🍚",
      },
      {
        id: "l2",
        name: "Ức gà luộc",
        grams: 120,
        calories: 198,
        carbs: 0,
        protein: 37,
        fat: 4,
        icon: "🍗",
      },
      {
        id: "l3",
        name: "Bông cải xanh (Súp lơ) luộc",
        grams: 100,
        calories: 34,
        carbs: 7,
        protein: 3,
        fat: 0,
        icon: "🥦",
      },
    ],
    dinner: [],
    snack: [],
  });

  // Modal chọn gram
  const [selectedFoodForPortion, setSelectedFoodForPortion] = useState(null);
  const [selectedMealSlot, setSelectedMealSlot] = useState("breakfast");
  const [portionGrams, setPortionGrams] = useState(100);

  // Tìm kiếm món ăn
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [activeFoodCategory, setActiveFoodCategory] = useState("Tất cả");

  // AI Planner
  const [aiDislikesInput, setAiDislikesInput] = useState(
    "không cay không nóng kh ăn rau",
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState({
    title: "Thực đơn mẫu cho người Đau dạ dày (1235 kcal)",
    note: "Đây là thực đơn minh họa dựng sẵn. Nhấn nút tạo thực đơn để nhận gợi ý từ Gemini; dinh dưỡng chỉ là ước tính.",
    meals: [
      {
        slot: "Bữa Sáng (07:00)",
        name: "Cháo yến mạch ức gà xé phay mềm",
        grams: 250,
        calories: 290,
        carbs: 36,
        protein: 26,
        fat: 4,
      },
      {
        slot: "Bữa Trưa (11:30)",
        name: "Cơm gạo lứt mềm + Cá hồi áp chảo + Bí đỏ hấp",
        grams: 350,
        calories: 460,
        carbs: 42,
        protein: 34,
        fat: 14,
      },
      {
        slot: "Bữa Tối (18:30)",
        name: "Đậu hũ non sốt nấm hương + Canh rong biển",
        grams: 230,
        calories: 320,
        carbs: 18,
        protein: 28,
        fat: 12,
      },
      {
        slot: "Bữa Phụ (15:00)",
        name: "1 Quả chuối tiêu chín + 1 cốc sữa chua ấm",
        grams: 200,
        calories: 165,
        carbs: 28,
        protein: 5,
        fat: 3,
      },
    ],
  });

  // ===================== TỔNG HỢP CALO & MACROS =====================
  const allMealsList = useMemo(() => {
    return [
      ...mealLogs.breakfast,
      ...mealLogs.lunch,
      ...mealLogs.dinner,
      ...mealLogs.snack,
    ];
  }, [mealLogs]);

  const totalConsumedCalories = allMealsList.reduce(
    (sum, f) => sum + f.calories,
    0,
  );
  const totalConsumedCarbs = allMealsList.reduce(
    (sum, f) => sum + (f.carbs || 0),
    0,
  );
  const totalConsumedProtein = allMealsList.reduce(
    (sum, f) => sum + (f.protein || 0),
    0,
  );
  const totalConsumedFat = allMealsList.reduce(
    (sum, f) => sum + (f.fat || 0),
    0,
  );

  const remainingCalories = Math.max(0, targetCalories - totalConsumedCalories);
  const percentAchieved = Math.min(
    100,
    Math.round((totalConsumedCalories / targetCalories) * 100),
  );

  // Bộ chọn ngày
  const changeDate = (days) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    setCurrentDate(next);
  };
  const formattedDateString = `Hôm nay, ${currentDate.getDate()} thg ${currentDate.getMonth() + 1}`;

  // Thêm món vào bữa ăn
  const handleConfirmAddFood = () => {
    if (!selectedFoodForPortion || portionGrams <= 0) return;
    const factor = portionGrams / 100;
    const calculatedCal = calculateGrams(
      selectedFoodForPortion.calories,
      Number(portionGrams),
    );

    const newFoodItem = {
      id: `${Date.now()}_${Math.random()}`,
      name: selectedFoodForPortion.name,
      grams: Number(portionGrams),
      calories: calculatedCal,
      carbs: Math.round(selectedFoodForPortion.carbs * factor),
      protein: Math.round(selectedFoodForPortion.protein * factor),
      fat: Math.round(selectedFoodForPortion.fat * factor),
      icon: selectedFoodForPortion.icon,
    };

    setMealLogs((prev) => ({
      ...prev,
      [selectedMealSlot]: [...prev[selectedMealSlot], newFoodItem],
    }));

    setSelectedFoodForPortion(null);
    setPortionGrams(100);
    setActiveTab("journal");
  };

  // Xóa món
  const handleDeleteFood = (slot, id) => {
    setMealLogs((prev) => ({
      ...prev,
      [slot]: prev[slot].filter((item) => item.id !== id),
    }));
  };

  // Nhập cả thực đơn AI vào nhật ký
  const handleImportAiPlanToDiary = () => {
    const slots = ["breakfast", "lunch", "dinner", "snack"];
    const icons = ["🥣", "🍚", "🍲", "🍌"];
    const importedMeals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    generatedPlan.meals.forEach((meal, index) => {
      const slot = slots[index];
      if (!slot) return;
      importedMeals[slot] = [
        {
          id: `${Date.now()}_${index}`,
          name: meal.name,
          grams: meal.grams,
          calories: meal.calories,
          carbs: meal.carbs,
          protein: meal.protein,
          fat: meal.fat,
          icon: icons[index],
        },
      ];
    });

    setMealLogs(importedMeals);
    setActiveTab("journal");
  };

  // Tạo thực đơn AI mới
  const handleRegenerateAi = async () => {
    setIsAiLoading(true);
    setAiError("");

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conditions: profile.conditions,
          dislikes: aiDislikesInput,
          targetCalories,
        }),
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Máy chủ trả về phản hồi không hợp lệ. Vui lòng thử lại.");
      }

      if (!response.ok) {
        throw new Error(result.error || "Không thể tạo thực đơn lúc này.");
      }

      setGeneratedPlan(result);
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "Không thể kết nối dịch vụ AI. Vui lòng thử lại.",
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // Tự nhập thêm bệnh lý
  const handleAddCustomCondition = () => {
    if (!customConditionInput.trim()) return;
    const val = customConditionInput.trim();
    if (!profile.conditions.includes(val)) {
      setProfile({
        ...profile,
        conditions: [...profile.conditions, val],
      });
    }
    setCustomConditionInput("");
  };

  // Lọc danh sách món ăn
  const filteredFoodList = VIETNAM_FOOD_DATABASE.filter((f) => {
    const matchCat =
      activeFoodCategory === "Tất cả" || f.category === activeFoodCategory;
    const matchQuery = f.name
      .toLowerCase()
      .includes(foodSearchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div
      className={`min-h-screen flex justify-center font-sans transition-colors duration-200 ${
        darkMode ? "bg-[#0a0a0a] text-white" : "bg-[#eef2f0] text-neutral-800"
      }`}
    >
      {/* Khung màn hình điện thoại */}
      <div
        className={`w-full max-w-md min-h-screen flex flex-col justify-between relative shadow-2xl transition-colors ${
          darkMode ? "bg-[#121212]" : "bg-white"
        }`}
      >
        {/* VÙNG CUỘN NỘI DUNG */}
        <div className="flex-1 pb-24 overflow-y-auto">
          {/* ===================== TAB 1: NHẬT KÝ ===================== */}
          {activeTab === "journal" && (
            <div>
              {/* Header xanh ngọc */}
              <div className="bg-[#10b981] px-5 pt-6 pb-16 rounded-b-[38px] text-white shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <CleanBiteLogo className="w-9 h-9 shadow-md rounded-2xl" />
                    <div>
                      <h1 className="font-black text-xl tracking-tight text-white leading-none">
                        CleanBite
                      </h1>
                      <span className="text-[9px] font-bold text-emerald-100 tracking-wider">
                        EAT CLEANER • LIVE BRIGHTER
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSetupModal(true)}
                    className="text-[11px] font-bold bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-1 rounded-full text-white backdrop-blur-xs transition-all"
                  >
                    {profile.conditions[0] || "Cá nhân"}
                  </button>
                </div>

                {/* Bộ chọn ngày */}
                <div className="flex justify-between items-center mt-6 text-sm font-semibold text-white">
                  <button
                    onClick={() => changeDate(-1)}
                    className="text-white/80 hover:text-white px-3 py-1 rounded-lg text-lg active:scale-90"
                  >
                    ‹
                  </button>
                  <span className="tracking-wide text-white">
                    {formattedDateString}
                  </span>
                  <button
                    onClick={() => changeDate(1)}
                    className="text-white/80 hover:text-white px-3 py-1 rounded-lg text-lg active:scale-90"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Thẻ Vòng tròn Calo */}
              <div
                className={`-mt-10 mx-4 rounded-3xl p-5 shadow-xl border flex flex-col items-center transition-colors ${
                  darkMode
                    ? "bg-[#181c19] border-neutral-800 text-white"
                    : "bg-white border-neutral-100 text-neutral-800"
                }`}
              >
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={darkMode ? "#242a26" : "#f1f5f9"}
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * percentAchieved) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span
                      className={`text-4xl font-black tracking-tight ${darkMode ? "text-white" : "text-neutral-900"}`}
                    >
                      {remainingCalories}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium mt-0.5">
                      kcal còn lại
                    </span>
                    <span className="mt-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      {percentAchieved}% mục tiêu
                    </span>
                  </div>
                </div>

                {/* Đã nạp & Mục tiêu */}
                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                  <div
                    className={`p-3 rounded-2xl flex items-center gap-3 ${darkMode ? "bg-[#202722]" : "bg-neutral-50 border border-neutral-100"}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-bold">
                      🔥
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 block font-medium">
                        Đã nạp
                      </span>
                      <span
                        className={`text-sm font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                      >
                        {totalConsumedCalories}{" "}
                        <span className="text-[10px] font-normal text-neutral-400">
                          kcal
                        </span>
                      </span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-2xl flex items-center gap-3 ${darkMode ? "bg-[#202722]" : "bg-neutral-50 border border-neutral-100"}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-sm font-bold">
                      🎯
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 block font-medium">
                        Mục tiêu
                      </span>
                      <span
                        className={`text-sm font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                      >
                        {targetCalories}{" "}
                        <span className="text-[10px] font-normal text-neutral-400">
                          kcal
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thanh Macros */}
                <div
                  className={`w-full mt-6 space-y-3 pt-4 border-t text-xs ${darkMode ? "border-neutral-800" : "border-neutral-100"}`}
                >
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span
                        className={
                          darkMode ? "text-neutral-200" : "text-neutral-700"
                        }
                      >
                        Carbs
                      </span>
                      <span className="text-neutral-400 font-medium">
                        {totalConsumedCarbs}/{targetCarbsGrams}g
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? "bg-neutral-800" : "bg-neutral-100"}`}
                    >
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (totalConsumedCarbs / targetCarbsGrams) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span
                        className={
                          darkMode ? "text-neutral-200" : "text-neutral-700"
                        }
                      >
                        Chất đạm
                      </span>
                      <span className="text-neutral-400 font-medium">
                        {totalConsumedProtein}/{targetProteinGrams}g
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? "bg-neutral-800" : "bg-neutral-100"}`}
                    >
                      <div
                        className="bg-[#10b981] h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (totalConsumedProtein / targetProteinGrams) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span
                        className={
                          darkMode ? "text-neutral-200" : "text-neutral-700"
                        }
                      >
                        Chất béo
                      </span>
                      <span className="text-neutral-400 font-medium">
                        {totalConsumedFat}/{targetFatGrams}g
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? "bg-neutral-800" : "bg-neutral-100"}`}
                    >
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (totalConsumedFat / targetFatGrams) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 8 Ly nước */}
              <div className="px-4 mt-5">
                <div
                  className={`p-4 rounded-3xl border transition-colors ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200/80 shadow-xs"}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 text-lg">💧</span>
                      <div>
                        <h3
                          className={`text-sm font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                        >
                          Uống nước
                        </h3>
                        <p className="text-[11px] text-neutral-400 font-medium">
                          {waterCount * 250}/2000 ml · 250 ml mỗi ly
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setWaterCount(0)}
                      className={`text-[11px] border px-2.5 py-1 rounded-lg transition-all ${
                        darkMode
                          ? "text-neutral-400 hover:text-white border-neutral-700/60"
                          : "text-neutral-500 hover:text-neutral-800 border-neutral-200"
                      }`}
                    >
                      ↺ Đặt lại
                    </button>
                  </div>

                  <div className="grid grid-cols-8 gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                      const isFilled = num <= waterCount;
                      return (
                        <button
                          key={num}
                          onClick={() =>
                            setWaterCount(num === waterCount ? num - 1 : num)
                          }
                          className={`h-11 rounded-xl transition-all flex items-end justify-center pb-1 font-bold text-[10px] ${
                            isFilled
                              ? "bg-blue-500 text-white shadow-sm shadow-blue-500/40"
                              : darkMode
                                ? "bg-neutral-800/80 text-neutral-500 hover:bg-neutral-800"
                                : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4 Bữa ăn */}
              <div className="px-4 mt-5 space-y-4">
                {[
                  {
                    key: "breakfast",
                    title: "Bữa Sáng",
                    time: "06:00 – 09:00",
                    items: mealLogs.breakfast,
                  },
                  {
                    key: "lunch",
                    title: "Bữa Trưa",
                    time: "11:00 – 13:00",
                    items: mealLogs.lunch,
                  },
                  {
                    key: "dinner",
                    title: "Bữa Tối",
                    time: "18:00 – 20:00",
                    items: mealLogs.dinner,
                  },
                  {
                    key: "snack",
                    title: "Bữa Phụ",
                    time: "Ăn nhẹ lành mạnh",
                    items: mealLogs.snack,
                  },
                ].map((meal) => {
                  const mealTotalCal = meal.items.reduce(
                    (s, i) => s + i.calories,
                    0,
                  );
                  return (
                    <div
                      key={meal.key}
                      className={`p-4 rounded-3xl border transition-colors ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200/80 shadow-xs"}`}
                    >
                      <div className="flex justify-between items-center mb-2.5">
                        <div>
                          <h4
                            className={`text-sm font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                          >
                            {meal.title}
                          </h4>
                          <span className="text-[10px] text-neutral-400">
                            {meal.time}
                          </span>
                        </div>
                        <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          {mealTotalCal} kcal
                        </span>
                      </div>

                      {meal.items.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {meal.items.map((food) => (
                            <div
                              key={food.id}
                              className={`p-2.5 rounded-2xl flex items-center justify-between ${darkMode ? "bg-[#202722]" : "bg-neutral-50 border border-neutral-100"}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg overflow-hidden">
                                  {food.image ? (
                                    <img
                                      src={food.image}
                                      alt={food.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    food.icon || "🥗"
                                  )}
                                </div>
                                <div>
                                  <p
                                    className={`text-xs font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                                  >
                                    {food.name}
                                  </p>
                                  <p className="text-[10px] text-neutral-400">
                                    {food.grams}g · {food.protein}g đạm ·{" "}
                                    {food.carbs}g carbs
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-bold text-emerald-500">
                                  +{food.calories}
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteFood(meal.key, food.id)
                                  }
                                  className="text-neutral-400 hover:text-red-500 text-sm px-1"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setSelectedMealSlot(meal.key);
                          setActiveTab("food");
                        }}
                        className={`w-full py-2 rounded-2xl border border-dashed text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                          darkMode
                            ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            : "border-emerald-500/40 text-emerald-600 hover:bg-emerald-50/50"
                        }`}
                      >
                        + Thêm món
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Nút tròn (+) */}
              <div className="fixed bottom-20 right-6 max-w-md z-20">
                <button
                  onClick={() => setActiveTab("food")}
                  className="w-12 h-12 rounded-full bg-[#10b981] hover:bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/40 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: THỰC PHẨM ===================== */}
          {activeTab === "food" && (
            <div>
              <div className="bg-[#10b981] px-5 pt-7 pb-8 rounded-b-[36px] shadow-sm text-white">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Thực phẩm
                </h1>
                <p className="text-white/95 text-xs mt-1">
                  Chọn món và tính khẩu phần theo gram ·{" "}
                  {selectedMealSlot === "breakfast"
                    ? "Bữa Sáng"
                    : selectedMealSlot === "lunch"
                      ? "Bữa Trưa"
                      : selectedMealSlot === "dinner"
                        ? "Bữa Tối"
                        : "Bữa Phụ"}
                </p>

                <div className="mt-4 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 text-xs">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={foodSearchQuery}
                    onChange={(e) => setFoodSearchQuery(e.target.value)}
                    placeholder="Tìm phở, ức gà, bánh mì, bún bò, rau..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white rounded-full text-xs text-neutral-900 placeholder-neutral-400 shadow-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Nút lọc nhóm */}
              <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFoodCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      activeFoodCategory === cat
                        ? "bg-[#10b981] text-white shadow-xs"
                        : darkMode
                          ? "bg-[#202722] text-neutral-300 border border-neutral-700/60"
                          : "bg-white text-neutral-600 border border-neutral-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Danh sách món ăn */}
              <div className="px-4 space-y-2.5 mt-1">
                {filteredFoodList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedFoodForPortion(item)}
                    className={`p-3 rounded-2xl flex items-center justify-between border cursor-pointer transition-all active:scale-[0.99] ${
                      darkMode
                        ? "bg-[#181c19] border-neutral-800 hover:border-emerald-500/60"
                        : "bg-white border-neutral-200/80 hover:border-emerald-400 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl shadow-inner overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.icon || "🥗"
                        )}
                      </div>
                      <div>
                        <h3
                          className={`text-sm font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                        >
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {item.protein}g đạm · {item.carbs}g carbs · {item.fat}
                          g béo / 100g
                        </p>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <span className="text-base font-extrabold text-[#10b981]">
                        {item.calories}
                      </span>
                      <p className="text-[10px] text-neutral-400">kcal/100g</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 3: THỰC ĐƠN AI ===================== */}
          {activeTab === "ai" && (
            <div>
              <div className="bg-[#10b981] px-5 pt-7 pb-8 rounded-b-[36px] shadow-sm text-white">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Thực đơn AI
                </h1>
                <p className="text-white/95 text-xs mt-1">
                  Cá nhân hóa theo bệnh lý & nhu cầu calo của bạn
                </p>
              </div>

              <div className="p-4 space-y-4">
                {/* Thẻ bệnh lý */}
                <div
                  className={`p-4 rounded-3xl border ${darkMode ? "bg-[#18231c] border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-900"}`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold">
                      Tình trạng ghi nhận:
                    </span>
                    <span className="text-[11px] font-bold bg-[#10b981] text-white px-2.5 py-0.5 rounded-full">
                      {profile.conditions.join(", ")}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    AI tự động lọc bỏ các nguyên liệu có tính axit, cay nóng,
                    dầu mỡ để bảo vệ sức khỏe và hỗ trợ thâm hụt mỡ lành mạnh.
                  </p>
                </div>

                {/* Khung yêu cầu */}
                <div
                  className={`p-4 rounded-3xl border space-y-3 ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200 shadow-xs"}`}
                >
                  <label
                    className={`text-xs font-bold block ${darkMode ? "text-white" : "text-neutral-700"}`}
                  >
                    Món không thích / Yêu cầu riêng:
                  </label>
                  <input
                    type="text"
                    value={aiDislikesInput}
                    onChange={(e) => setAiDislikesInput(e.target.value)}
                    placeholder="VD: không cay không nóng kh ăn rau..."
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                      darkMode
                        ? "bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500"
                        : "bg-white border-neutral-300 text-neutral-800"
                    }`}
                  />

                  <button
                    onClick={handleRegenerateAi}
                    disabled={isAiLoading}
                    className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-[0.99]"
                  >
                    {isAiLoading
                      ? "AI đang phân tích và tính toán..."
                      : "✨ AI tạo thực đơn mới"}
                  </button>
                  <p className="text-[10px] leading-relaxed text-neutral-400">
                    Khi tạo thực đơn, bệnh lý đã chọn, yêu cầu riêng và mục
                    tiêu calo sẽ được gửi tới Google Gemini. Tên, cân nặng và
                    chiều cao không được gửi. Theo điều khoản gói miễn phí,
                    Google có thể dùng nội dung để cải thiện sản phẩm. Gợi ý
                    dinh dưỡng chỉ mang tính tham khảo, không thay thế tư vấn y
                    tế.
                  </p>
                  {aiError && (
                    <p
                      role="alert"
                      className="text-xs text-red-500 font-medium"
                    >
                      {aiError}
                    </p>
                  )}
                </div>

                {/* Kết quả AI */}
                <div
                  className={`p-4 rounded-3xl border space-y-3.5 ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200 shadow-xs"}`}
                >
                  <div
                    className={`pb-3 border-b ${darkMode ? "border-neutral-800" : "border-neutral-100"}`}
                  >
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase">
                      Khuyến nghị từ CleanBite AI
                    </span>
                    <h3
                      className={`text-sm font-bold mt-2 ${darkMode ? "text-white" : "text-neutral-800"}`}
                    >
                      {generatedPlan.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                      {generatedPlan.note}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {generatedPlan.meals.map((meal, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl flex justify-between items-center ${darkMode ? "bg-[#202722]" : "bg-neutral-50 border border-neutral-100"}`}
                      >
                        <div>
                          <span className="text-[11px] font-bold text-emerald-500 block">
                            {meal.slot}
                          </span>
                          <p
                            className={`text-xs font-bold mt-0.5 ${darkMode ? "text-white" : "text-neutral-800"}`}
                          >
                            {meal.name}
                          </p>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            {meal.grams}g
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-[#10b981]">
                            {meal.calories} kcal
                          </span>
                          <span className="text-[10px] text-neutral-400 block">
                            {meal.protein}g đạm
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleImportAiPlanToDiary}
                    className="w-full py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 text-xs font-bold transition-all"
                  >
                    📥 Thêm cả ngày vào Nhật ký
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: CÁ NHÂN ===================== */}
          {activeTab === "profile" && (
            <div>
              <div className="bg-[#10b981] px-5 pt-7 pb-8 rounded-b-[36px] shadow-sm text-white">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Cá nhân
                </h1>
                <p className="text-white/95 text-xs mt-1">
                  Chỉ số cơ thể, mục tiêu dinh dưỡng và cài đặt
                </p>
              </div>

              <div className="p-4 space-y-4">
                {/* 4 Thẻ chỉ số */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`p-3.5 rounded-3xl border ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200 shadow-xs"}`}
                  >
                    <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                      BMI
                    </span>
                    <span
                      className={`text-2xl font-black mt-1 block ${darkMode ? "text-white" : "text-neutral-900"}`}
                    >
                      {bmiInfo.bmi}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-500 mt-0.5 block">
                      {bmiInfo.status}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-3xl border ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200 shadow-xs"}`}
                  >
                    <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                      BMR
                    </span>
                    <span
                      className={`text-2xl font-black mt-1 block ${darkMode ? "text-white" : "text-neutral-900"}`}
                    >
                      {dietInfo.bmr}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-500 mt-0.5 block">
                      Kcal/ngày
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-3xl border ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200 shadow-xs"}`}
                  >
                    <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                      Chiều cao
                    </span>
                    <span
                      className={`text-2xl font-black mt-1 block ${darkMode ? "text-white" : "text-neutral-900"}`}
                    >
                      {profile.height}
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5 block">
                      cm
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-3xl border ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200 shadow-xs"}`}
                  >
                    <span className="text-[10px] text-neutral-400 font-bold block uppercase">
                      Cân nặng
                    </span>
                    <span
                      className={`text-2xl font-black mt-1 block ${darkMode ? "text-white" : "text-neutral-900"}`}
                    >
                      {profile.weight}
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5 block">
                      kg
                    </span>
                  </div>
                </div>

                {/* Donut Chart & Sliders */}
                <div
                  className={`p-4 rounded-3xl border space-y-4 ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200 shadow-xs"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">⚡</span>
                    <h3
                      className={`text-sm font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                    >
                      Mục tiêu dinh dưỡng
                    </h3>
                  </div>

                  <div className="flex items-center justify-around py-2">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#f59e0b"
                          strokeWidth="9"
                          fill="transparent"
                          strokeDasharray="238.7"
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#10b981"
                          strokeWidth="9"
                          fill="transparent"
                          strokeDasharray="238.7"
                          strokeDashoffset={238.7 * (profile.carbsRatio / 100)}
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          stroke="#3b82f6"
                          strokeWidth="9"
                          fill="transparent"
                          strokeDasharray="238.7"
                          strokeDashoffset={
                            238.7 *
                            ((profile.carbsRatio + profile.proteinRatio) / 100)
                          }
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span
                          className={`text-2xl font-black ${darkMode ? "text-white" : "text-neutral-900"}`}
                        >
                          216g
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          mỗi ngày
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span
                          className={
                            darkMode ? "text-neutral-300" : "text-neutral-600"
                          }
                        >
                          Carbs
                        </span>
                        <span
                          className={`font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                        >
                          {profile.carbsRatio}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                        <span
                          className={
                            darkMode ? "text-neutral-300" : "text-neutral-600"
                          }
                        >
                          Chất đạm
                        </span>
                        <span
                          className={`font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                        >
                          {profile.proteinRatio}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span
                          className={
                            darkMode ? "text-neutral-300" : "text-neutral-600"
                          }
                        >
                          Chất béo
                        </span>
                        <span
                          className={`font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                        >
                          {profile.fatRatio}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <div className="flex justify-between text-neutral-400 font-semibold mb-1">
                        <span>Carbs</span>
                        <span>
                          {profile.carbsRatio}% · {targetCarbsGrams}g
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        value={profile.carbsRatio}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            carbsRatio: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#10b981] bg-neutral-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-neutral-400 font-semibold mb-1">
                        <span>Chất đạm</span>
                        <span>
                          {profile.proteinRatio}% · {targetProteinGrams}g
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        value={profile.proteinRatio}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            proteinRatio: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#10b981] bg-neutral-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-neutral-400 font-semibold mb-1">
                        <span>Chất béo</span>
                        <span>
                          {profile.fatRatio}% · {targetFatGrams}g
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        value={profile.fatRatio}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            fatRatio: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#10b981] bg-neutral-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Bệnh lý */}
                <div
                  className={`p-4 rounded-3xl border space-y-3 ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200 shadow-xs"}`}
                >
                  <div>
                    <h3
                      className={`text-sm font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                    >
                      Tình trạng sức khoẻ
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      AI sẽ dùng thông tin này để lọc món phù hợp.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      ...new Set([
                        ...DEFAULT_CONDITIONS,
                        ...profile.conditions,
                      ]),
                    ].map((cond) => {
                      const isSelected = profile.conditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          onClick={() => {
                            if (isSelected) {
                              setProfile({
                                ...profile,
                                conditions: profile.conditions.filter(
                                  (c) => c !== cond,
                                ),
                              });
                            } else {
                              setProfile({
                                ...profile,
                                conditions: [...profile.conditions, cond],
                              });
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-[#10b981] text-white shadow-sm"
                              : darkMode
                                ? "bg-[#222824] text-neutral-300 border border-neutral-700/60"
                                : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={customConditionInput}
                      onChange={(e) => setCustomConditionInput(e.target.value)}
                      placeholder="Tự nhập bệnh lý / dị ứng khác..."
                      className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:border-emerald-500 ${
                        darkMode
                          ? "bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500"
                          : "bg-neutral-50 border-neutral-300 text-neutral-800"
                      }`}
                    />
                    <button
                      onClick={handleAddCustomCondition}
                      className="bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
                    >
                      + Thêm
                    </button>
                  </div>
                </div>

                {/* Cài đặt */}
                <div
                  className={`p-4 rounded-3xl border space-y-3.5 ${darkMode ? "bg-[#181c19] border-neutral-800" : "bg-white border-neutral-200 shadow-xs"}`}
                >
                  <div
                    onClick={() => setShowSetupModal(true)}
                    className="flex justify-between items-center cursor-pointer py-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-emerald-500 text-base">📏</span>
                      <span
                        className={`text-xs font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                      >
                        Cập nhật chỉ số
                      </span>
                    </div>
                    <span className="text-neutral-400 text-sm">›</span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-emerald-500 text-base">🔔</span>
                      <span
                        className={`text-xs font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                      >
                        Lịch nhắc uống nước
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setProfile({
                          ...profile,
                          waterReminder: !profile.waterReminder,
                        })
                      }
                      className={`w-10 h-5 rounded-full transition-colors relative ${profile.waterReminder ? "bg-[#10b981]" : "bg-neutral-300"}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-all absolute top-0.5 ${profile.waterReminder ? "right-0.5" : "left-0.5"}`}
                      />
                    </button>
                  </div>

                  {/* Switch chế độ tối */}
                  <div className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-emerald-500 text-base">🌙</span>
                      <span
                        className={`text-xs font-bold ${darkMode ? "text-white" : "text-neutral-800"}`}
                      >
                        Chế độ tối
                      </span>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${darkMode ? "bg-[#10b981]" : "bg-neutral-300"}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-all absolute top-0.5 ${darkMode ? "right-0.5" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== MODAL CHỌN KHẨU PHẦN THEO GRAM ===================== */}
        {selectedFoodForPortion && (
          <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
            <div
              className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border-t sm:border space-y-4 animate-in slide-in-from-bottom duration-200 ${
                darkMode
                  ? "bg-[#181c19] text-white border-neutral-700"
                  : "bg-white text-neutral-800 border-neutral-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl shadow-inner overflow-hidden">
                    {selectedFoodForPortion.image ? (
                      <img
                        src={selectedFoodForPortion.image}
                        alt={selectedFoodForPortion.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedFoodForPortion.icon || "🥗"
                    )}
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-sm ${darkMode ? "text-white" : "text-neutral-900"}`}
                    >
                      {selectedFoodForPortion.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Gốc: {selectedFoodForPortion.calories} kcal / 100g
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFoodForPortion(null)}
                  className="text-neutral-400 hover:text-neutral-600 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div>
                <label
                  className={`text-xs font-bold block mb-1.5 ${darkMode ? "text-neutral-300" : "text-neutral-700"}`}
                >
                  Thêm vào bữa ăn:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "breakfast", label: "Sáng" },
                    { id: "lunch", label: "Trưa" },
                    { id: "dinner", label: "Tối" },
                    { id: "snack", label: "Phụ" },
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedMealSlot(slot.id)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedMealSlot === slot.id
                          ? "bg-[#10b981] text-white border-emerald-500 shadow-xs"
                          : darkMode
                            ? "bg-neutral-800 text-neutral-300 border-neutral-700"
                            : "bg-neutral-100 text-neutral-600 border-neutral-200"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span
                    className={`font-bold ${darkMode ? "text-neutral-300" : "text-neutral-700"}`}
                  >
                    Khối lượng thực tế:
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={portionGrams}
                      onChange={(e) => setPortionGrams(e.target.value)}
                      className={`w-16 px-2 py-1 text-center font-bold text-emerald-500 border rounded-lg text-sm focus:outline-none ${
                        darkMode
                          ? "bg-neutral-900 border-neutral-700"
                          : "bg-neutral-50 border-neutral-300"
                      }`}
                    />
                    <span className="text-neutral-400 font-medium">gram</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={portionGrams}
                  onChange={(e) => setPortionGrams(e.target.value)}
                  className="w-full accent-[#10b981] bg-neutral-200 h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-600">
                  Năng lượng nạp vào:
                </span>
                <span className="text-lg font-black text-emerald-600">
                  +
                  {calculateGrams(
                    selectedFoodForPortion.calories,
                    Number(portionGrams),
                  )}{" "}
                  kcal
                </span>
              </div>

              <button
                onClick={handleConfirmAddFood}
                className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-emerald-500/30 active:scale-[0.99]"
              >
                Xác nhận thêm vào Bữa ăn
              </button>
            </div>
          </div>
        )}

        {/* ===================== MODAL THIẾT LẬP HỒ SƠ ===================== */}
        {showSetupModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div
              className={`w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl border ${
                darkMode
                  ? "bg-[#181c19] text-white border-neutral-700"
                  : "bg-white text-neutral-800 border-neutral-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3
                  className={`font-bold text-base ${darkMode ? "text-white" : "text-neutral-900"}`}
                >
                  Cập nhật hồ sơ sức khoẻ
                </h3>
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) =>
                      setProfile({ ...profile, weight: Number(e.target.value) })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                      darkMode
                        ? "bg-neutral-900 border-neutral-700 text-white"
                        : "bg-neutral-50 border-neutral-300 text-neutral-800"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) =>
                      setProfile({ ...profile, height: Number(e.target.value) })
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                      darkMode
                        ? "bg-neutral-900 border-neutral-700 text-white"
                        : "bg-neutral-50 border-neutral-300 text-neutral-800"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1 font-semibold">
                  Bệnh lý chính
                </label>
                <select
                  value={profile.conditions[0] || "Đau dạ dày"}
                  onChange={(e) =>
                    setProfile({ ...profile, conditions: [e.target.value] })
                  }
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                    darkMode
                      ? "bg-neutral-900 border-neutral-700 text-white"
                      : "bg-neutral-50 border-neutral-300 text-neutral-800"
                  }`}
                >
                  {DEFAULT_CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setShowSetupModal(false);
                  setActiveTab("profile");
                }}
                className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md shadow-emerald-500/30"
              >
                Hoàn tất & Xem hồ sơ cá nhân
              </button>
            </div>
          </div>
        )}

        {/* ===================== BOTTOM NAVIGATION (4 TABS) ===================== */}
        <nav
          className={`fixed bottom-0 w-full max-w-md border-t px-4 py-2 flex justify-between items-center z-30 transition-colors ${
            darkMode
              ? "bg-[#121212]/95 border-neutral-800 backdrop-blur"
              : "bg-white/95 border-neutral-200 backdrop-blur"
          }`}
        >
          {[
            { id: "journal", label: "Nhật ký", icon: "📝" },
            { id: "food", label: "Thực phẩm", icon: "🍴" },
            { id: "ai", label: "Thực đơn AI", icon: "✨" },
            { id: "profile", label: "Cá nhân", icon: "👤" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center flex-1 py-1 transition-all ${
                activeTab === tab.id
                  ? "text-[#10b981] font-black scale-105"
                  : darkMode
                    ? "text-neutral-500 hover:text-neutral-300 font-medium"
                    : "text-neutral-400 hover:text-neutral-600 font-medium"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
