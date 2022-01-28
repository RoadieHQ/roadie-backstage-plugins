import React, { FC, useState } from "react"

export const GithubPullRequestsContext = React.createContext({ prState: { open: { etag: "", data: [] }, closed: { etag: "", data: [] }, all: { etag: "", data: [] } }, setPrState: () => { } })

export const GithubPullRequestsProvider: FC = ({ children }) => {
    const [prState, setPrState] = useState<any>({ open: { etag: "", data: [] }, closed: { etag: "", data: [] }, all: { etag: "", data: [] } })
    const value = { prState, setPrState }
    return <GithubPullRequestsContext.Provider value={value} >{children}</ GithubPullRequestsContext.Provider>
}
