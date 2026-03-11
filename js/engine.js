const PARAMETER_MAX_SCORE = 8;

function translateParam(param) {
  return PARAMETER_LABELS[param] || param;
}

function normalize(vector) {
  let sum = 0;

  PARAMETERS.forEach(param => {
    sum += Math.pow(vector[param] || 0, 2);
  });

  return Math.sqrt(sum);
}

function cosineSimilarity(user, profile) {
  let dot = 0;

  PARAMETERS.forEach(param => {
    dot += (user[param] || 0) * (profile[param] || 0);
  });

  const normUser = normalize(user);
  const normProfile = normalize(profile);

  if (normUser === 0 || normProfile === 0) return 0;

  return dot / (normUser * normProfile);
}

function closenessScore(user, profile) {
  let sum = 0;

  PARAMETERS.forEach(param => {
    const difference = Math.abs((user[param] || 0) - (profile[param] || 0));
    sum += 1 - (difference / PARAMETER_MAX_SCORE);
  });

  return sum / PARAMETERS.length;
}

function finalMatchScore(user, profile) {
  const cosine = cosineSimilarity(user, profile);
  const closeness = closenessScore(user, profile);

  return (cosine * 0.75) + (closeness * 0.25);
}

function calculateProfiles(userVector) {
  const results = [];

  programs.forEach(program => {
    program.profiles.forEach(profile => {
      const score = finalMatchScore(userVector, profile.vector);

      results.push({
        program,
        profile,
        score,
        percent: Math.round(score * 100)
      });
    });
  });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 3);
}

function getTopParameters(vector, count = 4) {
  return Object.entries(vector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => translateParam(key));
}

function getUserStrengths(vector, count = 4) {
  return Object.entries(vector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => translateParam(key));
}

function getMatchFactorDetails(user, profileVector, count = 4) {
  return PARAMETERS
    .map(param => {
      const userValue = user[param] || 0;
      const profileValue = profileVector[param] || 0;
      const matchValue = (Math.min(userValue, profileValue) * 2) - Math.abs(profileValue - userValue);

      return {
        key: param,
        label: translateParam(param),
        userValue,
        profileValue,
        matchValue
      };
    })
    .sort((a, b) => b.matchValue - a.matchValue)
    .slice(0, count);
}

function getProfileRequirements(profileVector, count = 4) {
  return Object.entries(profileVector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => translateParam(key));
}

function getGrowthZones(user, profileVector, count = 3) {
  const gaps = PARAMETERS
    .map(param => ({
      key: param,
      label: translateParam(param),
      gap: (profileVector[param] || 0) - (user[param] || 0)
    }))
    .filter(item => item.gap > 1)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, count)
    .map(item => item.label);

  return gaps.length ? gaps : ["Серьёзных разрывов не обнаружено."];
}

function getUserType(userVector) {
  const types = [
    {
      name: "Аналитический профиль",
      description: "Вам ближе работа с анализом, закономерностями, моделями и интерпретацией данных.",
      params: ["analytics", "data", "math", "research"]
    },
    {
      name: "Системно-инженерный профиль",
      description: "Вам ближе сложные системы, архитектурное мышление, техническая глубина и инженерные задачи.",
      params: ["systemsThinking", "technicalDepth", "programming", "hardware"]
    },
    {
      name: "Профиль информационной безопасности",
      description: "Вам ближе защита инфраструктуры, анализ уязвимостей и обеспечение безопасной работы систем.",
      params: ["security", "systemsThinking", "technicalDepth", "analytics"]
    },
    {
      name: "Прикладной разработчик цифровых сервисов",
      description: "Вам ближе создание прикладных программных решений, цифровых сервисов и пользовательских продуктов.",
      params: ["programming", "creativity", "systemsThinking", "businessOrientation"]
    },
    {
      name: "Бизнес-аналитический профиль",
      description: "Вам интересны информационные системы организаций, автоматизация процессов и цифровые решения для управления.",
      params: ["businessOrientation", "analytics", "leadership", "data"]
    },
    {
      name: "Креативно-технологический профиль",
      description: "Вам ближе визуальные технологии, интерфейсы, мультимедиа и интерактивные цифровые продукты.",
      params: ["creativity", "programming", "analytics", "systemsThinking"]
    }
  ];

  const evaluated = types.map(type => {
    const total = type.params.reduce((sum, param) => sum + (userVector[param] || 0), 0);
    return { ...type, total };
  });

  evaluated.sort((a, b) => b.total - a.total);
  return evaluated[0];
}

function buildRecommendation(userVector) {
  const topResults = calculateProfiles(userVector);
  const best = topResults[0];

  return {
    best,
    topResults,
    userType: getUserType(userVector),
    userStrengths: getUserStrengths(userVector),
    matchFactors: getMatchFactorDetails(userVector, best.profile.vector),
    profileRequirements: getProfileRequirements(best.profile.vector),
    growthZones: getGrowthZones(userVector, best.profile.vector),
    alternatives: topResults.slice(1),
    careers: best.profile.careers || [],
    firstSteps: best.profile.firstSteps || []
  };
}