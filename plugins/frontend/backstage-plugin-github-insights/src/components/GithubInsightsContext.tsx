import React, { FC, useContext, useState } from "react"
import { GithubInsightsState } from "./types"



const GithubInsightsContext = React.createContext<GithubInsightsState>({ "asd": [] })

export const GithubInsightsProvider: FC = ({ children }) => {
    const [licence, setLicence] = useState({ etag: "", data: "" })
    const [contributorData, setContributorData] = useState<{ [key: string]: { etag: "", data: "" } }>({})
    const [branches, setBranches] = useState({ etag: "", data: {} })

    const [requestState, setRequestState] = useState({
        releases: { etag: "", data: {} },
        readme: { etag: "", data: {} },
        contributors: { etag: "", data: {} },
        languages: { etag: "", data: {} },
    })

    const value = {
        "repoLicence": [licence, setLicence],
        "contributor": [contributorData, setContributorData],
        "repoBranches": [branches, setBranches],
        "request": [requestState, setRequestState]
    }
    return <GithubInsightsContext.Provider value={value} >{children}</ GithubInsightsContext.Provider>
}
export const useGithubInsights = () => {
    const context = useContext(GithubInsightsContext)
    if (context === undefined) {
        throw new Error('useGithubInsights must be used within a GithubInsightsProvider')
    }
    return context
}