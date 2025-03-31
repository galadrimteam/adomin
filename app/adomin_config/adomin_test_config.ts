import { AdominViewConfig } from '#adomin/adomin_config.types'
import { createFolderViewConfig } from '#adomin/create_folder_view_config'
import { createStatsViewConfig } from '#adomin/create_stats_view_config'
import { IDEA_VIEW } from './idea_view.js'
import { STATS_VIEW } from './stats_view.js'
import { TEST_VIEW } from './test_view.js'
import { PROFILE_CONFIG, USER_VIEW } from './user_view.js'

const FOLDER_ONE = createFolderViewConfig({
  label: 'Dossier 1',
  name: 'folder1',
  views: [STATS_VIEW, USER_VIEW],
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
  views: [TEST_VIEW, FOLDER_THREE],
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
  IDEA_VIEW,
  FOLDER_FOUR,
]
