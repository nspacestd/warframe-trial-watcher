"use strict";

const fs = require('fs');
const util = require('util');
const Watcher = require('./lib/watcher.js');

const config = require('./config.json');

function onNewData(newData) {
  newData.forEach((run) => {
    if(hasWatchedPlayers(run)) {
      let filename = this.url.split('/').slice(-1)[0].split('.')[0];
      logRunToCSV(run, filename);
    }
  });
}

function onError(err) {
  if(err) console.error(err);
}

function hasWatchedPlayers(run) {
  return config.watchedPlayers.includes(run.host) ||
    run.players.some(p => {
    return config.watchedPlayers.includes(p);
  });
}

function logRunToCSV(run, filename) {
  let now = new Date();
  filename = util.format('%s/%d-%d-%d-', config.logFolder,
                         now.getFullYear(), now.getMonth() + 1,
                         now.getDate()) + filename + '.csv';
  let logText = util.format('%s;%s;%s;%s;%s;%s;%s;%s;%s\n', now.toTimeString(),
                            run.objective, run.time, run.prior, run.result,
                            run.kills, run.deaths, run.host,
                            run.players.join(', '));

  fs.appendFile(filename, logText, onError);
}

function main() {
  console.log('Creating watchers');
  let watchers = config.pages.map(url => new Watcher(url, config.delay));

  console.log('Registering event handlers');
  watchers.forEach(watcher => {
    watcher.on('newData', onNewData);
    watcher.on('error', onError);
  });
  
  console.log('Starting watchers');
  watchers.forEach(watcher => watcher.startWatching());
}

main();
