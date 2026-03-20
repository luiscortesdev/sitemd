export function paginate(items: any[], perPage: number) {
    const pages = []

    for (let i = 0; i < items.length; i += perPage) {
        pages.push(items.slice(i, i + perPage))
    }

    return pages
}