import { BlockProps } from '#adomin/cms/utils/cms.types'
import { Html } from '@kitajs/html'

export type PokemonBlockProps = BlockProps<{
  pokemonId: number
  description: string
  pokemonName: string
}>

export const PokemonBlock = ({ pokemonName, description, pokemonId }: PokemonBlockProps) => {
  return (
    <div class="tab-content">
      <h2>{pokemonName}</h2>
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
        alt={pokemonName}
      />
      <p>{description}</p>
    </div>
  )
}
