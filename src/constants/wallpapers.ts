export interface WallpaperOption {
  id: string;
  name: string;
  gradient: string;
  textColor: 'light' | 'dark';
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: 'ios18_default',
    name: 'iOS 18 Titanium',
    gradient: 'radial-gradient(ellipse at top left, #1e1b4b 0%, #0f172a 40%, #020617 100%)',
    textColor: 'light',
  },
  {
    id: 'ios18_amber',
    name: 'Desert Titanium',
    gradient: 'radial-gradient(circle at 30% 20%, #78350f 0%, #292524 50%, #0c0a09 100%)',
    textColor: 'light',
  },
  {
    id: 'ios18_blue',
    name: 'Deep Blue Nebula',
    gradient: 'linear-gradient(145deg, #1e3a8a 0%, #0c4a6e 50%, #030712 100%)',
    textColor: 'light',
  },
  {
    id: 'ios18_minimal',
    name: 'Dark Obsidian',
    gradient: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
    textColor: 'light',
  },
  {
    id: 'ios18_sunset',
    name: 'Sunset Glow',
    gradient: 'linear-gradient(160deg, #f43f5e 0%, #8b5cf6 50%, #1e1b4b 100%)',
    textColor: 'light',
  },
  {
    id: 'ios18_nature',
    name: 'Emerald Forest',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #022c22 100%)',
    textColor: 'light',
  },
];
