//require necessary packages/files/etc
const keys = require ('./keys.js');
const fs = require('fs');
const request = require('request');
const twitter = require('twitter');
const Spotify = require('node-spotify-api');
const colors = require('colors');
const asciify = require('asciify');

//record user inputs
var command = process.argv[2];
var input = process.argv.slice(3).join(' ');

//log function
var log = (data) => {
  console.log(data)
  fs.appendFile('log.txt', data, (err => {
    if (err) throw err;
  }))
}

//initializing app
var app = {};
const client = new twitter(keys.twitterKeys);
const spotify = new Spotify(keys.spotifyKeys)
var songPreview ='not-me'; 

//logi for my-tweet
app['my-tweets'] =  () => {
  log(colors.cyan('<Showing the latest 20 tweets from Senator Elizabeth Warren>'))
  client.get('statuses/user_timeline', { screen_name: 'SenWarren', count: 20 }, (err, data, res) => {
    if (err) throw err; 
    data.forEach((v) => {
      log('=================================================================')
      log(colors.green(`Tweet: ${v.text}`));
      log(colors.yellow(`Created: ${v.created_at}`));
    })
  })
};
//logic for spotify
app['spotify-this-song'] = (search) => {
  var output = '';
  //default search title
  if (!search) {
    search = 'The Sign';
  }
  spotify.search({type: 'track', query: search}, (err, data) => {
    if (err) throw err; 
      // var v = data.tracks.items[0];
    data.tracks.items.forEach((v) => {
      log('=================================================================')
      //artist name
      var artists ='';
      v.artists.forEach((v) => (artists += `${v.name} `))
      log(colors.green(`Artists: ${artists}`))
      //song name
      log(colors.yellow(`Song name: ${v.name}`))
      //preview link
      log(colors.magenta(`Preview link: ${v.preview_url}`))
      //album name
      log(colors.cyan(`Album name: ${v.album.name}`))
    })
    songPreview = data.tracks.items[0].preview_url;
  })
}
app['movie-this'] = (movie) => {
  if (!movie){
    movie = 'Mr. Nobody';
  }
  var queryURL = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=40e9cece";
  request(queryURL, (err, res, movieStr) => {
    if (err) throw err;  
    //first parse the return str
    var data = JSON.parse(movieStr);
    //display non-rotten-tomatoes-rating info
    const categories = ['Title', 'Year', 'Country', 'Language', 'Plot','Actors','imdbRating']
    var movieInfo = (arr) => {
      arr.forEach((v) => (log(`${v}: ${data[v]}`)))
    }
    movieInfo(categories);
    //display rotten tomatoes rating
    log(`RottenTomatesRating: ${data.Ratings.filter((obj) => (obj.Source === 'Rotten Tomatoes'))[0].Value}`)
  })
}
app['do-what-it-says'] = function () {
  var that = this;  
  fs.readFile('random.txt', 'utf8', function (err, data) {
    if (err) throw err;  
    var newCommand = data.slice(0, data.indexOf(','))
    var newInput = data.slice(data.indexOf(',') + 2, -1);
    that[newCommand](newInput);
    setTimeout(()=> (asciify('Awesome', function(err, res){ log(res) })), 2000)
  })
}

app[command](input);

