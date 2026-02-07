export interface AssetEntry {
    alias: string;
    src: string | string[];
    data?: Record<string, unknown>;
}

export interface AssetBundle {
    name: string;
    assets: AssetEntry[];
}

export interface AssetManifest {
    bundles: AssetBundle[];
}

export type ProgressCallback = (progress: number) => void;
