export const RIGHTS = {
  DEFAULT: 0b0,
  SUPER_ADMIN: 0b1,
  CPI_GLOBAL: 0b10,
  CHECKPOINT: 0b100,
  // Other rights...
} as const

export type Right = keyof typeof RIGHTS

export const RIGHTS_LABELS: { [K in Right]: string } = {
  DEFAULT: 'Sans roles',
  CPI_GLOBAL: 'CPI Global',
  SUPER_ADMIN: 'Super Admin',
  CHECKPOINT: 'Checkpoint',
}

export const RIGHTS_KEYS = Object.keys(RIGHTS) as Right[]
