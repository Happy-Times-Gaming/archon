import type { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks'
import { Listener } from '#lib/sapphire'

export class ConnectError extends Listener<typeof ScheduledTaskEvents.ScheduledTaskStrategyConnectError> {
  public override run(error: unknown) {
    this.container.logger.error({
      err: error,
      context: 'scheduled-tasks',
    }, `Encountered an error when trying to connect to the Redis instance`)
  }
}
