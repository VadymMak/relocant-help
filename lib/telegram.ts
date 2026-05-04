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

export async function notifyAdmin(message: string): Promise<void> {
  await sendMessage(TELEGRAM_ADMIN_CHAT_ID, message)
}

export async function notifyNewArticle(articleId: number, title: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  await notifyAdmin(
    `📰 <b>New article for review</b>\n\n${title}\n\n<a href="${appUrl}/admin/articles">Review in admin</a>`
  )
}
