#!/bin/bash
echo " Start deploying to pointlab-test repo: "
echo " checkout into rel branch "
git checkout rel
echo " switch heroku remote to pointlab-test "
heroku git:remote -a pointlab-test
echo " push rel to pointlab-test master "
git push heroku rel:master
echo " open site "
heroku open
echo " switch back to pointlab "
heroku git:remote -a pointlab
echo " Finish "

