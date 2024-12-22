import process from 'node:process'
import { diag } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'

// const ignoreOutgoingUpgradeRequests = new Set(['gateway.discord.gg/'])

export const otelSDK = new NodeSDK({
  // sampler: new ErrorAwareSampler(0.001),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
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
