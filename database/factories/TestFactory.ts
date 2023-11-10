import Factory from '@ioc:Adonis/Lucid/Factory'
import TestFactory from 'App/Models/Test'
import { DateTime } from 'luxon'

export default Factory.define(TestFactory, ({ faker }) => {
  const options = ['hello', 'bye']

  return {
    freeText: faker.animal.insect(),
    numberTest: faker.number.int({ max: 100 }),
    booleanTest: faker.datatype.boolean(),
    stringTest: faker.helpers.arrayElement(options),
    dateTest: DateTime.fromJSDate(faker.date.future()),
  }
}).build()
