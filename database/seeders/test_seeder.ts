import TestFactory from '#database/factories/test_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await TestFactory.createMany(10000)
  }
}
