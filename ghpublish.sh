#!/bin/bash
git checkout master 
git subtree split --prefix www -b gh-pages
git push -f origin gh-pages:gh-pages
git branch -D gh-pages

