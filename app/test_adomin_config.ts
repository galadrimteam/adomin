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
import { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'
import { faker } from '@faker-js/faker'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { RIGHTS, RIGHTS_LABELS } from './rights.js'

const TABLE_OPTIONS = [
  { label: 'Utilisateurs', value: 'users' },
  { label: 'Idées', value: 'ideas' },
  { label: 'Profils', value: 'profiles' },
]

const TABLE_OPTIONS_LABEL_BY_VALUE = TABLE_OPTIONS.reduce(
  (acc, curr) => {
    acc[curr.value] = curr.label
    return acc
  },
  {} as Record<string, string>
)

export const USER_CONFIG = createModelViewConfig(() => User, {
  label: 'Utilisateur',
  counter: {
    label: "Nombre d'utilisateurs",
    dataFetcher: async () => {
      const [{ count }] = await db.from('users').count('* as count')

      return count
    },
  },
  columns: {
    settings: {
      type: 'json',
      label: 'Paramètres',
      nullable: true,
      sqlFilter: (input) => {
        if (!input) return 'true'

        return {
          sql: `settings->>'color' like '%' || ? || '%'`,
          bindings: [input],
        }
      },
      sqlSort: (ascDesc) => `settings->>'color' ${ascDesc}`,
      validation: vine.compile(
        vine.object({
          color: vine.string(),
          isBeautiful: vine.boolean(),
          age: vine.number().optional(),
        })
      ),
    },
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
    isBeautifull: {
      type: 'boolean',
      label: 'Beau',
      computed: true,
      sqlFilter: (input) => {
        if (input === null) return 'false'

        if (+input === 0) return `email != 'damien@galadrim.fr'`

        return `email = 'damien@galadrim.fr'`
      },
      sqlSort: (ascDesc) => `email = 'damien@galadrim.fr' ${ascDesc}`,
      sortable: true,
      filterable: true,
    },
    ideas: {
      type: 'hasManyRelation',
      label: 'Idées',
      modelName: 'Idea',
      labelFields: ['title'],
      allowRemove: true,
    },
    // idea: {
    //   type: 'hasOneRelation',
    //   label: 'Idée',
    //   labelFields: ['title'],
    //   modelName: 'Idea',
    //   nullable: true,
    // },
    friends: {
      type: 'manyToManyRelation',
      label: 'Amis',
      modelName: 'User',
      labelFields: ['email'],
      pivotTable: 'user_friends',
      pivotFkName: 'user_id',
      pivotRelatedFkName: 'friend_id',
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
  queryBuilderCallback: (q) => {
    q.preload('ideas')
  },
  // virtualColumns: [
  //   {
  //     name: 'virtualColumn',
  //     adomin: {
  //       type: 'string',
  //       label: 'Virtual column',
  //     },
  //     getter: async (model) => {
  //       return model.email
  //     },
  //     setter: async (model, value) => {
  //       console.log('Setter called for virtual column', model.id, value)
  //     },
  //   },
  // ],
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
    stringArrayTest: {
      type: 'array',
      label: 'Test array',
      options: async () => [
        { value: 'sun', label: 'Soleil' },
        { value: 'moon', label: 'Lune' },
        { value: 'mars', label: 'Mars' },
        { value: 'jupiter', label: 'Jupiter' },
        { value: 'saturn', label: 'Saturne' },
      ],
    },
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
    dateTest: {
      type: 'date',
      subType: 'date',
      defaultValue: { mode: 'now', plusDays: 2 },
    },
    datetimeTest: {
      type: 'date',
      subType: 'datetime',
      defaultValue: { mode: 'now', plusDays: 2 },
    },
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
  counter: {
    label: 'Idées à vérifier',
    dataFetcher: async () => {
      const [{ count }] = await db.from('ideas').where('is_checked', false).count('* as count')

      return count
    },
  },
  columns: {
    title: { type: 'string', label: 'Titre' },
    description: { type: 'string', label: 'Description', multiline: true },
    author: {
      type: 'belongsToRelation',
      modelName: 'User',
      label: 'Auteur',
      labelFields: ['email'],
      nullable: true,
    },
    isChecked: { type: 'boolean', label: 'Vérifié', creatable: false },
  },
  icon: 'bulb',
  globalActions: [
    {
      type: 'backend-action',
      name: 'add-random-idea',
      tooltip: 'Ajouter une idée random',
      icon: 'arrows-shuffle',
      iconColor: 'red',
      action: async () => {
        await Idea.create({
          title: faker.music.songName(),
          description: faker.lorem.sentence(),
        })

        return { message: 'Création effectuée' }
      },
    },
    {
      type: 'backend-action',
      name: 'delete-ideas-not-linked-to-user',
      tooltip: 'Supprimer les idées non liées à un utilisateur',
      icon: 'trash',
      iconColor: 'orange',
      action: async () => {
        await Idea.query().whereNull('userId').delete()

        return { message: 'Suppression effectuée' }
      },
    },
    {
      type: 'link',
      name: 'link-to-filtered-ideas',
      tooltip: 'Voir les idées filtrées',
      icon: 'link',
      iconColor: 'blue',
      href: '/backoffice/models/Idea?filters=%255B%257B%2522id%2522%253A%2522title%2522%252C%2522value%2522%253A%2522test%2522%257D%255D&sorting=%255B%257B%2522id%2522%253A%2522id%2522%252C%2522desc%2522%253Atrue%257D%255D',
    },
    {
      type: 'link',
      name: 'link-to-google',
      tooltip: 'Voir Google',
      icon: 'brand-google',
      iconColor: 'green',
      href: 'https://www.google.com',
      openInNewTab: true,
    },
  ],
  instanceActions: [
    {
      type: 'backend-action',
      name: 'duplicate-idea',
      tooltip: "Dupliquer l'idée",
      icon: 'copy',
      iconColor: 'brown',
      action: async (ctx) => {
        const idea = await Idea.findOrFail(ctx.params.id)

        await Idea.create({
          title: idea.title,
          description: idea.description,
          userId: idea.userId,
          isChecked: idea.isChecked,
        })

        return { message: 'Duplication effectuée' }
      },
    },
    {
      type: 'backend-action',
      name: 'check-idea',
      tooltip: "Vérifier l'idée",
      icon: 'check',
      iconColor: 'green',
      action: async (ctx) => {
        const idea = await Idea.findOrFail(ctx.params.id)

        idea.isChecked = true

        await idea.save()

        return { message: 'Vérification effectuée' }
      },
    },
  ],
})

const createFilterCallback = (startDate: DateTime, endDate: DateTime) => {
  return (q: DatabaseQueryBuilderContract) => {
    q.where('created_at', '>=', startDate.toJSDate()).where('created_at', '<=', endDate.toJSDate())
  }
}

export const STATS_CONFIG = createStatsViewConfig({
  name: 'kpis',
  label: 'Les super KPI',
  globalFilters: {
    startDate: {
      type: 'date',
      label: 'Date de début',
      subType: 'datetime',
      defaultValue: { mode: 'now', plusYears: -1 },
    },
    endDate: {
      type: 'date',
      label: 'Date de fin',
      subType: 'datetime',
      defaultValue: { mode: 'now' },
    },
  },
  stats: [
    {
      type: 'column',
      label: 'Création de ressources par jour de la semaine',
      name: 'testColumnChart2',
      options: {
        download: true,
      },
      dataFetcher: ({ tableName, startDate, endDate }) =>
        groupByDayOfWeek(tableName.toString(), 'created_at', {
          queryBuilderCallback: createFilterCallback(startDate, endDate),
        }),
      filters: {
        tableName: {
          type: 'enum',
          label: 'Nom de la ressource',
          options: TABLE_OPTIONS,
        },
      },
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
      dataFetcher: async ({ tableName1, tableName2, endDate, startDate }) => {
        const name1 = tableName1.toString()
        const name2 = tableName2.toString()
        const dataTable1 = await groupByHour(name1, 'created_at', {
          allHours: true,
          queryBuilderCallback: createFilterCallback(startDate, endDate),
        })
        const dataTable2 = await groupByHour(name2, 'created_at', {
          allHours: true,
          queryBuilderCallback: createFilterCallback(startDate, endDate),
        })

        return [
          {
            name: TABLE_OPTIONS_LABEL_BY_VALUE[name1],
            data: dataTable1,
            color: 'goldenrod',
          },
          {
            name: TABLE_OPTIONS_LABEL_BY_VALUE[name2],
            data: dataTable2,
            color: 'darkcyan',
          },
        ]
      },
      filters: {
        tableName1: {
          type: 'enum',
          label: 'Nom de la ressource 1',
          options: TABLE_OPTIONS,
          defaultValue: 'users',
        },
        tableName2: {
          type: 'enum',
          label: 'Nom de la ressource 2',
          options: TABLE_OPTIONS,
          defaultValue: 'ideas',
        },
      },
    },
    {
      type: 'area',
      label: 'Profils par date de création',
      name: 'profiles-by-creation-date',
      dataFetcher: ({ startDate, endDate }) =>
        groupByDate('profiles', 'created_at', {
          queryBuilderCallback: createFilterCallback(startDate, endDate),
        }),
      options: { thousands: ',', download: true },
      filters: {},
    },
    {
      type: 'pie',
      label: "Utilisateurs par tranche d'âge",
      name: 'users-by-age-range',
      dataFetcher: async ({ startDate, endDate }) => {
        const res = await db
          .from('profiles')
          .select(
            db.raw(
              'FLOOR(age / 10) * 10 as age_range_start, FLOOR(age / 10) * 10 + 9 as age_range_end'
            )
          )
          .where('created_at', '>=', startDate.toJSDate())
          .where('created_at', '<=', endDate.toJSDate())
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
      filters: {},
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
      filters: {},
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
      dataFetcher: async ({ directNumber }) => directNumber + 'h',
      filters: {
        directNumber: {
          type: 'number',
          defaultValue: 54,
        },
      },
    },
    {
      type: 'kpi',
      label: 's2',
      name: 's2',
      dataFetcher: async () => 88,
      options: { isPercentage: true },
      filters: {},
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
      filters: {},
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
