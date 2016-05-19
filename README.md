Most of the developer dont have time to put their pages because of lack of time.
This is a VERY simple page just for you to describe your self with few sentences.

## Setup
1. Copy the config.example.php to config.php and fill your information.
2. Put your profile picture in information/profile.png
3. run :


Use the build version of the CSS ( build ) or build your own.

```
npm install
gulp
```

After style change you must run gulp.

## Optional You can use markdown in your information/*.md files

Creating information/description/bio.md exposes a description.bio variable in the ejs files.

# "Development" cycle

Running *** gulp watch *** will monitor your changes and trigger an update.
Running in separate terminal *** npm run-script livereload *** will start a server for live-reloading changes in your browser.
* Install chrome or firefox extension for this to work.
