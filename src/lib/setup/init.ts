import { install as sourceMapSupport } from 'source-map-support'
// import {
//   ApplicationCommandRegistries,
//   RegisterBehavior,
// } from '@sapphire/framework'
import '@sapphire/plugin-scheduled-tasks/register'

// ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
//   RegisterBehavior.BulkOverwrite,
// )

sourceMapSupport()
