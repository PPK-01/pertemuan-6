export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  tile: 16,
  identity: 24,
  full: 999,
} as const;

export const layout = {
  minTouch: 44, // area sentuh minimum (NFR-04)
  maxContentWidth: 600, // lebar maksimum konten di tablet (NFR-01)
} as const;
