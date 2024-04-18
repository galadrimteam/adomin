import Profile from '#models/profile'
import factory from '@adonisjs/lucid/factories'

const ProfileFactory = factory
  .define(Profile, ({ faker }) => {
    return {
      age: faker.number.int({ max: 100 }),
      name: faker.person.fullName(),
    }
  })
  .build()

export default ProfileFactory
