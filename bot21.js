console.log('å vi er i gang dere!');

//Get the twit module for using the Twitter API
var Twit = require('twit');

//config is the file with the API keys
var config = require('./config');

//Filesystem module
var fs = require('fs');

//Exec can execute commandline commands
var exec = require('child_process').exec;

//Set up and instance of Twit with your credentials
var T = new Twit(config);

//get a stream object that can listen for events
var stream = T.stream('user');

//Get the serialport module to be able to communicate with the Arduino
var SerialPort = require('serialport');

//initialize the port
var port = new SerialPort('/dev/ttyACM0', function(err){
		if(err){
			console.log("Error finding the port");
		}
	});

//Set the stream object up to listen for incoming tweets and call the 
//tweetEvent funciton
stream.on('tweet', tweetEvent);

function tweetEvent(eventMsg){
	//eventMsg contains all the data from the incoming tweet
	var replyto = eventMsg.in_reply_to_screen_name;
	var text = eventMsg.text;
	var from = eventMsg.user.screen_name;

	console.log(replyto + ' ' + from + ' ' + text);
	//check that it was sent to your account
	if(replyto === 'your twitter'){	// check for your twitter id
		var newtweet = '@' + from + " Hva skjer a?";
		//send the message to the tweetIt function to send a reply
		tweetIt(newtweet);
		//Print a message on the lcd screen of the Arduino
		port.write(" " + newtweet, function(err) {
  			if (err) {
		    	return console.log('Error on write: ', err.message);
  			}
			console.log('Melding sendt');
			});
	}

}

function tweetIt(txt){
	//tweetIt collects the message to be sent, takes a picture and 
	//sends it as a reply
	//txt is the text in the reply message
	
	//send a command to take picture with the camera
	var cmd = 'raspistill -o bilde.jpg'
	exec(cmd, prosess);

	function prosess(){
		//encode and upload the picture to Twitter
		var filnavn = 'bilde.jpg';
		var parameter = {
			encoding: 'base64'
		}

		var b64 = fs.readFileSync(filnavn, parameter);
		T.post('media/upload',{media_data: b64}, uploaded);

		function uploaded(err, data, response){
			//post a tweet with a text message and the picture that 
			//was uploaded
			var id = data.media_id_string;
			var tweet = {
                		status: txt,
				media_ids: [id]
			}
			T.post('statuses/update',tweet,tweeted);
		}

		function tweeted(err,data,response){
			if(err){
				console.log("Something went wrong!");
			}else{
				console.log("It worked!");
			}
		}
	}

}


