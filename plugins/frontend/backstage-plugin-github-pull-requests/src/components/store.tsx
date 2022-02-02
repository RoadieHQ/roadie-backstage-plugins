import create from 'zustand'

const initialState = { open: { etag: "", data: [] }, closed: { etag: "", data: [] }, all: { etag: "", data: [] } }

export const useStore = create(set => ({
    prState: { ...initialState },
    setPrState: (prState) => set(state => ({ prState: { ...state.prState, ...prState } })),
}))
