export const features = {
  blog: process.env.NEXT_PUBLIC_FEATURE_BLOG === 'true',
  specialists: process.env.NEXT_PUBLIC_FEATURE_SPECIALISTS === 'true',
  testimonials: process.env.NEXT_PUBLIC_FEATURE_TESTIMONIALS === 'true',
  chat: process.env.NEXT_PUBLIC_FEATURE_CHAT === 'true',
}
