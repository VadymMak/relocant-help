import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { routing } from '@/i18n/routing'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' })

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || `/${locale}`
  const pathWithoutLocale = pathname.replace(/^\/(uk|ru|en)/, '') || '/'

  return {
    title: 'Relocant Help',
    description: 'Help for relocants in Europe',
    alternates: {
      languages: {
        'uk': `https://relocant.help/uk${pathWithoutLocale}`,
        'ru': `https://relocant.help/ru${pathWithoutLocale}`,
        'x-default': `https://relocant.help/uk${pathWithoutLocale}`,
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'uk' | 'ru' | 'en')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className} style={{ background: 'var(--rh-bg)', margin: 0 }}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
