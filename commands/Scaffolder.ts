import { BaseCommand, args } from '@adonisjs/core/build/standalone'
import { string } from '@ioc:Adonis/Core/Helpers'
import View from '@ioc:Adonis/Core/View'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { filterUndefinedOrNullValues } from 'App/Scaffolder/array'
import { FieldToScaffold, getFieldValidationRules } from 'App/Scaffolder/scaffolder'

import fs from 'fs/promises'

const ROOT_PATH = '..'
const VIEWS_PATH = `scaffolder`
// .rw-r--r--
const FILE_RIGHTS = 0o644

const CRUD_NAMES = ['create', 'read', 'update', 'destroy', 'list'] as const

type CrudNames = (typeof CRUD_NAMES)[number]

export default class Scaffolder extends BaseCommand {
  public static commandName = 'scaffold'

  public static description = 'Scaffold a new API controller for a Model'

  @args.string({
    description: 'Model name, or "auth" for scaffolding auth API',
    name: 'modelName',
  })
  public modelName: string

  // run `node ace generate:manifest` after changing this
  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    if (this.modelName === 'auth') {
      return this.createAuthApi()
    }

    const relativePath = `${ROOT_PATH}/app/Models/${this.modelName}`
    const LoadedModel = (await import(relativePath)).default

    await this.createController()

    const fieldsToValidate = this.getFieldsToValidate(LoadedModel)

    await this.createSchema(fieldsToValidate)

    await this.createCrudRoute('list')
    await this.createCrudRoute('destroy')
    await this.createCrudRoute('read')
    await this.createCrudRoute('create', fieldsToValidate)
    await this.createCrudRoute('update', fieldsToValidate)

    this.logger.success(`API scaffolded for ${this.modelName}`)
    this.logger.info(`Don't forget to run your formatter`)
    this.logger.info(`e.g. yarn format`)

    this.logger.info(`Don't forget to link the controller in your routes.ts file`)
    const controllerPath = `${this.modelPluralizedCamelCaseName}/${this.controllerFileName}`
    this.logger.info(
      `e.g. Route.resource('${this.modelPluralizedCamelCaseName}', '${controllerPath}')`
    )
  }

  private get controllerFileName() {
    return `${string.pluralize(this.modelName)}Controller`
  }

  private getFieldsToValidate(LoadedModel: typeof BaseModel) {
    const results = Array.from(LoadedModel.$columnsDefinitions.entries()).map(
      ([columnName, column]) => {
        if (column.meta?.scaffolder === undefined) {
          return null
        }

        return {
          name: columnName,
          ...column.meta.scaffolder,
        } as FieldToScaffold
      }
    )

    return filterUndefinedOrNullValues(results)
  }

  private get modelCamelCaseName() {
    return string.camelCase(this.modelName)
  }

  private get modelPluralizedCamelCaseName() {
    return string.pluralize(this.modelCamelCaseName)
  }

  private get crudNames() {
    const create = `store${this.modelName}`
    const read = `show${this.modelName}`
    const update = `update${this.modelName}`
    const destroy = `destroy${this.modelName}`
    const list = `${this.modelPluralizedCamelCaseName}List`

    return {
      folder: this.modelPluralizedCamelCaseName,
      create,
      read,
      update,
      destroy,
      list,
    }
  }

  private get folderPath() {
    const folder = `app/Controllers/Http/${this.modelPluralizedCamelCaseName}`

    return folder
  }

  private get schemaName() {
    return `${this.modelCamelCaseName}Schema`
  }

  private async createController() {
    const filePath = `${this.folderPath}/${this.controllerFileName}.ts`

    const text = await View.render(`${VIEWS_PATH}/controller`, { crudNames: this.crudNames })

    await fs.mkdir(this.folderPath, { recursive: true })
    await fs.writeFile(filePath, text, { encoding: 'utf-8', mode: FILE_RIGHTS })

    this.logger.action('create').succeeded(filePath)
  }

  private async createCrudRoute(crudName: CrudNames, fieldsToValidate: FieldToScaffold[] = []) {
    const fileName = this.crudNames[crudName]
    const filePath = `${this.folderPath}/${fileName}.ts`
    const dtoFields = fieldsToValidate.map((field) => field.name).join(',\n    ')

    const text = await View.render(`${VIEWS_PATH}/${crudName}`, {
      fileName,
      model: this.modelName,
      modelCamelCaseName: this.modelCamelCaseName,
      modelPluralizedCamelCaseName: this.modelPluralizedCamelCaseName,
      schemaName: this.schemaName,
      dtoFields,
    })

    await fs.writeFile(filePath, text, { encoding: 'utf-8', mode: FILE_RIGHTS })

    this.logger.action('create').succeeded(filePath)
  }

  private async createSchema(fieldsToValidate: FieldToScaffold[]) {
    const fileName = this.schemaName
    const filePath = `${this.folderPath}/${fileName}.ts`

    let fields = fieldsToValidate.map((field) => getFieldValidationRules(field)).join(',\n  ')

    if (fieldsToValidate.length > 0) fields += ','

    const text = await View.render(`${VIEWS_PATH}/schema`, {
      fileName,
      fields,
    })

    await fs.writeFile(filePath, text, { encoding: 'utf-8', mode: FILE_RIGHTS })

    this.logger.action('create').succeeded(filePath)
  }

  private async createAuthApi() {
    await fs.mkdir('app/Controllers/Http/auth', { recursive: true })

    await this.createAuthApiFile('AuthController')
    await this.createAuthApiFile('login')
    await this.createAuthApiFile('logout')
    await this.createAuthApiFile('register')
    await this.createAuthApiFile('changePassword')
    await this.createAuthApiFile('resetPassword')
    await this.createAuthApiFile('sendResetPasswordCode')
  }

  private async createAuthApiFile(fileName: string) {
    const filePath = `app/Controllers/Http/auth/${fileName}.ts`
    const text = await View.render(`${VIEWS_PATH}/auth/${fileName}`)

    await fs.writeFile(filePath, text, { encoding: 'utf-8', mode: FILE_RIGHTS })
    this.logger.action('create').succeeded(filePath)
  }
}
