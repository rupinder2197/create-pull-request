Decription of the project :-
Program to create the pull reuqest for github from command line instead of UI.

STEPS TO RUN THE PROGRAM

1. Add the npm user in the package.json
2. Add your github username and your personal access token in the config.js
3. run npm install esm
4. run npm link
5. go to the working directory of the github repo
6. run create-pull-request <TARGET_BRANCH> -t <TITLE_OF_THE_PR> -r <OPTIONAL_REVIEWERS> to create the pull request

E.g - create-pull-request master -t Creating PR through CLI -r reviewer_1 reviewer_2

