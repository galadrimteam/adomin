import { clsx } from '#adomin/cms/utils/clsx'
import { LayoutProps } from '#adomin/cms/utils/cms.types'
import { Html } from '@kitajs/html'
import { HtmlBase } from '../components/html_base.js'

type PokemonName = 'diglett' | 'pikachu' | 'charmander'

const POKEMON_NAME_TO_ID: { [K in PokemonName]: number } = {
  diglett: 50,
  pikachu: 25,
  charmander: 5,
}

const getPokemonIcon = (name: PokemonName) => {
  const id = POKEMON_NAME_TO_ID[name]
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${id}.png`
}

export type PokemonLayoutProps = LayoutProps<{
  currentTab: PokemonName
}>

export const PokemonLayout = ({ children, cmsPage, currentTab }: PokemonLayoutProps) => {
  return (
    <HtmlBase title={cmsPage.title} iconSrc={getPokemonIcon(currentTab)}>
      <style>{getStyle()}</style>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div class="tabs">
          <a href="/" class={clsx('tab', currentTab === 'diglett' && 'active-tab')}>
            Diglett
          </a>
          <a href="/pikachu" class={clsx('tab', currentTab === 'pikachu' && 'active-tab')}>
            Pikachu
          </a>
          <a href="/charmander" class={clsx('tab', currentTab === 'charmander' && 'active-tab')}>
            Charmander
          </a>
        </div>
        <div style={{ flexGrow: 1 }}>{children}</div>
        <footer>
          <p>&copy; 2024 Pokémon Fan Site. All rights reserved.</p>
        </footer>
      </div>
    </HtmlBase>
  )
}

const getStyle = () => {
  return `
    * {
      margin: 0;
      padding: 0;
    }

    html,
    body {
      height: 100%;
      width: 100%;
    }

    body {
        font-family: Arial, sans-serif;
    }
    .tabs {
        display: flex;
        cursor: pointer;
        padding: 10px;
        background: #ccc;
    }
    a.tab {
        text-decoration: none;
        color: #333;
    }
    .tab {
        flex: 1;
        padding: 10px;
        text-align: center;
        background: #ddd;
        border: 1px solid #bbb;
        margin: 0 5px;
    }
    .tab-content {
        padding: 20px;
        border: 1px solid #bbb;
    }
    .active-tab {
        background: #fff;
    }
    .active-content {
        display: block;
    }
    footer {
        background: #333;
        color: #fff;
        text-align: center;
        padding: 10px 0;
        width: 100%;
    }
`
}
