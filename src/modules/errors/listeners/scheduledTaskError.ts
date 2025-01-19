import type { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks'
import { Listener } from '#lib/sapphire'
import type { ScheduledTask } from '#lib/sapphire/scheduledTask'

export class TaskError extends Listener<typeof ScheduledTaskEvents.ScheduledTaskError> {
  public override run(error: unknown, task: ScheduledTask) {
    const { name, location } = task
    this.container.logger.error({
      err: error,
      task: name,
      location: location.full,
      context: 'scheduled-tasks',
    }, 'Error executing scheduled task')
  }
}
