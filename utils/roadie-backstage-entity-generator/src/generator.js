const { Octokit } = require("@octokit/rest");
const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")
const { paginateRest } = require("@octokit/plugin-paginate-rest");


const MyOctokit = Octokit.plugin(paginateRest);
const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN
});

const org = "RoadieHQ"

const getCatalogInfo = ({ org, name, description, owner, tags }) => {
  const entity = {
    apiVersion: "backstage.io/v1alpha1",
    kind: "Component",
    metadata: {
      name: name,
      annotations: {
        "github.com/project-slug": `${org}/${name}`
      },
      tags: tags
    },
    spec: {
      type: "service",
      owner: `${owner}`,
      lifecycle: "experimental"
    }
  }
  if (description) {
    entity.metadata.description = description
  }
  return entity
}

const getRootLocation = ({ targets }) => {
  const location = {
    apiVersion: "backstage.io/v1alpha1",
    kind: "Location",
    metadata: {
      name: "catalog-data"
    },
    spec: {
      type: "file",
      targets: targets.map(t => `./${t.path}`)
    }
  }
  return location
}
const generateCatalog = async () => {

  const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org: org,
    per_page: 100
  },
    (response) => response.data.map((repo) => ({ teamsUrl: repo.teams_url, name: repo.name, tags: repo.topics, description: repo.description, isArchived: repo.archived }))
  );
  return Promise.all(repos.map(async repo => {
    // console.log(repo)
    if (repo.isArchived) {
      return
    }
    let owner = "guest"
    try {
      const result = await octokit.request({ url: repo.teamsUrl })
      owner = result.data[0]?.slug
    } catch (e) {
      if (e.status === 404) {
        console.log("No owner team set on the repository, using 'guest'")
      } else {
        throw e
      }
    }


    const catalogInfo = getCatalogInfo({
      org,
      name: repo.name,
      description: repo.description,
      tags: repo.topics,
      owner: owner,
    })
    return { entity: catalogInfo, path: path.join('templates', repo.name, "catalog-info.yaml") }
  }))
}

const main = async () => {
  console.log("Starting rate limit: ", await (await octokit.rest.rateLimit.get()).data.rate)
  const catalog = await (await generateCatalog()).filter(Boolean)
  catalog.forEach(c => {
    if (!fs.existsSync(c.path.replace("/catalog-info.yaml", ""), { recursive: true })) {
      fs.mkdirSync(c.path.replace("/catalog-info.yaml", ""), { recursive: true });
    }
    fs.writeFileSync(c.path, yaml.dump(c.entity))
  })
  const location = getRootLocation({ targets: catalog })
  fs.writeFileSync("catalog-info.yaml", yaml.dump(location))

  console.log("Ending rate limit: ", await (await octokit.rest.rateLimit.get()).data.rate)
}
main()