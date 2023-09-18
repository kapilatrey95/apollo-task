const axios = require('axios');
const fs = require('fs');
const baseUrl = 'https://api.github.com';
const resolvers = {
    Query: {
        repositories: async (_, { token: githubToken }) => {
            try {
                const filename = `files/${githubToken}.json`;

                let repositoriesData = [];
                try {
                    console.log("-----------1")
                    const fileContent = fs.readFileSync(filename, 'utf-8');
                    repositoriesData = JSON.parse(fileContent);
                } catch (error) {
                    console.log('File does not exist. Fetching data from API.');
                }

                if (repositoriesData.length === 0) {
                    console.log('-----indikjnfkjsfn')
                    const response = await axios.get(`${baseUrl}/user/repos`, {
                        headers: {
                            Authorization: `Bearer ${githubToken}`,
                            "content-type": "application/json",
                            "x-github-api-version": "2022-11-28",
                        },
                    });

                    let repositories = response.data;
                    // repositories = repositories.filter((repo) => {
                    //     console.log(repo.name, repo.name in ['repo1', 'repo2', 'repo3']);
                    //     return repo.name in ['repo1', 'repo2', 'repo3'] ? true : false;
                    // })

                    const repositoryPromises = repositories.map(async (repo) => {
                        console.log('----1')
                        return new Promise(async (resolve, reject) => {
                            const repoDetailsResponse = await axios.get(`${baseUrl}/repos/${repo.owner.login}/${repo.name}`, {
                                headers: {
                                    Authorization: `Bearer ${githubToken}`,
                                    "content-type": "application/json",
                                    "x-github-api-version": "2022-11-28",
                                },
                            });
                            console.log('----2')

                            const size = repoDetailsResponse.data.size;
                            const isPrivate = repoDetailsResponse.data.private;
                            const numFiles = repoDetailsResponse.data.size;
                            console.log('----3')

                            const contentsResponse = await axios.get(`${baseUrl}/repos/${repo.owner.login}/${repo.name}/contents`, {
                                headers: {
                                    Authorization: `Bearer ${githubToken}`,
                                    "content-type": "application/json",
                                    "x-github-api-version": "2022-11-28",
                                },
                            });
                            console.log('----4')

                            const ymlFileContent = contentsResponse.data.find(file => file.name.endsWith('.yml'));
                            console.log(ymlFileContent, "=====ymlFileContent====")
                            resolve({
                                name: repo.name,
                                owner: repo.owner.login,
                                size,
                                isPrivate,
                                numFiles,
                                ymlFileContent: ymlFileContent ? ymlFileContent.git_url : null,
                            })
                        })
                    });

                    const updatedRepositories = await Promise.all(repositoryPromises);
                    fs.writeFileSync(filename, JSON.stringify(updatedRepositories, null, 2));

                    console.log('Updated repositories stored in', filename)
                    return updatedRepositories;
                } else {
                    return repositoriesData;
                }
            } catch (error) {
                console.log(error)
                throw new Error('Unable to fetch repositories.');
            }
        },
        repositoryDetails: async (_, { token, owner, name }) => {
            try {
                console.log({ token, owner, name })
                const filename = `files/${token}.json`;

                let repositoriesData = [];
                try {
                    const fileContent = fs.readFileSync(filename, 'utf-8');
                    repositoriesData = JSON.parse(fileContent);
                    return repositoriesData.find(repo => repo.name === name && repo.owner === owner);
                } catch (error) {
                    console.log(error);
                    console.log('File does not exist. Fetching data from API.');
                }

                const response = await axios.get(`${baseUrl}/repos/${owner}/${name}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const repo = response.data;

                const repositoryDetails = {
                    name: repo.name,
                    size: repo.size,
                    owner: repo.owner.login,
                    isPrivate: repo.private,
                    fileCount: repo.size,
                };

                return repositoryDetails;
            } catch (error) {
                console.log(error);
                throw new Error('Unable to fetch repository details.');
            }
        },
    },
};

module.exports = resolvers;
