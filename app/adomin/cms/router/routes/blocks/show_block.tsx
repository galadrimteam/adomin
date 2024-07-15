import { ShowChildren } from '#adomin/cms/resources/components/show_children'
import { NotFound } from '#adomin/cms/resources/pages/not_found'
import { HttpContext } from '@adonisjs/core/http'
import { Html } from '@kitajs/html'
import { CMS_CONFIG } from '../../../cms_config.js'

const DEFAULT_WIDTH = 300
const DEFAULT_HEIGHT = 500

export const showBlock = async (ctx: HttpContext) => {
  const blockName = ctx.params.name
  const found = CMS_CONFIG.blocks.find((block) => block.name === blockName)
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
      {found.Component({ ...found.propsExample, gridIdentifier: Math.random().toString() })}
    </ShowChildren>
  )
}
