/* eslint-disable no-restricted-imports */
import type { Awaitable } from '@sapphire/framework'
import { ScheduledTask as BaseScheduledTask, type ScheduledTasksKeys, type ScheduledTasksPayload } from '@sapphire/plugin-scheduled-tasks'
import { withSpan } from '#lib/util/tracing'
import { tracer } from './util'

export abstract class ScheduledTask<
  Task extends ScheduledTasksKeys = ScheduledTasksKeys,
  Options extends ScheduledTask.Options = ScheduledTask.Options,
> extends BaseScheduledTask<Task, Options> {
  constructor(context: ScheduledTask.LoaderContext, options: Options) {
    super(context, options)

    this.run = this.instrumentedRun(this.run.bind(this))
  }

  private instrumentedRun(
    fn: (payload: ScheduledTasksPayload<Task>) => Awaitable<unknown>,
  ): (payload: ScheduledTasksPayload<Task>) => Awaitable<unknown> {
    return async payload =>
      withSpan(`scheduled-task.${this.name}`, async (span) => {
        span.setAttributes({
          'scheduled-task.name': this.name,
          'scheduled-task.timezone': this.timezone,
        })

        if (typeof this.interval === 'number') {
          span.setAttributes({
            'scheduled-task.interval': this.interval,
          })
        }
        if (typeof this.pattern === 'string') {
          span.setAttributes({
            'scheduled-task.pattern': this.pattern,
          })
        }
        return fn(payload)
      }, tracer)
  }
}

export namespace ScheduledTask {
  export type Options = BaseScheduledTask.Options
  export type LoaderContext = BaseScheduledTask.LoaderContext
  export type JSON = BaseScheduledTask.JSON
  export type LocationJSON = BaseScheduledTask.LocationJSON
}
