import { readFile } from 'fs/promises'
import rehypeDocument from "rehype-document"
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

export async function parsePage(path: string) {
    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeDocument)
        .use(rehypeStringify)

    let file;
    try {
        file = await readFile(path, "utf-8")
    } catch (err) {
        console.error("ERROR READING FILE:", err)
        return "";
    }

    const parsedPage = await processor.process(file)

    return String(parsedPage)
}