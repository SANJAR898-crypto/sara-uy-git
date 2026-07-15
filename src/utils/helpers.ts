import { Region, District, Listing } from '../types';

export function getDistrictName(id: string, districts: District[]): string {
  return districts.find(d => d.id === id)?.name || "Noma'lum tuman";
}

export function getRegionName(id: string, regions: Region[]): string {
  return regions.find(r => r.id === id)?.name || "O'zbekiston";
}

export function getSimilarListings(listings: Listing[], currentId: string, dealType: 'sale' | 'rent'): Listing[] {
  return listings.filter(
    l => l.id !== currentId && l.status === 'approved' && l.dealType === dealType
  );
}

export function isUserProfileComplete(currentUser: any): boolean {
  if (!currentUser) return false;
  const fullName = currentUser.fullName;
  const phone = currentUser.phone || currentUser.phoneNumber;
  const verified = currentUser.phone_verified;
  
  const hasName = fullName && fullName !== 'Telegram User' && fullName.trim() !== '';
  const hasPhone = (phone || verified) && (phone || (verified ? 'verified' : '')).trim() !== '' && phone !== '+998 90 000 00 00';
  
  return !!(hasName && hasPhone);
}

export function compressAndProcessFile(
  file: File,
  onProcessed: (base64: string) => void
): void {
  const reader = new FileReader();
  reader.onloadend = () => {
    if (typeof reader.result === 'string') {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_DIMENSION = 1200;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          onProcessed(compressedBase64);
        } else {
          onProcessed(reader.result as string);
        }
      };
      img.src = reader.result;
    }
  };
  reader.readAsDataURL(file);
}
