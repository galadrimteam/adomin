import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import TestFactory from 'Database/factories/TestFactory'

export default class extends BaseSeeder {
  public async run() {
    await TestFactory.createMany(10000)
  }
}
