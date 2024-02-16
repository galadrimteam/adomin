export const RIGHTS = {
  DEFAULT: 0b0,
  SUPER_ADMIN: 0b1,
  ROLE_SYMPA: 0b10,
  ROLE_HORRIBLE: 0b100,
  // Other rights...
} as const

export type Right = keyof typeof RIGHTS

export const RIGHTS_LABELS: { [K in Right]: string } = {
  DEFAULT: 'Sans roles',
  ROLE_SYMPA: 'Role Sympa',
  SUPER_ADMIN: 'Super Admin',
  ROLE_HORRIBLE: 'Role Horrible',
}

export const RIGHTS_KEYS = Object.keys(RIGHTS) as Right[]
