export interface Config {
    contentDir: string;
    outDir: string;
    layoutsDir: string;
    publicDir: string;

    site: {
        title: string;
        description?: string;
        url: string;
    }

    dev: {
        port: number
    }
}