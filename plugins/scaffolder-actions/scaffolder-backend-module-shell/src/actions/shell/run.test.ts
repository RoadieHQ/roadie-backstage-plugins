import { createShellRunAction } from "./run";
import {ContainerRunner, RunContainerOptions} from "@backstage/backend-common";
import {ActionContext} from "@backstage/plugin-scaffolder-backend";
import {Writable} from "stream";

describe("shell:run", () => {
    let containerRunner: ContainerRunner = {
        runContainer: (_opts: RunContainerOptions) => {
            return Promise.resolve()
        }
    }

    let logStream = new Writable();

    beforeEach(() => {
        containerRunner.runContainer = jest.fn()
    })

    it('creates the action successfully', async () => {
        const action = createShellRunAction({ containerRunner })
        expect(action.id).toEqual('shell:run')
        await action.handler({ input: { command: 'ls -l' }, logStream } as ActionContext<{command: string}>)
        expect(containerRunner.runContainer).toBeCalledWith({
            args: ["-c", 'ls -l'],
            command: "bash",
            imageName: "bash",
            logStream: logStream,
        })
    })

    it('command is not defined', async () => {
        const action = createShellRunAction({ containerRunner })
        expect(action.id).toEqual('shell:run')
        await expect(action.handler({ input: {}, logStream } as ActionContext<{command: string}>)).rejects.toEqual(new Error('Command has not been provided' ))
    })
})