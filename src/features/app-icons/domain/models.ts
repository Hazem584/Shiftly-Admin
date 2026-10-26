export interface AppIconAsset {
  key: string;
  name: string;
  sha256: string;
  imagePath: string;
  previewUrl: string;
  createdAt: string;
  sizeBytes: number;
}
export interface AppIconCatalog {
  revision: number;
  activeKey: string;
  icons: AppIconAsset[];
}
