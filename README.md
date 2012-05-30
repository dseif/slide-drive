Slide-drive
===========
[Slide-drive](https://github.com/dseif/slide-drive) is a HTML5 slideshow player that enables audio or video to control a [Deck.js](http://imakewebthings.github.com/deck.js/) slideshow. The author needs nothing more than a basic understanding of HTML and CSS to make a fully featured slideshow.

Getting Started
---------------

### Clone the repo and externals

(This currently clones hundreds of megs of unnecessary or redundant data.)

    $ git clone https://github.com/jeremybanks/slide-drive.git slide-drive
    $ cd slide-drive
    $ git submodule update --init --recursive

#### To update, assuming no modifications were made

    $ git pull origin master
    $ git submodule update --init --recursive

### Setup Node.js and its modules

Butter requires Node.js v0.6 or higher. You may use your system's copy, but I prefer to install an isolated copy using the Python tool [nodeenv][nodeenv]. This takes longer to install but is more difficult to break.

 [nodeenv]: http://ekalinin.github.com/nodeenv/

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

Basic functionality doesn't require Mongo, but it is required to save or share pages. [You're on your own for installing this.][monogodb]

    $ screen -d -m mongod

 [mongodb]: http://www.mongodb.org/

### Start the Butter/Cornfield server

    $ NODE_PATH=external_configs/cornfield nodeenv/bin/node external/butter/cornfield/app

### Open it!

Load <http://localhost:8888/template.html> to view the Slide Drive template for Butter, or <http://localhost:8888/> to see a Slide Drive presentation.

Keyboard commands
-----------------

* play or pause: p
* next slide: spacebar, right arrow, up arrow
* previous slide: backspace, left arrow, down arrow
* show slide menu: m
* go to slide: g

