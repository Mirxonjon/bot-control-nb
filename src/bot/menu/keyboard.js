const adminKeyboardUZ = [
  [
    {
      text: "So‘rovnomalar",
    },
  ],
  [
    {
      text: "Statistika",
    },

    {
      text: `Xabar yuborish`,
    },
  ],
  [
    {
      text: "Grafik yuborish",
    },
    {
      text: `🇷🇺/🇺🇿 Tilni o‘zgartirish`,
    },
  ],
];
const adminKeyboardRu = [
  [
    {
      text: "Запросы",
    },
  ],
  [
    {
      text: "Статистика",
    },
    {
      text: "Отправит сообшения",
    },
  ],
  [
    {
      text: "Отправит график",
    },
    {
      text: `🇷🇺/🇺🇿 Сменить язык`,
    },
  ],
];

const userKeyboardUz = [
  [
    {
      text: `So‘rovnoma qoldirish`,
    },
    {
      text: `🇷🇺/🇺🇿 Tilni o‘zgartirish`,
    },
  ],
];

const userKeyboardRU = [
  [
    {
      text: `Оставить запрос`,
    },
    {
      text: `🇷🇺/🇺🇿 Сменить язык`,
    },
  ],
];

const listTeachersInArray = async (teachers) => {
  let keyboardTeachers = [];

  for (let i of teachers) {
    keyboardTeachers.push([
      {
        text: i.full_name,
      },
    ]);
  }

  return keyboardTeachers;
};
const listGroupsInArray = async (groups) => {
  let keyboardTeachers = [];

  for (let i of groups) {
    keyboardTeachers.push([
      {
        text: `${i?.level} - ${i?.days} - ${i?.time} - ${i?.room}`,
      },
    ]);
  }

  return keyboardTeachers;
};
const listGroups = async (groups) => {
  let keyboardTeachers = [];

  for (let i of groups) {
    keyboardTeachers.push({
      text: `${i?.level} - ${i?.days} - ${i?.time} - ${i?.room}`,
      id: i.sheet_id,
    });
  }

  return keyboardTeachers;
};

module.exports = {
  listGroups,
  adminKeyboardUZ,
  adminKeyboardRu,
  userKeyboardUz,
  userKeyboardRU,
  listTeachersInArray,
  listGroupsInArray,
};
