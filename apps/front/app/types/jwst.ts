export interface SpaceTelescopeImage {
  id: number;
  esaId: string;
  imgHash: string;
  title: string;
  constellationCode: string | null;
  fov: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
  credits: string;
  releaseDate: string;
  metadata: {
    imgSrc: string;
    imgFullSize: string;
  };
}
