import type { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks'
import { Listener } from '#lib/sapphire'

export class ClientError extends Listener<typeof ScheduledTaskEvents.ScheduledTaskStrategyClientError> {
  public override run(error: unknown) {
    this.container.logger.error({
      err: error,
      context: 'scheduled-tasks',
    }, `Scheduled Task handler encountered an error`)
  }
}
