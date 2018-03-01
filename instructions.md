# hi luba

## editing the code

  - code on my computer is in `o`
      + the full project contains various files and tools for re-creating the project on other platforms like ios. the core code for the browser version of the game is in `~/dev/games/bloq/www`. that's where the familiar html, js and css files are.
      + edit the code there using sublime (`subl ~/dev/games/bloq/www`) or whatever. test it by simply opening (`open index.html`) the home page in a browser. 
      + push it to bitbucket with `git add .`, `git commit -m "YOUR MESSAGE"`, and `git push origin master`

## connecting to my server

  - my hosting company (dylan's company) is [not here](https://east1.openhosting.com/accounts/) but you shouldn't need to go there. or to the actual hosting company, which is digital ocean. username is my email and password is my initials (3 letters, lowercase) plus my birthday (5 digits)
  - just connect to the server with `ssh toor@165.227.94.61`, password `jdr81385`
  - now, you are still in the terminal, but effectively, you're on that computer where the server is running. all your keystrokes will be sent there, and all output on that machine will appear on your terminal.
  - the code lives at `/var/www/html/moosecat.io`, which should reflect the folder structure at `~/dev/games/bloq/`
  - navigate to `/var/www/html/moosecat.io`
  - `git pull origin master` should merge your updates into the code on the server.
  - you should be able to see your updates (for now) at `moosecat.io/bloq/www`

## To do list
  - Add code for the Moosecat.io website that isn't bloq, make sure the directory doesn't show any more on mooosecat.io
  - add analytics code for main website
  - add adsense code to bloq
  - why does it show you all the code when you look at the source??
  - figure out how to upload code properly to the server
  - 


