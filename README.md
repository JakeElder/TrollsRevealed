# Trolls Revealed
Source for http://trollsrevealed.com

## Development Instructions
Assumes bower ~1, grunt ~4 and sass ~1.3 are installed globally;

```
npm install -g grunt-cli bower
gem install sass --pre
```

Download the source and start the development server;

```
git clone git@github.com:JakeElder/TrollsRevealed.git && cd TrollsRevealed
npm install && bower install
grunt
```

Open browser at **http://localhost:9000**, edit files in the **./src** directory

## Build/Deploy Instructions
Assumes an [orpan branch](https://help.github.com/articles/creating-project-pages-manually) set up at **../build**  
Running `grunt build` will build a package at **../build**  
To deploy, `cd ../build`, then force push to the gh-pages branch, `git commit -am "Updates" && git push origin +gh-pages`
