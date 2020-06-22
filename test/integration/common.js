const { createProbot } = require('probot')
const nock = require('nock')
const any = require('@travi/any')
const debugNock = require('debug')('nock')
const settingsBot = require('../../index')
const settings = require('../../lib/settings')

nock.disableNetConnect()

const repository = {
  default_branch: 'master',
  name: 'botland',
  owner: {
    name: 'bkeepers-inc',
    email: null
  }
}

function loadInstance () {
  const probot = createProbot({ id: 1, cert: 'test', githubToken: 'test' })
  probot.load(settingsBot)

  return probot
}

function initializeNock () {
  return nock('https://api.github.com').log(debugNock)
}

function teardownNock (githubScope) {
  expect(githubScope.isDone()).toBe(true)

  nock.cleanAll()
}

function buildPushEvent () {
  return {
    name: 'push',
    payload: {
      ref: 'refs/heads/master',
      repository,
      commits: [{ modified: [settings.FILE_NAME], added: [] }]
    }
  }
}

function buildRepositoryEditedEvent () {
  return {
    name: 'repository.edited',
    payload: {
      changes: { default_branch: { from: any.word() } },
      repository
    }
  }
}

function buildTriggerEvent () {
  return any.fromList([buildPushEvent(), buildRepositoryEditedEvent()])
}

module.exports = {
  loadInstance,
  initializeNock,
  teardownNock,
  buildTriggerEvent,
  buildRepositoryEditedEvent,
  repository
}
