
var request    = require('request');
var fs         = require('fs');
var JSONStream = require('JSONStream');

var input = 'remote';

process.argv.forEach(function (val, index, array) {
  if (val == '-local') {
    input = 'local';
  }
});

var user = 'mathieu-pousse';

console.log('extracting from ' + input);
console.log('using user ' + user);

if (input == 'local') {
  listRepositories = function() {
    return fs.createReadStream('./data/repositories.json', 'utf8');
  }
  listPullRequests = function(repository) {
    return fs.createReadStream('./data/' + repository + '-pulls.json', 'utf8');
  }
} else {
  listRepositories = function() {
    return request('https://api.github.com/users/' + user + '/repos?type=forks');
  }
  listRepositories = function(repository) {
    return request('https://api.github.com/users/' + user + '/' + repository + '/pulls');
  }
}

function loopOverRepositories(repositories) {
  repositories.forEach(function (repository) {
      console.log(' + ' + repository.name);
      console.log('  \\_ fork: ' + repository.fork);
      if (!repository.fork) {
        return;
      }
      console.log('   |_ origin: ' + repository.fork);
    })
}

var repositoriesStream = listRepositories();

repositoriesStream.on('data', function(data) {
    if (this._repositories === undefined) {
      this._repositories = '';
    }
    this._repositories += data.toString();
})
                  .on('end', function() {
    loopOverRepositories(JSON.parse(this._repositories));
})

