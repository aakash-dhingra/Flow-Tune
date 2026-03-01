declare module 'ml-kmeans' {
    export interface KMeansOptions {
        initialization?: 'kmeans++' | 'random' | 'mostDistant';
        maxIterations?: number;
        tolerance?: number;
        seed?: number;
    }

    export interface KMeansResult {
        clusters: number[];
        centroids: number[][];
        iterations: number;
        error: number;
    }

    export function kmeans(
        data: number[][],
        k: number,
        options?: KMeansOptions
    ): KMeansResult;
}
