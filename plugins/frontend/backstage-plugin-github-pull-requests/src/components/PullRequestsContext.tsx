import React, { FC, useState } from "react"
import { PrState, PullRequestsContextData } from "../types"

export const GithubPullRequestsContext = React.createContext<PullRequestsContextData>(
    {
        prState: { open: { etag: "", data: [] }, closed: { etag: "", data: [] }, all: { etag: "", data: [] } },
        setPrState: () => { }
    }
)

export const GithubPullRequestsProvider: FC = ({ children }) => {
    const [prState, setPrState] = useState<PrState>({ open: { etag: "", data: [] }, closed: { etag: "", data: [] }, all: { etag: "", data: [] } })
    const value = { prState, setPrState }
    return <GithubPullRequestsContext.Provider value={value} >{children}</ GithubPullRequestsContext.Provider>
}
