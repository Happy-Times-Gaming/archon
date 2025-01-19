import type { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks'
import { Listener } from '#lib/sapphire'

export class WorkerError extends Listener<typeof ScheduledTaskEvents.ScheduledTaskStrategyWorkerError> {
  public override run(error: unknown) {
    this.container.logger.error({
      err: error,
      context: 'scheduled-tasks',
    }, 'BullMQ worker encountered an error')
  }
}
