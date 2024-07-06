import { Html } from '@kitajs/html'
import { HtmlBase } from '../components/html_base.js'

export const NotFound = () => {
  return (
    <HtmlBase title="404 - Page introuvable">
      <div
        class="container"
        style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <div class="content">
          <h1>404</h1>
          <p>Désolé, la page que vous recherchez n'existe pas</p>
          <a href="/">Retour à l'accueil</a>
        </div>
      </div>
    </HtmlBase>
  )
}
