const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export async function sendTelegramMessage(chatId: string, text: string) {
  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    }
  );
  return res.json();
}

export async function sendTelegramArticleReview(chatId: string, article: {
  id: string;
  titleUk?: string;
  summaryUk?: string;
  country: string;
  relevanceScore: number;
  url: string;
}) {
  const text =
    `📰 <b>Нова стаття для перевірки</b>\n\n` +
    `🌍 Країна: ${article.country}\n` +
    `⭐ Релевантність: ${article.relevanceScore}/100\n\n` +
    `<b>${article.titleUk || 'No title'}</b>\n` +
    `${article.summaryUk || ''}\n\n` +
    `🔗 <a href="${article.url}">Оригінал</a>\n` +
    `✅ Схвалити: https://relocant.help/admin/articles/${article.id}`;

  const keyboard = {
    inline_keyboard: [[
      { text: '✅ Опублікувати', callback_data: `approve:${article.id}` },
      { text: '❌ Відхилити', callback_data: `reject:${article.id}` },
      { text: '✏️ Редагувати', callback_data: `edit:${article.id}` },
    ]],
  };

  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: keyboard,
      }),
    }
  );
  return res.json();
}

// Handle Telegram callback (approve/reject from bot buttons)
export async function handleTelegramCallback(callbackQuery: {
  id: string;
  data: string;
  message: { chat: { id: number } };
}) {
  const [action, articleId] = callbackQuery.data.split(':');

  await fetch(`https://relocant.help/api/crawler/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articleId, action }),
  });

  // Answer callback to remove loading state
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQuery.id,
      text: action === 'approve' ? '✅ Опубліковано!' : '❌ Відхилено',
    }),
  });
}