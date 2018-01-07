# NodePirates
A special version of Battleship in NodeJS where you program the player instead of the game itself. The matchmaker then selects two players in a ranked game and lets them fight against each other.

Your target is to create the fastest player in order to win the ranking.

Your player can be any program with a simple http requst handler.
The matchmaker sends requests to the players in this format:

```javascript
url: 'http://<playerurl:port>/fire'
method: 'POST'
Content-Type: 'application/json'
body: {
	shotresult: number, //result of last shot (water, ship, shipsunk, win, lost)
	grid: //two dimensional array of opponents field
}
```

in return the matchmaker expects a JSON response with the coordinates of the players next shot:

```javascript
returnvalue: [x,y]
```

## Run the prototype

First you need to install the required node packages with `npm install`. 
Then you have to compile the typescript source by using `npm run tsc`

Now you can start the players and the matchmaker

`node ./dist/player1.js`

`node ./dist/player2.js`

`node ./dist/matchmaker.js`

## What's next

The next version will encapsulate the players and the matchmaker in docker containers.