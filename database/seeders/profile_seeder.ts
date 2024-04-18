import ProfileFactory from '#database/factories/profile_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ProfileFactory.createMany(10000)
  }
}
