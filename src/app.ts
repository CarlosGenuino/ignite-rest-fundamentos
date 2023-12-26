import fastify from 'fastify'
import { transactionRoutes } from './transactions/routes'
import fastifyCookie from '@fastify/cookie'

export const app = fastify()

app.register(fastifyCookie)

app.register(transactionRoutes, {
  prefix: 'transactions',
})
