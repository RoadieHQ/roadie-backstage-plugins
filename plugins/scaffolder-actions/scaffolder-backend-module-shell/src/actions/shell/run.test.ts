/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createShellRunAction } from "./run";
import { ContainerRunner, RunContainerOptions } from "@backstage/backend-common";
import { ActionContext } from "@backstage/plugin-scaffolder-backend";
import { Writable } from "stream";

describe("shell:run", () => {
    const containerRunner: ContainerRunner = {
        runContainer: (_opts: RunContainerOptions) => {
            return Promise.resolve()
        }
    }

    const logStream = new Writable();

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