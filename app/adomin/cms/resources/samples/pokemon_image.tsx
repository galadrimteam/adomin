import { BlockProps } from '#adomin/cms/utils/cms.types'
import { Html } from '@kitajs/html'

export type PokemonImageProps = BlockProps<{ pokemonId: number }>

export const PokemonImage = ({ pokemonId }: PokemonImageProps) => {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
    >
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
        alt={'some pokemon image'}
      />
    </div>
  )
}
