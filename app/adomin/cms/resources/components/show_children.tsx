import { Html, PropsWithChildren } from '@kitajs/html'
import { HtmlBase } from './html_base.js'

export const ShowChildren = ({
  children,
  height,
  width,
  title,
  withHud,
}: PropsWithChildren<{
  width: number
  height: number
  title: string
  withHud?: boolean
}>) => {
  return (
    <HtmlBase title={title} bodyCss={{ overflow: 'hidden' }}>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: withHud ? '1rem' : undefined,
        }}
      >
        <div style={{ backgroundColor: 'white' }}>{children}</div>
        {withHud ? (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2>Essayer le bloc {title}</h2>
            <label for="width">Largeur</label>
            <input id="width" name="width" type="number" value={width.toString()} />
            <label for="height">Hauteur</label>
            <input id="height" name="height" type="number" value={height.toString()} />
            <button>Tester</button>
          </form>
        ) : null}
      </div>
    </HtmlBase>
  )
}
