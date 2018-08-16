NodePirates
===========

Playing Battleship with others online.
Write your own _player_ and match with other _players_.


Development
-----------

    # install requirements
    $> npm install
    $> docker-compose up -d

    # optionally, register player1, player2 and player-simple-core
    $> bin/insert-players.js

    # run the matchmaker service
    $> node matchmaker.js

    # run the web server
    $> node app.js


Tests
-----

    $> npm test
