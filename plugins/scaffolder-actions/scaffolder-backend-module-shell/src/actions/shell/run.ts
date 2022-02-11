import {
  ContainerRunner,
} from '@backstage/backend-common';
import {
  createTemplateAction,
} from '@backstage/plugin-scaffolder-backend';

/**
 * Creates a `shell:run` Scaffolder action.
 *
 * @remarks
 *
 * @param options - Shell Configuration.
 * @public
 */
export function createShellRunAction(options: {
  containerRunner: ContainerRunner;
}) {
  const { containerRunner } = options;

  return createTemplateAction<{
    command: string
  }>({
    id: 'shell:run',
    description:
      'Runs an arbitrary command against the workspace.',
    schema: {
      input: {
        type: 'object',
        required: ['command'],
        properties: {
          command: {
            title: 'Command',
            description:
              'Command to run',
            type: 'string',
          }
        },
      },
    },
    async handler(ctx) {
      if (!ctx.input.command) {
        throw new Error(`Command has not been provided`)
      }
      await containerRunner.runContainer({
        args: ["-c", ctx.input.command],
        command: "bash",
        imageName: "bash",
        logStream: ctx.logStream,
      })
    },
  });
}
