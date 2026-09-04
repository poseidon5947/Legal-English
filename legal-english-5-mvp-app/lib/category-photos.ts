/** Editorial photo for each canonical MCD category (see public/home-assets/photos/CREDITS.txt). */
export const CATEGORY_PHOTO: Record<string, string> = {
  Contracts: "/home-assets/photos/category-contracts.jpg",
  "Corporate Law": "/home-assets/photos/category-corporate.jpg",
  "Employment Law": "/home-assets/photos/category-employment.jpg",
};

export function categoryPhoto(category: string): string {
  return CATEGORY_PHOTO[category] || "/home-assets/photos/mosaic-documents.jpg";
}
