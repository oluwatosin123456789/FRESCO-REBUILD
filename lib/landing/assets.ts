export interface LandingAsset {
  id: string
  src: string
  alt: string
  width: number
  height: number
  desktopCrop: string
  mobileCrop: string
  priority: boolean
  source: string
  replacementPrompt: string
}

export const landingAssets = {
  hero_field: {
    id: 'hero_field',
    src: '/fresco-field.png',
    alt: 'Tomato field at golden hour with a wooden crate in the foreground',
    width: 1600,
    height: 1067,
    desktopCrop: 'center 30%',
    mobileCrop: 'center 40%',
    priority: true,
    source: 'Generated editorial asset for demo use',
    replacementPrompt: 'Replace with editorial photograph: smallholder tomato farm in Ikorodu, Lagos at golden hour, wooden crate foreground, warm haze, no watermarks or embedded text.',
  },
  scan_crate: {
    id: 'scan_crate',
    src: '/assets/scan-crate.svg',
    alt: 'Close crate of ripe tomatoes with warm side light',
    width: 900,
    height: 1100,
    desktopCrop: 'center',
    mobileCrop: 'center',
    priority: false,
    source: 'Generated placeholder · requires replacement',
    replacementPrompt: 'Replace with editorial close photograph of a crate of ripe tomatoes, shallow depth of field, warm side light.',
  },
  market_scene: {
    id: 'market_scene',
    src: '/assets/market-scene.svg',
    alt: 'Premium organized African produce market with tomatoes, peppers and greens',
    width: 1600,
    height: 900,
    desktopCrop: 'center',
    mobileCrop: 'center 50%',
    priority: false,
    source: 'Generated placeholder · requires replacement',
    replacementPrompt: 'Replace with editorial photograph of an organized African produce market: tomatoes, peppers and greens in crates.',
  },
  financial_backdrop: {
    id: 'financial_backdrop',
    src: '/assets/financial-backdrop.svg',
    alt: 'Quiet financial workspace with a business document in deep green atmosphere',
    width: 1600,
    height: 900,
    desktopCrop: 'center',
    mobileCrop: 'center 60%',
    priority: false,
    source: 'Generated placeholder · requires replacement',
    replacementPrompt: 'Replace with editorial photograph: dark walnut desk, business document, deep green quiet financial atmosphere.',
  },
  farmer_portrait: {
    id: 'farmer_portrait',
    src: '/assets/farmer-portrait.svg',
    alt: 'African female farmer in her late 30s holding a tomato crate',
    width: 800,
    height: 1000,
    desktopCrop: 'center 20%',
    mobileCrop: 'center 30%',
    priority: false,
    source: 'Generated placeholder · requires replacement',
    replacementPrompt: 'Replace with authentic editorial portrait: African female farmer, late 30s, holding a tomato crate, warm light.',
  },
  consumer_portrait: {
    id: 'consumer_portrait',
    src: '/assets/consumer-portrait.svg',
    alt: 'African male professional in his early 30s',
    width: 800,
    height: 1000,
    desktopCrop: 'center 20%',
    mobileCrop: 'center 30%',
    priority: false,
    source: 'Generated placeholder · requires replacement',
    replacementPrompt: 'Replace with authentic editorial portrait: African male professional, early 30s, approachable expression.',
  },
  analyst_portrait: {
    id: 'analyst_portrait',
    src: '/assets/analyst-portrait.svg',
    alt: 'African female financial analyst in a dark green blazer',
    width: 800,
    height: 1000,
    desktopCrop: 'center 20%',
    mobileCrop: 'center 30%',
    priority: false,
    source: 'Generated placeholder · requires replacement',
    replacementPrompt: 'Replace with authentic editorial portrait: African female financial analyst, late 20s, dark green blazer.',
  },
  produce_cutouts: {
    id: 'produce_cutouts',
    src: '/assets/produce-cutouts.svg',
    alt: 'Transparent produce cutouts of a tomato crate, pepper basket and greens bunch',
    width: 1200,
    height: 800,
    desktopCrop: 'center',
    mobileCrop: 'center',
    priority: false,
    source: 'Generated placeholder sheet · requires replacement',
    replacementPrompt: 'Replace with consistent photoreal transparent-background cutouts: tomato crate, pepper basket, greens bunch, sun-ripened tomato crate.',
  },
  newsletter_photos: {
    id: 'newsletter_photos',
    src: '/assets/newsletter-photo-stack.svg',
    alt: 'Three editorial farm photographs for the newsletter photo stack',
    width: 1200,
    height: 900,
    desktopCrop: 'center',
    mobileCrop: 'center',
    priority: false,
    source: 'Generated placeholder · requires replacement',
    replacementPrompt: 'Replace with three editorial farm photographs: field rows, crate close-up, market stall.',
  },
} as const satisfies Record<string, LandingAsset>

export type LandingAssetId = keyof typeof landingAssets