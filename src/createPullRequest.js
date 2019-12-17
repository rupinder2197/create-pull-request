var Request = require("request"),
    repoName = require('git-repo-name'),
    _ = require('lodash'),
    Q = require("q");
    
import { GIT_HUB } from './config.js';

export class CreatePullRequest {

    createPullRequestGithub(request) {
        let defered = Q.defer();
        var url = GIT_HUB.GITHUB_API_ENDPOINT + "/repos/" + GIT_HUB.GITHUB_OWNER + "/" + repoName.sync() + "/pulls";
        Request.post({
            "headers": {  'Content-Type' : 'application/json',
                          'user-agent': 'node.js',
                          'Authorization' : GIT_HUB.PERSONAL_ACCESS_TOKEN_GITHUB 
            },
            "url": url,
            "body": JSON.stringify({
                "title": _.get(request, 'title', ''),
                "head": _.get(request, 'source_branch', ''),
                "base": _.get(request, 'target_branch', '') 
            })
        }, (error, response, body) => {
            let apiResponse = JSON.parse(body);
            if(response.statusCode == 201 || response.statusCode == 200) {
                let data = {};
                _.set(data,'url',_.get(apiResponse,"url",''));
                _.set(data,'prUrl',_.get(apiResponse,"html_url",''));
                defered.resolve(data);
            } else {
                defered.reject(_.get(apiResponse,"errors",''));
            }
        });
        return defered.promise; 
    }
}

export default CreatePullRequest;