var Request = require("request"),
    repoName = require('git-repo-name'),
    _ = require('lodash'),
    Q = require("q");
    
import { GIT_HUB } from './config.js';

export class AddReviewer {

    addReviewerGithub(request) {
        let defered = Q.defer(),
            reviewers = _.get(request,'reviewers', []),
            prNumber = _.get(request,'prNumber', '0');
        var url = GIT_HUB.GITHUB_API_ENDPOINT + "/repos/" + GIT_HUB.GITHUB_OWNER + "/" + repoName.sync() + "/pulls/" + prNumber + "/requested_reviewers";
        Request.post({
            "headers": {  'Content-Type' : 'application/json',
                          'user-agent': 'node.js',
                          'Authorization' : GIT_HUB.PERSONAL_ACCESS_TOKEN_GITHUB 
            },
            "url": url,
            "body": JSON.stringify({
                "reviewers": reviewers
            })
        }, (error, response, body) => {
            let apiResponse = JSON.parse(body);
            if(response.statusCode == 201 || response.statusCode == 200) {
                let prUrl = _.get(apiResponse,"html_url",'');
                defered.resolve(prUrl);
            } else {
                defered.reject(_.get(apiResponse,"message",''));
            }
        });
        return defered.promise; 
    }
}

export default AddReviewer;