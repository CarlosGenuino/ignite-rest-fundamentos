import { it, beforeAll, beforeEach, afterAll, describe, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should create new transaction', async () => {
    // fazer a chamada http para criar uma nova transação
    await request(app.server)
      .post('/transactions')
      .send({ title: 'NEW TRANSACTION', amount: 5000, type: 'credit' })
      .expect(201)
  })

  it('should list all', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'NEW TRANSACTION', amount: 5000, type: 'credit' })
    const cookies = createTransactionResponse.get('Set-Cookie')
    if (cookies) {
      const listTransactionResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

      expect(listTransactionResponse.body.transactions).toEqual([
        expect.objectContaining({
          title: 'NEW TRANSACTION',
          amount: 5000,
        }),
      ])
    }
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'NEW TRANSACTION', amount: 5000, type: 'credit' })
    const cookies = createTransactionResponse.get('Set-Cookie')

    if (cookies) {
      const listTransactionResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

      const transactionId = listTransactionResponse.body.transactions[0].id

      const getTransactionResponse = await request(app.server)
        .get('/transactions/' + transactionId)
        .set('Cookie', cookies)

      expect(getTransactionResponse.body.transaction).toEqual(
        expect.objectContaining({
          title: 'NEW TRANSACTION',
          amount: 5000,
        }),
      )
    }
  })

  it('should be able to get Summary of account', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({ title: 'NEW TRANSACTION', amount: 5000, type: 'credit' })

    const cookies = createTransactionResponse.get('Set-Cookie')

    if (cookies) {
      await request(app.server)
        .post('/transactions')
        .send({ title: 'NEW DEBIT', amount: 2000, type: 'debit' })
        .set('Cookie', cookies)

      const summaryResponse = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookies)
        .expect(200)

      expect(summaryResponse.body.summary).toEqual({
        amount: 3000,
      })
    }
  })
})
