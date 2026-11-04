import type { Category, ColorKey, Size } from '../constants/clothing';
import type { Region } from '../constants/regions';
import type { CapturedPhotos } from '../components/camera/photoPolicy';

export type RegistrationDraft = {
  id: string;
  photos: CapturedPhotos;
  title: string;
  category: Category | null;
  size: Size | null;
  colors: ColorKey[];
  measurements: Record<string, string>;
  hasDefect: boolean | null;
  defectDescription: string;
  description: string;
  region: Region;
  unavailable: {start: number; end: number} | null;
  unavailableConfirmed: boolean;
  price: string;
  shippingAvailable: boolean;
  shippingFee: string;
  laundryBy: 'borrower' | 'owner';
};
