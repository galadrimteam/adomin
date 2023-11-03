import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LucidModel } from '@ioc:Adonis/Lucid/Orm'
import { getConfigFromLucidModel } from 'App/Adomin/routes/getModelConfig'
import { loadFilesForInstances } from 'App/Adomin/routes/handleFiles'
import { getValidatedModelConfig } from 'App/Adomin/routes/modelCrud/validateModelName'

const getDataList = async (Model: LucidModel, fieldsStrs: string[], primaryKey: string) => {
  const data = await Model.query()
    .select(...fieldsStrs)
    .orderBy(primaryKey, 'asc')

  return data
}

export const modelList = async ({ params }: HttpContextContract) => {
  const modelFound = await getValidatedModelConfig(params)
  const Model = modelFound.model()
  const { fields, primaryKey } = getConfigFromLucidModel(Model)

  if (fields.length === 0) return []

  const fieldsStrs = fields.map(({ name }) => name)
  const data = await getDataList(Model, fieldsStrs, primaryKey)

  await loadFilesForInstances(fields, data)

  return data
}
