import { createModelViewConfig } from "#adomin/create_model_view_config"
import Idea from "#models/idea"
import Profile from "#models/profile"
import User from "#models/user"
import db from "@adonisjs/lucid/services/db"
import vine from "@vinejs/vine"
import { DateTime } from "luxon"
import { RIGHTS, RIGHTS_LABELS } from "../rights.js"

export const USER_VIEW = createModelViewConfig(() => User, {
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
  virtualColumns: [{
    name: 'favoriteIdea',
    getter: async (model) => {
      const found = LOCAL_MAP.get(model.id)

      return found ?? null
    },
    setter: async (model, newValue) => {
      if (!newValue) {
        LOCAL_MAP.delete(model.id)
      } else {
        LOCAL_MAP.set(model.id, newValue)
      }
    },
    adomin: {
      type: 'enum',
      label: 'Idée favorite',
      options: async () => {
        const ideas = await Idea.query()

        return ideas.map((idea) => ({
          label: idea.title,
          value: idea.id.toString(),
        }))
      },
    }
  }]
})

export const LOCAL_MAP = new Map<number, string>()