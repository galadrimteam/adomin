/* eslint-disable unicorn/no-await-expression-member */
import { createModelViewConfig } from '#adomin/create_model_view_config'
import Test from '#models/test'
import app from '@adonisjs/core/services/app'
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'

export const TEST_VIEW = createModelViewConfig(() => Test, {
  label: 'Test',
  columns: {
    stringArrayTest: {
      type: 'array',
      label: 'Test array',
      options: async () => [
        { value: 'sun', label: 'Soleil' },
        { value: 'moon', label: 'Lune' },
        { value: 'mars', label: 'Mars' },
        { value: 'jupiter', label: 'Jupiter' },
        { value: 'saturn', label: 'Saturne' },
      ],
    },
    freeText: { type: 'string', label: 'Texte libre' },
    stringTest: {
      nullable: true,
      type: 'enum',
      label: 'Test enum',
      options: [
        { label: '(Non renseigné)', value: null },
        { label: 'Salut', value: 'hello' },
        { label: 'Au revoir', value: 'bye' },
      ],
    },
    dateTest: {
      type: 'date',
      subType: 'date',
      filterVariant: 'date',
      defaultValue: { mode: 'now', plusDays: 2 },
      size: 350,
    },
    datetimeTest: {
      type: 'date',
      subType: 'datetime',
      filterVariant: 'datetime',
      defaultValue: { mode: 'now', plusDays: 2 },
    },
    numberTest: { type: 'number' },
    booleanTest: { type: 'boolean', variant: 'switch' },
    fileUrl: {
      type: 'file',
      label: 'Fichier par url',
      subType: 'url',
      isImage: true,
      optional: true,
      createFile: async (file) => {
        const extname = file.extname ?? 'txt'
        const fileName = `${file.clientName}-${Date.now().toString().slice(-6)}.${extname}`
        const path = file.tmpPath

        if (!path) {
          throw new Error('No file path')
        }

        mkdirSync(app.tmpPath('uploads'), { recursive: true })

        const uploadPath = app.tmpPath(`uploads/${fileName}`)

        copyFileSync(path, uploadPath)
        rmSync(path)

        return `/uploads/${fileName}`
      },
      deleteFile: async (fileUrl) => {
        return rmSync(fileUrl)
      },
    },
  },
  icon: 'test-pipe',
})
