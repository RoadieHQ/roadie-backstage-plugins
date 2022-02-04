import create, { SetState, GetState, StoreApi } from 'zustand'
import { GithubPullRequestsState, PrState } from '../types'

const initialState = {}

export const useStore = create<GithubPullRequestsState, SetState<GithubPullRequestsState>, GetState<GithubPullRequestsState>, StoreApi<GithubPullRequestsState>>(set => ({
    prState: initialState,
    setPrState: (next: PrState) => set((state) => ({ prState: { ...state.prState, ...next } })),
}))
