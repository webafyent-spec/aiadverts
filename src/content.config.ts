import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    author: z.string().default('Aiadverts'),
    tags: z.array(z.string()).default([]),
    ogImage: z.string().default('/og-image.jpg')
  })
})

export const collections = { blog }
