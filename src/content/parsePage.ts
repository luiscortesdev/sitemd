import fs from 'fs/promises'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import matter from "gray-matter"
import { unified } from 'unified'

import { rehypeCustomAttributes } from '../plugins/index.js'

import type { Parsed } from '../build/index.js'

export async function parsePage(path: string): Promise<Parsed> {
    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeCustomAttributes)
        .use(rehypeStringify)

    const file = await fs.readFile(path, "utf-8")

    let { content, data } = matter(file)

    console.log("Parsing:", path)
    console.log("Frontmatter:", data)

    const html = String(await processor.process(content))
    
    const processedData = {
        title: data.title ?? "A SiteMD Page",
        description: data.description ?? "A page generated using SiteMD.",
        layout: data.layout ?? "default.njk",
        ...data,
    }

    return {
        html,
        data: processedData,
    }
}