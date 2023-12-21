import Factory from '@ioc:Adonis/Lucid/Factory'
import Test from 'App/Models/Test'
import { DateTime } from 'luxon'

export default Factory.define(Test, ({ faker }) => {
  const options = ['hello', 'bye']

  return {
    freeText: faker.animal.insect(),
    numberTest: faker.number.int({ max: 100 }),
    booleanTest: faker.datatype.boolean(),
    stringTest: faker.helpers.arrayElement(options),
    dateTest: DateTime.fromJSDate(faker.date.future()),
    // stringArrayTest: Array.from({ length: faker.number.int({ min: 0, max: 6 }) }, () =>
    //   faker.database.engine()
    // ),
  }
}).build()
