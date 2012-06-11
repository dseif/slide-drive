Slide-drive
===========
[Slide-drive][slide-drive] is a HTML5 slideshow player that enables audio or video to control a [Deck.js][deck.js] slideshow. The author needs nothing more than a basic understanding of HTML and CSS to make a fully featured slideshow.

Getting Started
---------------

### Clone the repo and externals

(This currently clones hundreds of megs of unnecessary or redundant data.)

    $ git clone https://github.com/dseif/slide-drive.git slide-drive
    $ cd slide-drive
    $ git submodule update --init --recursive

#### To update, assuming no modifications were made

    $ git pull origin master
    $ git submodule update --init --recursive

### Setup Node.js and its modules

Butter requires [Node.js][node.js] v0.6 or higher. You may use your system's copy, but I prefer to install an isolated copy using the Python tool [nodeenv][nodeenv]. This takes longer to install but is more difficult to break.

#### Install it using you Python package manager of choice

    $ pip install nodeenv
    # OR
    $ easy_install nodeenv

#### Create local node installation

    $ python -m nodeenv --node=0.7.9 --npm=1.1.23 nodeenv

#### Install Butter's dependencies using NPM:

    $ nodeenv/bin/npm install external/butter/
    $ nodeenv/bin/npm install shelljs express stylus mongoose express-browserid

### Install and Run MongoDB

Some basic functionality doesn't require [MongoDB][mongodb], but it is required to save or share pages. You're on your own for this.

### Start the Butter/Cornfield server

    $ NODE_PATH=external_configs/cornfield nodeenv/bin/node external/butter/cornfield/app

### Open it!

- Example presentation: <http://localhost:8888/>
- Slide Drive template for Butter: <http://localhost:8888/template.html>
- Tests: <http://localhost:8888/test/>

 [slide-drive]: https://github.com/dseif/slide-drive
 [deck.js]: http://imakewebthings.com/deck.js/
 [node.js]: http://nodejs.org/
 [nodeenv]: http://ekalinin.github.com/nodeenv/
 [mongodb]: http://www.mongodb.org/

Keyboard commands
-----------------

* play or pause: p
* next slide: spacebar, right arrow, up arrow
* previous slide: backspace, left arrow, down arrow
* show slide menu: m
* go to slide: g

Contributors
------------

* David Seifried
* [Jeremy Banks](http://github.com/jeremybanks)
