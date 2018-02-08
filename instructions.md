# hi luba

## editing the code

  - code on my computer is in `~/dev/games/bloq`
      + the full project contains various files and tools for re-creating the project on other platforms like ios. the core code for the browser version of the game is in `~/dev/games/bloq/www`. that's where the familiar html, js and css files are.
      + edit the code there using sublime (`subl ~/dev/games/bloq/www`) or whatever. test it by simply opening (`open index.html`) the home page in a browser. 
      + push it to bitbucket with `git add .`, `git commit -m "YOUR MESSAGE"`, and `git push origin master.`

## connecting to my server

  - my hosting company (dylan's company) is [here](https://east1.openhosting.com/accounts/) but you shouldn't need to go there.
  - just connect to the server with `ssh toor@206.191.128.205`, password `jdr81385`
  - now, you are still in the terminal, but effectively, you're on that computer where the server is running. all your keystrokes will be sent there, and all output on that machine will appear on your terminal.
  - the code lives at `/var/www/html/moosecat.io`, which should reflect the folder structure at `~/dev/games/bloq/`
  - navigate to `/var/www/html/moosecat.io`
  - `git pull origin master` should merge your updates into the code on the server.
  - you should be able to see your updates (for now) at http://206.191.128.205/moosecat.io/