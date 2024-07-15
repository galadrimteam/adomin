import type { CmsConfig } from '#adomin/cms/utils/cms.types'
import { createBlockConfig } from '#adomin/cms/utils/create_block_config'
import { createLayoutConfig } from '#adomin/cms/utils/create_layout_config'
import vine from '@vinejs/vine'
import { FillerComponent } from './filler.js'
import { PokemonBlock } from './pokemon_block.js'
import { PokemonImage } from './pokemon_image.js'
import { PokemonLayout } from './pokemon_layout.js'

export const SAMPLE_CMS_CONFIG: CmsConfig = {
  blocks: [
    createBlockConfig({
      name: 'content',
      Component: PokemonBlock,
      validation: {
        pokemonName: vine.string().trim(),
        description: vine.string().trim(),
        pokemonId: vine.number().min(1).max(151),
      },
      propsExample: {
        pokemonName: 'Diglett',
        pokemonId: 50,
        description:
          'Diglett is a Ground-type Pokémon. Diglett has a simplistic appearance, consisting of a small brown head with a large, pink, triangular nose.',
      },
    }),
    createBlockConfig({
      name: 'pokemon_image',
      Component: PokemonImage,
      validation: {
        pokemonId: vine.number(),
      },
      propsExample: {
        pokemonId: 50,
      },
    }),
    createBlockConfig({
      name: 'filler',
      Component: FillerComponent,
      validation: {},
      propsExample: {},
    }),
  ],
  layouts: [
    createLayoutConfig({
      name: 'pokemon_layout',
      Component: PokemonLayout,
      validation: {
        currentTab: vine.enum(['diglett', 'pikachu', 'charmander']),
      },
      propsExample: {
        currentTab: 'diglett',
      },
    }),
  ],
}
