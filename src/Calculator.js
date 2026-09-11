// 1. Tính chỉ số BMI
export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);
  let status = "Cân đối";
  if (bmi < 18.5) status = "Gầy";
  else if (bmi >= 23) status = "Thừa cân";
  return { bmi, status };
}

// 2. Tính Calo tiêu hao (TDEE) & Calo mục tiêu giảm cân
export function calculateDiet(
  gender,
  weightKg,
  heightCm,
  age,
  activityLevel = 1.2,
) {
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr = gender === "Nam" ? bmr + 5 : bmr - 161;

  const tdee = Math.round(bmr * activityLevel);
  const targetCalories = tdee - 500; // Mặc định thâm hụt 500 calo để giảm mỡ

  return { bmr: Math.round(bmr), tdee, targetCalories };
}

// 3. Tính calo theo định lượng gram thực tế
export function calculateGrams(baseCaloriesPer100g, grams) {
  return Math.round((grams / 100) * baseCaloriesPer100g);
}
