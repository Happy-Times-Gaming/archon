import type { Container, ILogger } from '@sapphire/framework'

export class ModerationService {
  readonly container: Container
  readonly logger: ILogger

  constructor(container: Container) {
    this.container = container
    this.logger = container.logger.child({ service: 'moderation' })
  }

  testMethod() {
    this.logger.info('test')
  }
}
