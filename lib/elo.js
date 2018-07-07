'use strict';


const factor = 40;

/**
 * calculates ELO for player A.
 * to calculate player B, just call `elo(b, a, score);` again
 *
 * @see https://de.wikipedia.org/wiki/Elo-Zahl
 *
 * @param {integer} Ra - actual score of player A
 * @param {integer} Rb - actual score of player B
 * @param {float|integer} score - player A gets either 1 (won), 0.5 (stale) or 0 (lost) points.
 */
module.exports = exports = (Ra, Rb, score) => {
  if (score !== 0 && score !== 0.5 && score !== 1) {
    throw new RangeError(`score must be either 0, 0.5 or 1; ${score} given.`);
  }

  const diff = (Rb - Ra) > 0 ? Math.min(Rb - Ra, 400) : Math.max(Rb - Ra, -400);
  const Ea = 1 / (1 + 10 ** (diff / 400));

  return Ra + factor * (score - Ea);
};
