import Test from '#models/test'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'

const TestFactory = factory
  .define(Test, ({ faker }) => {
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
  })
  .build()

export default TestFactory
