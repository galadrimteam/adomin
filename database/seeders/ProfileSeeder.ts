import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import ProfileFactory from 'Database/factories/ProfileFactory'

export default class extends BaseSeeder {
  public async run() {
    await ProfileFactory.createMany(10000)
  }
}
