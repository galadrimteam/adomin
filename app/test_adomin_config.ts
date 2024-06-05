/* eslint-disable unicorn/no-await-expression-member */
import { AdominViewConfig } from '#adomin/adomin_config.types'
import { createFolderViewConfig } from '#adomin/create_folder_view_config'
import { createModelViewConfig } from '#adomin/create_model_view_config'
import { createStatsViewConfig } from '#adomin/create_stats_view_config'
import {
  groupByDate,
  groupByDayOfWeek,
  groupByHour,
} from '#adomin/routes/stats/helpers/group_by_helpers'
import Idea from '#models/idea'
import Profile from '#models/profile'
import Test from '#models/test'
import User from '#models/user'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { RIGHTS, RIGHTS_LABELS } from './rights.js'

export const USER_CONFIG = createModelViewConfig(() => User, {
  label: 'Utilisateur',
  columns: {
    email: { type: 'string', isEmail: true, label: 'Super email' },
    password: { type: 'string', isPassword: true, label: 'Mot de passe' },
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
    idea: {
      type: 'hasOneRelation',
      label: 'Idée',
      labelFields: ['title'],
      modelName: 'Idea',
      nullable: true,
    },
    createdAt: {
      type: 'date',
      subType: 'datetime',
      creatable: false,
      editable: false,
      label: 'Date de création',
      exportDataTransform: (date) => DateTime.fromISO(date).toFormat('dd/MM/yyyy'),
    },
  },
  // queryBuilderCallback: (q) => {
  //   q.preload('ideas')
  // },
  icon: 'user',
})

export const PROFILE_CONFIG = createModelViewConfig(() => Profile, {
  label: 'Profil',
  columns: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
  icon: 'id-badge-2',
})

export const TEST_CONFIG = createModelViewConfig(() => Test, {
  label: 'Test',
  columns: {
    stringArrayTest: { type: 'array' },
    freeText: { type: 'string', label: 'Texte libre' },
    stringTest: {
      nullable: true,
      type: 'enum',
      label: 'Test enum',
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

        mkdirSync(app.tmpPath('uploads'), { recursive: true })

        const uploadPath = app.tmpPath(`uploads/${fileName}`)

        copyFileSync(path, uploadPath)
        rmSync(path)

        return `/uploads/${fileName}`
      },
      deleteFile: async (fileUrl) => {
        return rmSync(fileUrl)
      },
    },
  },
  icon: 'test-pipe',
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
      nullable: true,
    },
  },
  icon: 'bulb',
})

export const STATS_CONFIG = createStatsViewConfig({
  name: 'kpis',
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
        const res = await db
          .from('profiles')
          .select(
            db.raw(
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
  icon: 'chart-bar',
})

const FOLDER_ONE = createFolderViewConfig({
  label: 'Dossier 1',
  name: 'folder1',
  views: [STATS_CONFIG, USER_CONFIG],
  icon: 'folder',
})

const FOLDER_THREE = createFolderViewConfig({
  label: 'Dossier 3',
  name: 'folder3',
  views: [PROFILE_CONFIG],
  icon: 'folder',
})

const FOLDER_TWO = createFolderViewConfig({
  label: 'Dossier 2',
  name: 'folder2',
  views: [TEST_CONFIG, FOLDER_THREE],
  icon: 'folder',
})

const FAKE_STATS_CONFIG = createStatsViewConfig({
  label: 'Fake stats',
  name: 'fakeStats',
  stats: [
    {
      type: 'line',
      label: 'Réservations par heure',
      name: 'reservations-by-hour',
      dataFetcher: async () => [
        ['00', 22],
        ['01', 9],
        ['02', 3],
        ['03', 1],
        ['04', 1],
        ['05', 0],
        ['06', 1],
        ['07', 49],
        ['08', 359],
        ['09', 3812],
        ['10', 4273],
        ['11', 1923],
        ['12', 400],
        ['13', 1361],
        ['14', 3148],
        ['15', 2282],
        ['16', 2265],
        ['17', 1711],
        ['18', 770],
        ['19', 164],
        ['20', 53],
        ['21', 63],
        ['22', 46],
        ['23', 34],
        ['24', 22],
      ],
    },
  ],
  icon: 'chart-bar',
})

const KPI_STATS_CONFIG = createStatsViewConfig({
  label: 'KPI stats',
  name: 'kpiStats',
  stats: [
    {
      type: 'kpi',
      label: 's1',
      name: 's1',
      dataFetcher: async () => '54h',
    },
    {
      type: 'kpi',
      label: 's2',
      name: 's2',
      dataFetcher: async () => 88,
      options: { isPercentage: true },
    },
    {
      type: 'column',
      label: 's3',
      name: 's3',
      dataFetcher: async () => [
        ['a', 15],
        ['b', 20],
        ['c', 44],
      ],
    },
  ],
  gridTemplateAreas: {
    normal: `"s1 s2"
             "s3 s3"`,
    sm: `"s1"
         "s2"
         "s3"`,
  },
  icon: 'chart-bar',
})

const FOLDER_FOUR = createFolderViewConfig({
  label: 'Dossier 4',
  name: 'folder4',
  views: [
    createFolderViewConfig({
      label: 'Dossier5',
      name: 'folder5',
      views: [
        createFolderViewConfig({
          label: 'Dossier 6',
          name: 'folder6',
          views: [FAKE_STATS_CONFIG, KPI_STATS_CONFIG],
          icon: 'folder',
        }),
      ],
      icon: 'folder',
    }),
  ],
  icon: 'folder',
})

export const ADOMIN_TEST_CONFIG: AdominViewConfig[] = [
  FOLDER_ONE,
  FOLDER_TWO,
  IDEA_CONFIG,
  FOLDER_FOUR,
]
