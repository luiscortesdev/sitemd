import fs from 'fs/promises'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import matter from "gray-matter"
import { rehypeCustomAttributes } from '../plugins/rehypeCustomAttributes.js'

export async function parsePage(path: string) {
    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeCustomAttributes)
        .use(rehypeStringify)

    const file = await fs.readFile(path, "utf-8")

    const { content, data } = matter(file)

    console.log("Parsing:", path)
    console.log("Frontmatter:", data)

    const html = String(await processor.process(content))

    return {
        html,
        data
    }
}