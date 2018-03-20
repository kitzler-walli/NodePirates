"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var Coordinate_1 = require("./Coordinate");
var assert_1 = require("assert");
var port = 8080;
var name = 'KW Simple Player';
var ModeEnum;
(function (ModeEnum) {
    ModeEnum[ModeEnum["Unknown"] = 0] = "Unknown";
    ModeEnum[ModeEnum["Cross1"] = 1] = "Cross1";
    ModeEnum[ModeEnum["Cross2"] = 2] = "Cross2";
    ModeEnum[ModeEnum["Search"] = 3] = "Search";
    ModeEnum[ModeEnum["AttackBoat"] = 4] = "AttackBoat";
})(ModeEnum || (ModeEnum = {}));
var DirectionEnum;
(function (DirectionEnum) {
    DirectionEnum[DirectionEnum["Unknown"] = 0] = "Unknown";
    DirectionEnum[DirectionEnum["North"] = 1] = "North";
    DirectionEnum[DirectionEnum["East"] = 2] = "East";
    DirectionEnum[DirectionEnum["South"] = 3] = "South";
    DirectionEnum[DirectionEnum["West"] = 4] = "West";
})(DirectionEnum || (DirectionEnum = {}));
var mode = ModeEnum.Unknown;
var crossX = -1;
var oldMode;
var direction = DirectionEnum.Unknown;
var lastHit;
var firstHit;
var totalHits = 0;
var lastShot;
var ships;
function handleState(field) {
    if (!lastShot)
        return;
    var lastFieldState = field[lastShot.X][lastShot.Y];
    console.log("Last Shot Result: " + lastFieldState);
    switch (lastFieldState) {
        case 'H':
            if (mode != ModeEnum.AttackBoat) {
                oldMode = mode;
                mode = ModeEnum.AttackBoat;
                firstHit = lastShot;
            }
            lastHit = lastShot;
            break;
        case 'S':
            mode = oldMode;
            oldMode = ModeEnum.Unknown;
            direction = DirectionEnum.Unknown;
            lastHit = Coordinate_1.Coordinate.Empty;
            firstHit = Coordinate_1.Coordinate.Empty;
            break;
        case 'W':
            //continue in current mode;
            if (mode == ModeEnum.AttackBoat) {
                //Change Direction - to opposite
                lastHit = firstHit;
                //int corner = CheckCorner(lastHit);
                getNextDirection(field);
            }
            break;
    }
}
function oppositePossible(field) {
    if ((direction == DirectionEnum.North && firstHit.Y == 9) ||
        (direction == DirectionEnum.East && firstHit.X == 0) ||
        (direction == DirectionEnum.South && firstHit.Y == 0) ||
        (direction == DirectionEnum.West && firstHit.X == 9)) {
        //System.Diagnostics.Debug.WriteLine(direction.ToString());
        //System.Diagnostics.Debug.WriteLine("OppNotPoss-1 X:" + firstHit.X + " Y:" + firstHit.Y);
        return false;
    }
    if ((direction == DirectionEnum.North && checkState(field, getPointDirection(firstHit, DirectionEnum.South)) != "U") ||
        (direction == DirectionEnum.East && checkState(field, getPointDirection(firstHit, DirectionEnum.West)) != "U") ||
        (direction == DirectionEnum.South && checkState(field, getPointDirection(firstHit, DirectionEnum.North)) != "U") ||
        (direction == DirectionEnum.West && checkState(field, getPointDirection(firstHit, DirectionEnum.East)) != "U")) {
        //System.Diagnostics.Debug.WriteLine(direction.ToString());
        //System.Diagnostics.Debug.WriteLine("OppNotPoss-2 X:" + firstHit.X + " Y:" + firstHit.Y);
        return false;
    }
    return true;
}
function checkState(field, coord) {
    return field[coord.X][coord.Y];
}
function getPointDirection(coord, direction) {
    switch (direction) {
        case DirectionEnum.North:
            return { X: coord.X, Y: Math.max(coord.Y - 1, 0) };
        case DirectionEnum.East:
            return { X: Math.min(coord.X + 1, 9), Y: coord.Y };
        case DirectionEnum.South:
            return { X: coord.X, Y: Math.min(coord.Y + 1, 9) };
        case DirectionEnum.West:
            return { X: Math.max(coord.X - 1, 0), Y: coord.Y };
        default:
            return new Coordinate_1.Coordinate();
    }
}
function checkAcross(field, direction) {
    switch (direction) {
        case DirectionEnum.North:
        case DirectionEnum.South:
            if (lastHit.X == 9)
                direction = DirectionEnum.West;
            else if (lastHit.X == 0)
                direction = DirectionEnum.East;
            else if (checkState(field, getPointDirection(lastHit, DirectionEnum.East)) != "U")
                direction = DirectionEnum.West;
            else
                direction = DirectionEnum.East;
            break;
        case DirectionEnum.East:
        case DirectionEnum.West:
            if (lastHit.Y == 9)
                direction = DirectionEnum.North;
            else if (lastHit.Y == 0)
                direction = DirectionEnum.South;
            else if (checkState(field, getPointDirection(lastHit, DirectionEnum.South)) != "U")
                direction = DirectionEnum.North;
            else
                direction = DirectionEnum.South;
            break;
    }
}
function getNextDirection(field) {
    switch (direction) {
        case DirectionEnum.North:
            if (oppositePossible(field))
                direction = DirectionEnum.South;
            else {
                //System.Diagnostics.Debug.WriteLine(direction.ToString());
                //System.Diagnostics.Debug.WriteLine("NextDir-N X:" + lastHit.X + " Y:" + lastHit.Y);
                checkAcross(field, direction);
            }
            break;
        case DirectionEnum.East:
            if (oppositePossible(field))
                direction = DirectionEnum.West;
            else {
                //System.Diagnostics.Debug.WriteLine(direction.ToString());
                //System.Diagnostics.Debug.WriteLine("NextDir-E X:" + lastHit.X + " Y:" + lastHit.Y);
                checkAcross(field, direction);
            }
            break;
        case DirectionEnum.South:
            if (oppositePossible(field))
                direction = DirectionEnum.North;
            else {
                //System.Diagnostics.Debug.WriteLine(direction.ToString());
                //System.Diagnostics.Debug.WriteLine("NextDir-S X:" + lastHit.X + " Y:" + lastHit.Y);
                checkAcross(field, direction);
            }
            break;
        case DirectionEnum.West:
            if (oppositePossible(field))
                direction = DirectionEnum.East;
            else {
                //System.Diagnostics.Debug.WriteLine(direction.ToString());
                //System.Diagnostics.Debug.WriteLine("NextDir-W X:" + lastHit.X + " Y:" + lastHit.Y);
                checkAcross(field, direction);
            }
            break;
        default:
            mode = oldMode;
            break;
    }
}
function getNext(playingField, c) {
    switch (mode) {
        case ModeEnum.AttackBoat:
            if (direction == DirectionEnum.Unknown) {
                if (((firstHit.X + 1) <= 9) && checkState(playingField, getPointDirection(firstHit, DirectionEnum.East)) == "U")
                    direction = DirectionEnum.East;
                else if (((lastHit.Y + 1) <= 9) && checkState(playingField, getPointDirection(firstHit, DirectionEnum.South)) == "U")
                    direction = DirectionEnum.South;
                else if (((lastHit.X - 1) >= 0) && checkState(playingField, getPointDirection(firstHit, DirectionEnum.West)) == "U")
                    direction = DirectionEnum.West;
                else if (((lastHit.Y - 1) >= 0) && checkState(playingField, getPointDirection(firstHit, DirectionEnum.North)) == "U")
                    direction = DirectionEnum.North;
                else
                    assert_1.throws;
            }
            c = nextAttack(playingField, c);
            break;
        case ModeEnum.Cross1:
            if (crossX < 9) {
                crossX++;
                c = { X: crossX, Y: crossX };
            }
            else {
                crossX = -1;
                mode = ModeEnum.Cross2;
                c = getNext(playingField, c);
            }
            break;
        case ModeEnum.Cross2:
            if (crossX < 9) {
                crossX++;
                c = { X: crossX, Y: 9 - crossX };
            }
            else {
                mode = ModeEnum.Search;
                c = getNext(playingField, c);
            }
            break;
        case ModeEnum.Search:
            var max = getLargestShipToFind(playingField);
            if (max != 0) {
                var list = new Array();
                // Check vertically
                for (var x = 0; x < playingField.length; x++) {
                    var len = 0;
                    var firstPos = [];
                    for (var y = 0; y < playingField[x].length; y++) {
                        if (checkState(playingField, { X: x, Y: y }) == "U" && !nextToShip({ X: x, Y: y }, playingField)) {
                            if (firstPos == null)
                                firstPos = [x, y];
                            len++;
                        }
                        else if (!(checkState(playingField, { X: x, Y: y }) == "U" && !nextToShip({ X: x, Y: y }, playingField))) {
                            if (len > 0) {
                                if (len >= max) {
                                    //return new Coordinates(firstPos.X, firstPos.Y + (len / 2));
                                    list.push({ X: firstPos[0], Y: firstPos[1] + (len / 2) });
                                }
                                len = 0;
                                firstPos = [];
                            }
                        }
                        if (y == 9) {
                            if (len > 0) {
                                if (len >= max) {
                                    //return new Coordinates(firstPos.X, firstPos.Y + (len / 2));
                                    list.push({ X: firstPos[0], Y: firstPos[1] + (len / 2) });
                                }
                                len = 0;
                                firstPos = [];
                            }
                        }
                    }
                }
                //Check horizontally
                for (var y = 0; y < playingField.length; y++) {
                    var len = 0;
                    var firstPos = [];
                    for (var x = 0; x < playingField.length; x++) {
                        if (checkState(playingField, { X: x, Y: y }) == "U" && !nextToShip({ X: x, Y: y }, playingField)) {
                            if (firstPos == null)
                                firstPos = [x, y];
                            len++;
                        }
                        else if (!(checkState(playingField, { X: x, Y: y }) == "U" && !nextToShip({ X: x, Y: y }, playingField))) {
                            if (len > 0) {
                                if (len >= max) {
                                    //return new Coordinates(firstPos.X + (len / 2), firstPos.Y);
                                    list.push({ X: firstPos[0] + (len / 2), Y: firstPos[1] });
                                }
                                len = 0;
                                firstPos = [];
                            }
                        }
                        if (x == 9) {
                            if (len > 0) {
                                if (len >= max) {
                                    //return new Coordinates(firstPos.X + (len / 2), firstPos.Y);
                                    list.push({ X: firstPos[0] + (len / 2), Y: firstPos[1] });
                                }
                                len = 0;
                                firstPos = [];
                            }
                        }
                    }
                }
                return list[Math.floor(Math.random() * (list.length - 1))];
            }
            break;
    }
    return c;
}
function getLargestShipToFind(field) {
    var max = 0;
    for (var i = 0; i < ships.length; i++) {
        if (!ships[i].Sunk && ships[i].Size > max) {
            max = ships[i].Size;
        }
    }
    return max;
}
function nextAttack(playingField, c) {
    switch (direction) {
        case DirectionEnum.North:
            if (lastHit.Y == 0 || checkState(playingField, getPointDirection(lastHit, DirectionEnum.North)) != "U") {
                //System.Diagnostics.Debug.WriteLine("NextAtt-N X:" + lastHit.X + " Y:" + lastHit.Y);
                lastHit = firstHit;
                getNextDirection(playingField);
                c = nextAttack(playingField, c);
            }
            else
                c = getPointDirection(lastHit, DirectionEnum.North);
            break;
        case DirectionEnum.East:
            if (lastHit.X == 9 || checkState(playingField, getPointDirection(lastHit, DirectionEnum.East)) != "U") {
                //System.Diagnostics.Debug.WriteLine("NextAtt-E X:" + lastHit.X + " Y:" + lastHit.Y);
                lastHit = firstHit;
                getNextDirection(playingField);
                c = nextAttack(playingField, c);
            }
            else
                c = getPointDirection(lastHit, DirectionEnum.East);
            break;
        case DirectionEnum.South:
            if (lastHit.Y == 9 || checkState(playingField, getPointDirection(lastHit, DirectionEnum.South)) != "U") {
                //System.Diagnostics.Debug.WriteLine("NextAtt-S X:" + lastHit.X + " Y:" + lastHit.Y);
                lastHit = firstHit;
                getNextDirection(playingField);
                c = nextAttack(playingField, c);
            }
            else
                c = getPointDirection(lastHit, DirectionEnum.South);
            break;
        case DirectionEnum.West:
            if (lastHit.X == 0 || checkState(playingField, getPointDirection(lastHit, DirectionEnum.West)) != "U") {
                //System.Diagnostics.Debug.WriteLine("NextAtt-W X:" + lastHit.X + " Y:" + lastHit.Y);
                lastHit = firstHit;
                getNextDirection(playingField);
                c = nextAttack(playingField, c);
            }
            else
                c = getPointDirection(lastHit, DirectionEnum.West);
            break;
        default:
            mode = oldMode;
            c = getNext(playingField, c);
            break;
    }
    return c;
}
function nextToShip(c, field) {
    if (mode != ModeEnum.AttackBoat) {
        for (var i = Math.max(c.X - 1, 0); i <= Math.min(c.X + 1, 9); i++) {
            for (var j = Math.max(c.Y - 1, 0); j <= Math.min(c.Y + 1, 9); j++) {
                if (checkState(field, { X: i, Y: j }) == "H")
                    return true;
            }
        }
    }
    return false;
}
function fire(body) {
    if (mode == ModeEnum.Unknown) {
        mode = ModeEnum.Cross1;
    }
    var coord = new Coordinate_1.Coordinate();
    ships = body.ships;
    handleState(body.grid);
    do {
        coord = getNext(body.grid, coord);
    } while (coord == Coordinate_1.Coordinate.Empty || checkState(body.grid, coord) != "U" || nextToShip(coord, body.grid));
    // Fire at the calculated square
    //System.Diagnostics.Debug.WriteLine("Fired at: x:" + c.X + " Y:" + c.Y);
    totalHits++;
    lastShot = coord;
    console.log(name + " fireing at " + lastShot.toString());
    return lastShot;
}
http.createServer(function (request, response) {
    var headers = request.headers, method = request.method, url = request.url;
    if (method === 'POST' && url === '/fire') {
        var temp_1;
        request.on('data', function (body) {
            temp_1 = body;
        }).on('end', function () {
            var responseBody = JSON.parse(temp_1);
            //console.log(battlefield);
            response.on('error', function (err) {
                console.error(err);
            });
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(fire(responseBody)));
        });
    }
    else if (method === "POST" && url === '/initfield') {
        response.statusCode = 404;
        response.end();
    }
    else if (method === "POST" && url === "/reset") {
        mode = ModeEnum.Unknown;
        crossX = -1;
        oldMode = ModeEnum.Unknown;
        direction = DirectionEnum.Unknown;
        lastHit = Coordinate_1.Coordinate.Empty;
        firstHit = Coordinate_1.Coordinate.Empty;
        totalHits = 0;
        lastShot = Coordinate_1.Coordinate.Empty;
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end();
    }
    else {
        response.statusCode = 404;
        response.end();
    }
    request.on('error', function (err) {
        console.error(err);
    });
}).listen(port);
console.log(name + " listening on " + port);
