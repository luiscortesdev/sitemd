export interface CollectionItem {
    url: string;
    path: string;
}

export type Collections = Record<string, CollectionItem[]>

export type CollectionsGraph = Record<string, string[]>