import Drive from '@ioc:Adonis/Core/Drive'
import Database from '@ioc:Adonis/Lucid/Database'
import fs from 'fs'
import { createModelViewConfig } from './Adomin/createModelViewConfig'
import { createStatsViewConfig } from './Adomin/createStatsViewConfig'
import { groupByDate, groupByDayOfWeek, groupByHour } from './Adomin/routes/stats/groupByHelpers'
import Idea from './Models/Idea'
import Profile from './Models/Profile'
import Test from './Models/Test'
import User from './Models/User'
import { RIGHTS, RIGHTS_LABELS } from './rights'

export const USER_CONFIG = createModelViewConfig(() => User, {
  label: 'Utilisateur',
  columns: {
    email: { type: 'string', isEmail: true, label: 'Super email' },
    password: { type: 'string', isPassword: true, label: 'Mot de passe' },
    profile: {
      type: 'belongsToRelation',
      modelName: 'Profile',
      labelFields: ['name', 'age'],
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
      label: 'Idées',
      modelName: 'Idea',
      labelFields: ['title'],
      creatable: false,
      editable: false,
    },
  },
  // queryBuilderCallback: (q) => {
  //   q.preload('ideas')
  // },
})

export const PROFILE_CONFIG = createModelViewConfig(() => Profile, {
  label: 'Profil',
  columns: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
})

export const TEST_CONFIG = createModelViewConfig(() => Test, {
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
      subType: 'attachment',
    },
    fileTest: { type: 'file', label: 'Contrat', subType: 'attachment' },
    fileUrl: {
      type: 'file',
      label: 'Fichier par url',
      subType: 'url',
      isImage: true,
      optional: true,
      createFile: async (file) => {
        const extname = file.extname ?? 'txt'
        const fileName = `${file.clientName}-${Date.now().toString().slice(-6)}.${extname}`
        const path = file.tmpPath

        if (!path) {
          throw new Error('No file path')
        }

        const buffer = fs.readFileSync(path)
        await Drive.put(fileName, buffer)

        return Drive.getUrl(fileName)
      },
      deleteFile: async (fileUrl) => {
        return Drive.delete(fileUrl)
      },
    },
  },
})

export const IDEA_CONFIG = createModelViewConfig(() => Idea, {
  columns: {
    title: { type: 'string', label: 'Titre' },
    description: { type: 'string', label: 'Description' },
    author: {
      type: 'belongsToRelation',
      modelName: 'User',
      label: 'Auteur',
      labelFields: ['email'],
    },
  },
})

export const STATS_CONFIG = createStatsViewConfig({
  path: 'kpis',
  label: 'Les super KPI',
  stats: [
    {
      type: 'column',
      label: "Création d'utilisateurs par jour de la semaine",
      name: 'testColumnChart2',
      dataFetcher: () => groupByDayOfWeek('users', 'created_at'),
    },
    {
      type: 'line',
      label: "Création d'utilisateurs vs idées par heure",
      name: 'users-vs-ideas-by-hour',
      options: {
        download: true,
        xtitle: 'Heure de la journée',
        ytitle: 'Quantité',
      },
      dataFetcher: async () => {
        const users = await groupByHour('users', 'created_at', { allHours: true })
        const ideas = await groupByHour('ideas', 'created_at', { allHours: true })

        return [
          {
            name: 'Utilisateurs',
            data: users,
            color: 'goldenrod',
          },
          {
            name: 'Idées',
            data: ideas,
            color: 'darkcyan',
          },
        ]
      },
    },
    {
      type: 'area',
      label: 'Profils par date de création',
      name: 'profiles-by-creation-date',
      dataFetcher: () => groupByDate('profiles', 'created_at'),
      options: { thousands: ',', download: true },
    },
    {
      type: 'pie',
      label: "Utilisateurs par tranche d'âge",
      name: 'users-by-age-range',
      dataFetcher: async () => {
        const res = await Database.from('profiles')
          .select(
            Database.raw(
              'FLOOR(age / 10) * 10 as age_range_start, FLOOR(age / 10) * 10 + 9 as age_range_end'
            )
          )
          .count('age as count')
          .groupByRaw('FLOOR(age / 10)')
          .orderBy('age_range_start', 'asc')

        const rows = res as { age_range_start: number; age_range_end: number; count: string }[]

        const data = rows.map(({ age_range_end, age_range_start, count }): [string, number] => [
          `${age_range_start} - ${age_range_end}`,
          +count,
        ])

        return data
      },
    },
  ],
})
