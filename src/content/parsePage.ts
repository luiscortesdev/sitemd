import fs from 'fs/promises'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import matter from "gray-matter"
import { unified } from 'unified'

import { rehypeCustomAttributes } from '../plugins/index.js'
import { logger } from '../utils/index.js'

import type { Parsed } from '../build/index.js'

function ensureValidString(value: any, fallback: string) {
    if (value && typeof value === typeof fallback && value.trim().length > 0) {
        return value.trim()
    } else {
        return fallback
    }
}

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

    logger.debug("PARSING: ", path)
    logger.debug(`FRONTMATTER DATA FOR ${path}: `, data)

    const html = String(await processor.process(content))
    
    // warn user of empty layouts
    if (!data.layout || data.layout.trim().length === 0) {
        logger.warning(`THE LAYOUT PROPERTY IN ${path} IS EMPTY. THE FRAMEWORK WILL INSTEAD USE default.njk LAYOUT.`)
    }

    // ensure empty strings or data are set to default values.    
    const processedData = {
        ...data,
        title: ensureValidString(data.title, "A SiteMD Page"),
        description: ensureValidString(data.description, "A page generated using SiteMD."),
        layout: ensureValidString(data.layout, "default"),
    }

    return {
        html,
        data: processedData,
    }
}