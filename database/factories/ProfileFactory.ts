import Factory from '@ioc:Adonis/Lucid/Factory'
import Profile from 'App/Models/Profile'

export default Factory.define(Profile, ({ faker }) => {
  return {
    age: faker.number.int({ max: 100 }),
    name: faker.person.fullName(),
  }
}).build()
