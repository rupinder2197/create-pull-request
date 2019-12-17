var _ = require('lodash'),
    branch = require('git-branch'),
    Q = require("q");

import createPullRequest  from './createPullRequest.js';
import addReviewer  from './addReviewer.js';

export function cli(args) {
    var createPullRequestObj = new createPullRequest(),
        addReviewerObj = new addReviewer(),
        addReviewerRequest = {},
        prUrl = '';
    Q(undefined)
    .then(() => {
        return validateRequest(args);
    })
    .then((request) => {    // validating the command
        addReviewerRequest = _.cloneDeep(request);
        console.log("creating pr request for ", JSON.stringify(request));
        return createPullRequestObj.createPullRequestGithub(request);
    })
    .then((data) => {       // getting pr number from the created PR
        prUrl = _.get(data,'prUrl','');
        var url = _.get(data,'url','');
        return getPRNumberGithub(url);
    })
    .then((prNumber) => {   // adding reviewer to the PR
        _.set(addReviewerRequest,'prNumber',prNumber);
        var reviewers = _.get(addReviewerRequest , 'reviewers', []);
        if(reviewers.length > 0) {
            console.log("adding reviewers...");
            return addReviewerObj.addReviewerGithub(addReviewerRequest);
        } else {
            return Q.resolve(prUrl);
        }
    })
    .then((url) => {    
        console.log("PR created ", url);
    })
    .fail((error) => {
        if(prUrl != '') { 
            console.log("PR created ", prUrl);
        }
        console.log(error);
    })
}

function validateRequest(args) {
    var reviewers = [],
        sourceBranch = branch.sync(),
        title = "",
        targetBranch = "",  
        isReviewer = 0,
        isTitle = 0,
        request = {},
        defer = Q.defer(),
        correctCommand = 'create-pull-request <TARGET_BRANCH> -t <TITLE_OF_THE_PR> -r <OPTIONAL_REVIEWERS>';
    for(var i = 2; i < args.length; i++){
        var element = args[i];
        if (element == '-t') {
            isTitle = 1;
            continue;
        }
        else if (element == '-r') { 
            isReviewer = 1;
            continue;
        }
        else if(isTitle == 1 && isReviewer == 0) {
            title = title + element + " ";    // storing the title of the pull request
        }
        else if(isReviewer == 1) {
            reviewers.push(element);    // storing the reviewers coming in args after -r
        }
        else if(isReviewer == 0 && isTitle == 0) {
            targetBranch = element;     // storing the target branch
        } 
    }
    if(targetBranch == "" || sourceBranch == "" || title == "") {
        defer.reject("Error in request. Please check the command it should be like this... " + correctCommand);
    } else {
       _.set(request, 'title', title);
       _.set(request, 'source_branch', sourceBranch);
       _.set(request, 'target_branch', targetBranch);
       _.set(request, 'reviewers', reviewers);
       defer.resolve(request);
    }
    return defer.promise;
}

function getPRNumberGithub(prUrl) {
    var prNumber = "";
    for(var i = prUrl.length - 1; i >= 0 ; i--) {
        if(prUrl[i] == "/") {
            break;
        }
        prNumber = prNumber + prUrl[i];
    }
    return prNumber.split("").reverse().join("");;
}


