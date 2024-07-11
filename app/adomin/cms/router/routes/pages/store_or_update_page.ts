import { HttpContext } from '@adonisjs/core/http'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { CMS_CONFIG } from '../../../cms_config.js'
import { filterNullValues } from '../../../utils/array.js'
import { DEFAULT_MESSAGE_PROVIDER_CONFIG } from '../../../utils/validation.js'
import { createPage, findPage, updatePage } from './pages_service.js'

const configObject = vine.object({
  blocks: vine.array(
    vine.object({
      name: vine.string().trim(),
      props: vine.any(),
      id: vine.string().trim(),
    })
  ),
  layout: vine.object({
    name: vine.string().trim(),
    props: vine.any(),
  }),
  gridLayout: vine.object({
    sm: vine.array(vine.array(vine.string().trim())),
    medium: vine.array(vine.array(vine.string().trim())).nullable(),
    large: vine.array(vine.array(vine.string().trim())).nullable(),
    xl: vine.array(vine.array(vine.string().trim())).nullable(),
  }),
})

const validationSchema = vine.compile(
  vine.object({
    internal_label: vine.string().trim(),
    url: vine.string().trim().startsWith('/'),
    title: vine.string().trim(),
    config: configObject,
    is_published: vine.boolean().optional(),
  })
)

const messagesProvider = new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG, {
  internal_label: 'label',
  url: 'url',
  title: 'titre',
})

type BlockPropValidation = {
  name: string
  gridIdentifier: string
  props: any
  validation: ReturnType<(typeof vine)['object']>
}

type LayoutPropValidation = {
  name: string
  props: any
  validation: ReturnType<(typeof vine)['object']>
}

const validateBlocks = async (blocks: BlockPropValidation[]) => {
  const promises = blocks.map(async (block): Promise<void> => {
    const schemaObject = vine.object({
      blocks: vine.array(block.validation.nullable()),
    })
    const schema = vine.compile(schemaObject)

    const blocksWithOrder = blocks.map(({ gridIdentifier }) =>
      gridIdentifier === block.gridIdentifier ? block.props : null
    )

    await schema.validate(
      { blocks: blocksWithOrder },
      {
        messagesProvider: new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG),
      }
    )
  })
  await Promise.all(promises)
}

const computeLastValidation = async (
  layout: LayoutPropValidation,
  blocks: BlockPropValidation[]
) => {
  await validateBlocks(blocks)

  const schemaObject = vine.object({
    layout: layout.validation,
  })
  const schema = vine.compile(schemaObject)
  const dataToValidate = {
    layout: layout.props,
  }
  const validated = schema.validate(dataToValidate, {
    messagesProvider: new SimpleMessagesProvider(DEFAULT_MESSAGE_PROVIDER_CONFIG),
  })

  return validated
}

export const storeOrUpdatePage = async (ctx: HttpContext) => {
  const pageId = ctx.params.id
  if (pageId) {
    const found = await findPage(+pageId, 'id')
    if (!found) return ctx.response.notFound({ error: 'Page introuvable' })
  }
  const mode = pageId ? 'update' : 'create'

  const validated = await validationSchema.validate(ctx.request.all(), { messagesProvider })

  let blockNotFound: string | null = null

  const blocksSchemas = validated.config.blocks.map((block) => {
    const found = CMS_CONFIG.blocks.find(({ name }) => name === block.name)

    if (!found) {
      blockNotFound = block.name
      return null
    }

    return {
      props: block.props,
      validation: found.propsValidation,
      name: block.name,
      gridIdentifier: block.props.gridIdentifier,
    }
  })

  if (blockNotFound !== null) {
    return ctx.response.notFound({
      error: `Le bloc '${blockNotFound}' n'existe pas`,
    })
  }

  const layoutValidation = CMS_CONFIG.layouts.find(
    ({ name }) => name === validated.config.layout.name
  )?.propsValidation

  if (!layoutValidation) {
    return ctx.response.notFound({
      error: `Le layout '${validated.config.layout.name}' n'existe pas`,
    })
  }

  const filteredSchemas = filterNullValues([...blocksSchemas])

  await computeLastValidation(
    {
      props: validated.config.layout.props,
      validation: layoutValidation,
      name: validated.config.layout.name,
    },
    filteredSchemas
  )

  if (mode === 'create') {
    const created = await createPage({
      ...validated,
      config: validated.config,
      is_published: validated.is_published ?? false,
    })

    return {
      message: 'Page créée',
      page: created,
    }
  }

  const updated = await updatePage({
    ...validated,
    config: validated.config,
    is_published: validated.is_published ?? false,
    id: pageId,
  })

  return {
    message: 'Page mise à jour',
    page: updated,
  }
}
