"use strict";

const cheerio = require('cheerio');

class Scoreboard {
  constructor(html) {
    let $ = cheerio.load(html);

    this.rows = $('tr').map((i, el) => {
      if(!i) return;

      let data = $(el).children('td');
      let players = data.eq(7).text().split(', ');
      let row = {
        objective:  data.eq(1).text(),
        time:       data.eq(2).text(),
        prior:      data.eq(3).text(),
        result:     data.eq(4).text(),
        kills:      parseInt(data.eq(5).text()),
        deaths:     parseInt(data.eq(6).text()),
        host:       players.shift(),
        players:    players 
      };

      return row;
    }).get();
  }

  hasRow(otherRow) {
    return this.rows.some(row => {
      return JSON.stringify(otherRow) === JSON.stringify(row);
    });
  }

  diff(s) {
    return this.rows.filter(row => {
      return !(s.hasRow(row));
    });
  }

}

module.exports = Scoreboard;
