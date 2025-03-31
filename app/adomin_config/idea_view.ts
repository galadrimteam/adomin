import { createModelViewConfig } from "#adomin/create_model_view_config"
import Idea from "#models/idea"
import db from "@adonisjs/lucid/services/db"
import { faker } from "@faker-js/faker"

export const IDEA_VIEW = createModelViewConfig(() => Idea, {
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