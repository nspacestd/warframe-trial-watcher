"use strict";

const util = require('util');
const http = require('http');
const EventEmitter = require('events').EventEmitter;
const Scoreboard = require('./scoreboard.js');


class Watcher extends EventEmitter {
  constructor(url, delay) {
    super();

    this.url = url;
    this.delay = delay;
    this.timeout = null;
    this.oldScoreboard = null;
  }

  httpGet() {
    return new Promise((resolve, reject) => {
      let request = http.get(this.url, (response) => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(new Error('Failed to load page, status code: ' + response.statusCode));
        }
        let body = [];
        response.on('data', (chunk) => body.push(chunk));
        response.on('end', () => resolve(body.join('')));
      });
      request.on('error', (err) => reject(err))
    });
  }

  startWatching() {
    if(this.timeout) return;
    this.getNewData();
    this.timeout = setInterval(() => {this.getNewData();}, this.delay);
  }

  stopWatching() {
    if(!this.timeout) return;
    clearInterval(this.timeout);
    this.timeout = null;
  }

  getNewData() {
    this.httpGet()
    .then(html => new Scoreboard(html))
    .then(scoreboard => {
      let diff;
      if(!this.oldScoreboard){
        diff = scoreboard.rows;
      } else {
        diff = scoreboard.diff(this.oldScoreboard);
      }
      this.oldScoreboard = scoreboard;

      return diff;
    })
    .then(diff => {
      if(diff) this.emit('newData', diff);
    })
    .catch(err => {
      this.emit('error', err);
    });
  }
}

module.exports = Watcher;
