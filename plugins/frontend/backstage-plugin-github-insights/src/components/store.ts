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

import create, { SetState, GetState, StoreApi } from 'zustand'
import produce from "immer"
import { GithubRequestState, GithubInsightsState, RequestStateStore } from "./types"

class DefaultDict<T> {
    constructor(defaultVal: T) {
        return new Proxy({}, {
            get: (target: { [key: string]: {} }, name: string) => name in target ? target[name] : defaultVal
        })
    }
}

const initialState: GithubRequestState = { etag: "", data: [] }

const createLicenseSlice = (set: SetState<GithubInsightsState>) => ({
    license: {
        state: initialState,
        setState: (next: GithubRequestState) => set(produce((draft) => { draft.license.state = next }))
    }
})

const createBranchesSlice = (set: SetState<GithubInsightsState>) => ({
    branches: {
        state: initialState,
        setState: (next: GithubRequestState) => set(produce((draft) => { draft.branches.state = next }))
    },
})

const createContributorSlice = (set: SetState<GithubInsightsState>) => ({
    contributor: {
        state: new DefaultDict(initialState) as RequestStateStore,
        setState: (key: string, value: GithubRequestState) => set((prev) => {
            prev.contributor.state[key] = value
            return produce((draft) => {
                draft.contributor.state = prev.contributor.state
            })
        })
    }
})
const createRequestSlice = (set: SetState<GithubInsightsState>) => ({
    request: {
        state: new DefaultDict(initialState) as RequestStateStore,
        setState: (key: string, value: GithubRequestState) => set((prev) => {
            prev.request.state[key] = value
            return produce((draft) => {
                draft.requesst.state = prev.request.state
            })
        })
    }
})


export const useStore = create<GithubInsightsState, SetState<GithubInsightsState>, GetState<GithubInsightsState>, StoreApi<GithubInsightsState>>((set) => ({
    ...createLicenseSlice(set),
    ...createContributorSlice(set),
    ...createBranchesSlice(set),
    ...createRequestSlice(set)
}))
