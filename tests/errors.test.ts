// Run with: npm test  (Node >= 22.18, built-in test runner + type stripping)
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ApiRequestError,
  ERROR_MESSAGES,
  messageForStatus,
  toUserMessage,
} from '../src/api/errors.ts'

test('network failure (status 0) maps to connection message', () => {
  assert.equal(messageForStatus(0), ERROR_MESSAGES.network)
})

test('5xx maps to server message and never leaks English text', () => {
  for (const status of [500, 502, 503]) {
    const body = { error: 'Internal Server Error' }
    assert.equal(messageForStatus(status, 'login', body), ERROR_MESSAGES.server)
    assert.equal(messageForStatus(status, 'default', body), ERROR_MESSAGES.server)
  }
})

test('login 401 and invalid_credentials map to invalid credentials', () => {
  assert.equal(messageForStatus(401, 'login'), ERROR_MESSAGES.invalidCredentials)
  assert.equal(
    messageForStatus(401, 'login', { error: 'invalid_credentials' }),
    ERROR_MESSAGES.invalidCredentials,
  )
})

test('login 400 invalid_grant maps to invalid credentials', () => {
  assert.equal(
    messageForStatus(400, 'login', { error: 'invalid_grant' }),
    ERROR_MESSAGES.invalidCredentials,
  )
})

test('login 400 without error field (ProblemDetails) asks to check input', () => {
  assert.equal(messageForStatus(400, 'login'), ERROR_MESSAGES.checkInput)
  assert.equal(messageForStatus(400, 'login', {}), ERROR_MESSAGES.checkInput)
})

test('login 400 with another error code is not disguised as wrong password', () => {
  assert.equal(
    messageForStatus(400, 'login', { error: 'unsupported_grant_type' }),
    ERROR_MESSAGES.generic,
  )
})

test('429 maps to too-many-requests message in every context', () => {
  assert.equal(messageForStatus(429, 'login'), ERROR_MESSAGES.tooManyRequests)
  assert.equal(messageForStatus(429, 'default'), ERROR_MESSAGES.tooManyRequests)
})

test('403 maps to forbidden', () => {
  assert.equal(messageForStatus(403), ERROR_MESSAGES.forbidden)
  assert.equal(messageForStatus(403, 'login'), ERROR_MESSAGES.forbidden)
})

test('other statuses fall back to generic message', () => {
  assert.equal(messageForStatus(401), ERROR_MESSAGES.generic)
  assert.equal(messageForStatus(418, 'default', { error: 'teapot' }), ERROR_MESSAGES.generic)
  assert.equal(messageForStatus(400), ERROR_MESSAGES.generic)
})

test('non-login validation errors keep the server description', () => {
  assert.equal(
    messageForStatus(409, 'default', { error_description: 'Kod artıq mövcuddur' }),
    'Kod artıq mövcuddur',
  )
})

test('non-login bare error code is not shown to the user', () => {
  assert.equal(
    messageForStatus(400, 'default', { error: 'invalid_request' }),
    ERROR_MESSAGES.generic,
  )
  assert.equal(
    messageForStatus(404, 'default', { error: 'not_found' }),
    ERROR_MESSAGES.generic,
  )
})

test('toUserMessage maps unknown errors to generic message', () => {
  assert.equal(toUserMessage(new Error('Internal Server Error')), ERROR_MESSAGES.generic)
  assert.equal(toUserMessage('boom'), ERROR_MESSAGES.generic)
})

test('toUserMessage does not disguise TypeError as a network error', () => {
  // safeFetch already wraps fetch failures in ApiRequestError(status 0), so a
  // raw TypeError here is a code bug (e.g. undefined.map), not "no connection".
  assert.equal(toUserMessage(new TypeError('Load failed')), ERROR_MESSAGES.generic)
  assert.equal(
    toUserMessage(new TypeError("Cannot read properties of undefined (reading 'map')")),
    ERROR_MESSAGES.generic,
  )
})

test('toUserMessage shows network message for ApiRequestError with status 0', () => {
  const err = new ApiRequestError(messageForStatus(0), 0, 'Failed to fetch')
  assert.equal(toUserMessage(err), ERROR_MESSAGES.network)
})

test('toUserMessage passes through ApiRequestError message', () => {
  const err = new ApiRequestError(ERROR_MESSAGES.server, 500, '500 Internal Server Error')
  assert.equal(toUserMessage(err), ERROR_MESSAGES.server)
  assert.equal(err.status, 500)
})
