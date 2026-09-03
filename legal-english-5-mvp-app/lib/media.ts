const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export const IMAGES = {
  landingOne: u("photo-1513475382585-d06e58bcb0e0"),
  landingTwo: u("photo-1454165804606-c3d57bc86b40"),
  landingThree: u("photo-1556761175-5973dc0f32e7"),
  login: u("photo-1507679799987-c73779587ccf"),
  sidebar: u("photo-1497366216548-37526070297c"),
  reviewOwner: u("photo-1560250097-0b93528c311a"),
  reviewMaria: u("photo-1522202176988-66273c2fd55f"),
  reviewAndres: u("photo-1521791136064-7986c2920216"),
  step1: u("photo-1544716278-ca5e3f4abd8c"),
  step2: u("photo-1434030216411-0b793f4b4173"),
  step3: u("photo-1512820790803-83ca734da794"),
  step4: u("photo-1554224155-6726b3ff858f"),
  step5: u("photo-1568992687947-868a62a9f521"),
  step6: u("photo-1497215728101-856f4ea42174"),
  planMonth: u("photo-1553729459-efe14ef6055d"),
  planYear: u("photo-1450101499163-c8848c66ca85"),
  heroPoster: u("photo-1541963463532-d68292c34b19"),
  heroSlideA: u("photo-1524995997946-a1c2e315a42f"),
  heroSlideB: u("photo-1481627834876-b7833e8f5570"),
  heroSlideC: u("photo-1507842217343-583bb7270b66"),
} as const;

export const HERO_VIDEO = "https://videos.pexels.com/video-files/3045163/3045163-hd_1280_720_30fps.mp4";

const TERM_BY_ID: Record<string, string> = {
  "CORP-003": u("photo-1524578271613-d550eacf6090"),
  "CORP-006": u("photo-1521791136064-7986c2920216"),
  "CORP-013": u("photo-1507679799987-c73779587ccf"),
  "CORP-016": u("photo-1554224155-6726b3ff858f"),
  "CORP-018": u("photo-1556761175-5973dc0f32e7"),
  "CORP-029": u("photo-1454165804606-c3d57bc86b40"),
};

const TERM_FALLBACKS = [
  u("photo-1521587760476-6c12a4b040da"),
  u("photo-1505664194779-8beaceb93744"),
  u("photo-1457369804613-52c61a468e7d"),
  u("photo-1463320726281-696a485928c7"),
  u("photo-1589829545856-d10d557cf95f"),
  u("photo-1497633762265-9d179a990aa6"),
  u("photo-1513475382585-d06e58bcb0e0"),
  u("photo-1481627834876-b7833e8f5570"),
];

export function cardImage(seed: string) {
  if (TERM_BY_ID[seed]) return TERM_BY_ID[seed];
  let hash = 0;
  for (const char of seed) hash = (hash + char.charCodeAt(0) * 17) % TERM_FALLBACKS.length;
  return TERM_FALLBACKS[Math.abs(hash) % TERM_FALLBACKS.length];
}
