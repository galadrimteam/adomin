import { createModelConfig } from './Adomin/createModelConfig'
import Idea from './Models/Idea'
import Profile from './Models/Profile'
import Test from './Models/Test'
import User from './Models/User'
import { RIGHTS, RIGHTS_LABELS } from './rights'

export const USER_CONFIG = createModelConfig(() => User, {
  label: 'Utilisateur',
  columns: {
    email: { type: 'string', isEmail: true, label: 'Super email' },
    password: { type: 'string', isPassword: true, label: 'Mot de passe' },
    profile: {
      type: 'belongsToRelation',
      modelName: 'Profile',
      labelFields: ['id', 'name', 'age'],
      label: 'Profil',
    },
    rights: {
      type: 'number',
      label: 'Roles',
      variant: {
        type: 'bitset',
        bitsetValues: RIGHTS,
        bitsetLabels: RIGHTS_LABELS,
      },
    },
    isBeautifull: { type: 'boolean', label: 'Beau', computed: true },
    ideas: {
      type: 'hasManyRelation',
      modelName: 'Idea',
      labelFields: ['title'],
      creatable: false,
      editable: false,
    },
  },
  queryBuilderCallback: (q) => {
    q.preload('ideas')
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
      nullable: true,
      type: 'enum',
      label: 'Test select',
      options: [
        { label: '(Non renseigné)', value: null },
        { label: 'Salut', value: 'hello' },
        { label: 'Au revoir', value: 'bye' },
      ],
    },
    dateTest: { type: 'date', subType: 'date', defaultValue: { mode: 'now', plusDays: 2 } },
    datetimeTest: { type: 'date', subType: 'datetime', defaultValue: { mode: 'now', plusDays: 2 } },
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

export const IDEA_CONFIG = createModelConfig(() => Idea, {
  columns: {
    title: { type: 'string', label: 'Titre' },
    description: { type: 'string', label: 'Description' },
    userId: {
      type: 'foreignKey',
      modelName: 'User',
      label: 'Auteur',
      labelFields: ['email'],
      showLabelInTable: true,
    },
  },
})
