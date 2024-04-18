import { LucidRow } from '@adonisjs/lucid/types/model'
import type { ColumnConfig } from '../create_model_view_config.js'

// Fake Attachment until attchmentLite ships to v6
export type AttachmentContract = any
export const Attachment = { fromFile: (_o: unknown) => null }

export const loadFilesForInstances = async (fields: ColumnConfig[], modelInstances: LucidRow[]) => {
  const filesColumn = fields.filter(
    ({ adomin }) => adomin.type === 'file' && adomin.subType === 'attachment'
  )

  const promises = modelInstances.flatMap(async (modelInstance) => {
    const innerPromises = filesColumn.map(async ({ name }) => {
      // @ts-expect-error
      const attachment: AttachmentContract | undefined = modelInstance[name]
      if (!attachment || typeof attachment.url === 'string') return
      const url = await attachment.getUrl()
      attachment.url = url
    })

    await Promise.all(innerPromises)
  })

  await Promise.all(promises)
}
