const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID!

const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

async function sendMessage(chatId: string, text: string): Promise<void> {
  await fetch(`${BASE_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  await sendMessage(chatId, text)
}

export async function notifyAdmin(message: string): Promise<void> {
  await sendMessage(TELEGRAM_ADMIN_CHAT_ID, message)
}

export async function notifyNewArticle(articleId: number, title: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  await notifyAdmin(
    `📰 <b>New article for review</b>\n\n${title}\n\n<a href="${appUrl}/admin/articles">Review in admin</a>`
  )
}

export async function sendTelegramArticleReview(
  chatId: string,
  article: {
    id: string
    titleUk?: string
    summaryUk?: string
    country: string
    relevanceScore: number
    url: string
  }
): Promise<void> {
  const text =
    `📰 <b>Нова стаття для перевірки</b>\n\n` +
    `🌍 Країна: ${article.country}\n` +
    `⭐ Релевантність: ${article.relevanceScore}/100\n\n` +
    `<b>${article.titleUk ?? 'No title'}</b>\n` +
    `${article.summaryUk ?? ''}\n\n` +
    `🔗 <a href="${article.url}">Оригінал</a>\n` +
    `✅ Схвалити: https://relocant.help/admin/articles/${article.id}`

  const keyboard = {
    inline_keyboard: [[
      { text: '✅ Опублікувати', callback_data: `approve:${article.id}` },
      { text: '❌ Відхилити', callback_data: `reject:${article.id}` },
    ]],
  }

  await fetch(`${BASE_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', reply_markup: keyboard }),
  })
}
