# NYU-s-o
### A Project to Make Immense Fun of NYU and How They're Aggressively Spreading, to Encompass Everything and Anything At All

# Intro
This project uses:
[Erin Sparling's Cooper Union CRUD Database Interface as a base](https://glitch.com/edit/#!/cooper-union-sqlite-json-storage): 
The CRUD Database uses SQLite.

The project also uses:
The Twitter API
[The Cooper Union Weather API](https://cooper-weather-proxy.glitch.me/)
Passportjs to log in

## Ethos
This project is inspired by a joke that I started at San Marzano, dangerously close to NYU Tisch on Second Ave and 7th St.
I noticed all of the NYU students walking around and I made an "NYU School of..." joke, and from there it just spiraled. I kept making jokes over the course of the next few weeks and here it is. 

# Twitter

The Twitter API is a bit complicated, but steps to reproduce this project with your own Twitter Developer account can be followed by [following Twitter's guidelines on how to get started](https://developer.twitter.com/en/docs/developer-portal/overview)

Once that's done, replace the keys in the .env with your own access keys and the code should update accordingly.

Posting tweets looks something like this: 


https://user-images.githubusercontent.com/66575069/146494640-3f00a4aa-9b72-4440-a574-ee57031ba0c5.mov



# Login

Logging in can be accessed through the /login endpoint, and prompts the user to log in with credentials, once authenticated, this allows the active user to quickly edit the database entries via a user interface. The login information is stored in express-sessions and uses browser cookies to continue sessions.

You may change the username and passwords needed by editing the .env

## Code Sources and Hosts
This project is hosted and the code is viewable and open source on Glitch:
https://final-final-final-final-final.glitch.me/

The code can be viewed and remixed at: https://glitch.com/edit/#!/final-final-final-final-final

Of course, you can also clone this GitHub Repo to make open source changes, to make fun of any other institution or organizaiton of your choice

## Notes
The Username and Password attributes are stored in the .env, which are only visible to myself. To set your own project's username and password, update the .env variable. 
