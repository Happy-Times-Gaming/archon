import process from 'node:process'
import { diag } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

// const ignoreOutgoingUpgradeRequests = new Set(['gateway.discord.gg/'])

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'archon',
    [ATTR_SERVICE_VERSION]: import.meta.env.BUILD_SHA,
  }),
  instrumentations: [
    ...getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-net': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-dns': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-http': {
        ignoreOutgoingRequestHook: (req) => {
          const upgradeHeader = req.headers?.Upgrade ?? req.headers?.upgrade
          if (upgradeHeader !== undefined) {
            return upgradeHeader.toString().toLowerCase() === 'websocket'
          }
          return false
        },
      },
    }),
  ],
})

async function stopOtel() {
  try {
    await otelSDK.shutdown()
    diag.debug('OpenTelemetry SDK terminated')
  }
  catch (error) {
    diag.error('Error terminating OpenTelemetry SDK', error)
  }
}

otelSDK.start()
diag.info('OpenTelemetry instrumentation started successfully')

process.on('SIGINT', () => {
  stopOtel().catch(() => console.error)
})
process.on('SIGTERM', () => {
  stopOtel().catch(() => console.error)
})
