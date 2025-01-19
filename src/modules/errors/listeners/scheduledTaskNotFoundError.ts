import type { ScheduledTaskEvents } from '@sapphire/plugin-scheduled-tasks'
import { Listener } from '#lib/sapphire'

export class TaskNotFoundError extends Listener<typeof ScheduledTaskEvents.ScheduledTaskNotFound> {
  public override run(task: string) {
    this.container.logger.error({ task, context: 'scheduled-tasks' }, 'Scheduled task not found')
  }
}
