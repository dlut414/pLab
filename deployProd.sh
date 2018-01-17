#!/bin/bash
echo " Start deploying to heroku pointlab repo: "
echo " checkout into master branch "
git checkout master
echo " switch heroku remote to pointlab "
heroku git:remote -a pointlab
echo " push master to pointlab master "
git push heroku master:master
echo " open site "
heroku open
echo " Finish "

