const Groups = require("../../model/groups");
const { formatTime } = require("../../utils/time");

const sendNotification = async () => {
  const findGroups = await Groups.find({}).populate("teacher").lean();
  const FormatTime = formatTime(new Date());
  for (let e of findGroups) {
    if (e.time == FormatTime) {
      const text =
        e.teacher.language == "uz"
          ? `🤩Darsni boshlash vaqti keldi ! 
✏️${e?.level} - ${e?.days} - ${e?.time} - ${e?.room} 
`
          : `🤩Пришло время начать урок ! 
✏️${e?.level} - ${e?.days} - ${e?.time} - ${e?.room} 
`;
      bot.sendMessage(e.teacher.chatId, text, {
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [
            [
              {
                text: "✅",
                callback_data: `confirmL_true_${text}`,
              },
              {
                text: "❌",
                callback_data: `confirmL_false_${text}`,
              },
            ],
          ],
        },
      });
    }
  }
};

module.exports = {
  sendNotification,
};
