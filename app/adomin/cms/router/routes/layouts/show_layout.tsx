import { ShowChildren } from '#adomin/cms/resources/components/show_children'
import { NotFound } from '#adomin/cms/resources/pages/not_found'
import { HttpContext } from '@adonisjs/core/http'
import { Html } from '@kitajs/html'
import { CMS_CONFIG } from '../../../cms_config.js'
import { CmsPage } from '../../../utils/cms.types.js'

const DEFAULT_WIDTH = 300
const DEFAULT_HEIGHT = 500
const FAKE_CMS_PAGE: CmsPage = {
  id: 0,

  url: '/fake-url',
  title: 'Fake title',
  internal_label: 'Fake label',
  config: {
    layout: { name: 'fake-layout', props: {} },
    blocks: [],
    gridLayout: {
      sm: [],
      medium: null,
      large: null,
      xl: null,
    },
  },

  views: Math.floor(Math.random() * 1000),

  is_published: false,

  created_at: new Date(),
  updated_at: new Date(),
}

export const showLayout = async (ctx: HttpContext) => {
  const layoutName = ctx.params.name
  const found = CMS_CONFIG.layouts.find((layout) => layout.name === layoutName)
  const widthRaw = Number(ctx.request.qs().width ?? DEFAULT_WIDTH)
  const heightRaw = Number(ctx.request.qs().height ?? DEFAULT_HEIGHT)
  const noHud = Boolean(ctx.request.qs().noHud ?? false)

  const width = Number.isNaN(widthRaw) ? DEFAULT_WIDTH : widthRaw
  const height = Number.isNaN(heightRaw) ? DEFAULT_HEIGHT : heightRaw

  if (!found) {
    return <NotFound />
  }

  return (
    <ShowChildren width={width} height={height} title={found.name} withHud={!noHud}>
      {found.Component({
        ...found.propsExample,
        cmsPage: FAKE_CMS_PAGE,
        children: (
          <div
            style={{
              width: '100%',
              height: 'calc(100% - 40px)',
              minHeight: `${height - 50}px`,
              backgroundColor: 'black',
              display: 'flex',
            }}
          >
            <h1 style={{ margin: 'auto', color: 'white', textAlign: 'center' }}>
              Sample Layout children
            </h1>
          </div>
        ),
      })}
    </ShowChildren>
  )
}
