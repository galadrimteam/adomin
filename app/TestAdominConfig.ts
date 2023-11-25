import { createModelConfig } from './Adomin/createModelConfig'
import Profile from './Models/Profile'
import Test from './Models/Test'
import User from './Models/User'

export const USER_CONFIG = createModelConfig(() => User, {
  label: 'Utilisateur',
  columns: {
    email: { type: 'string', isEmail: true, label: 'Super email' },
    password: { type: 'string', isPassword: true, label: 'Mot de passe' },
    profileId: {
      type: 'foreignKey',
      modelName: 'Profile',
      labelFields: ['name'],
      searchFields: ['name'],
      nullable: true,
    },
  },
})

export const PROFILE_CONFIG = createModelConfig(() => Profile, {
  label: 'Profil',
  columns: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
})

export const TEST_CONFIG = createModelConfig(() => Test, {
  label: 'Test',
  columns: {
    // stringArrayTest: { type: 'array' },
    freeText: { type: 'string', label: 'Texte libre' },
    stringTest: {
      type: 'enum',
      label: 'Test select',
      options: [
        { label: 'Salut', value: 'hello' },
        { label: 'Au revoir', value: 'bye' },
      ],
    },
    dateTest: { type: 'date', subType: 'date', defaultValue: { mode: 'now', plusDays: 2 } },
    numberTest: { type: 'number' },
    booleanTest: { type: 'boolean', variant: 'switch' },
    imageTest: {
      type: 'file',
      label: 'Avatar',
      isImage: true,
      quality: 1,
      maxWidth: 100,
      maxHeight: 100,
    },
    fileTest: { type: 'file', label: 'Contrat' },
  },
})
