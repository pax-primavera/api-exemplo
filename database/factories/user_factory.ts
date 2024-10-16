import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import Access from '#models/access'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullname: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      createdBy: faker.person.firstName(),
    }
  })
  .relation('access', () => factory.define(Access, async ({ faker }) => {
    return {
      route: 'user.create',
      createdBy: faker.person.firstName()
    }
  }).build()
  )
  .build()