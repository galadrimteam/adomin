import { Exception } from '@adonisjs/core/exceptions'
import { Html } from '@kitajs/html'
import { CMS_CONFIG } from '../cms_config.js'
import { BLOCK_ID_PREFIX } from '../resources/components/cms_bloc_grid.js'
import { BlockParams } from './cms.types.js'

export const getBlock = async (params: BlockParams) => {
  const found = CMS_CONFIG.blocks.find((block) => block.name === params.name)

  if (!found) {
    throw new Exception(`Block '${params.name}' not found`)
  }

  return (
    <div style={{ gridArea: BLOCK_ID_PREFIX + params.props.gridIdentifier }}>
      {found.Component(params.props)}
    </div>
  )
}
