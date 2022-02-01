import React, { FC, useState, useContext } from "react"
import { PrState, PullRequestsContextData } from "../types"

const initialState = { open: { etag: "", data: [] }, closed: { etag: "", data: [] }, all: { etag: "", data: [] } }
const GithubPullRequestsContext = React.createContext<PullRequestsContextData>({ prState: initialState, setPrState: () => { } })

export const GithubPullRequestsProvider: FC = ({ children }) => {
    const [prState, setPrState] = useState<PrState>(initialState)
    const value = { prState, setPrState }
    return <GithubPullRequestsContext.Provider value={value} >{children}</ GithubPullRequestsContext.Provider>
}

export const useGithubPullRequests = () => {
    const context = useContext(GithubPullRequestsContext)
    if (context === undefined) {
        throw new Error('useGithubPullRequests must be used within a GithubPullRequestsProvider')
    }
    return context
}
