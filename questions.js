const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const fs = require('fs');
const mysql = require('mysql');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
  const body = req.body.Body;
  const player = req.body.From.slice(1);
  const twiml = new MessagingResponse();
  const response = body.toLowerCase().trim();
  let command = '';
  let registration = '';
  
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "twilioTalksSEA"
  });
  
  con.connect();
  
  console.log(player + " texted in " + response);
  
  if (response == 'register' || response == "registered" || response == "register me") {
    getRegistration(player, con, function(registration) {
      //parse the request sent in by the user and look for the first word then set the
      //command varible that will used to determine the proper response later
      if (isEmpty(registration)) {
        var sql = "INSERT INTO answers (phone_num) VALUES (" + player + ")";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(player + " player created");
        });
        client.messages
          .create({
             body: 'Registered!',
             from: '+12063502614',
             to: '+' + player
           });
        client.messages
          .create({
             body: 'First question.  How long has Twilio been in business?',
             from: '+12063502614',
             to: '+' + player
           });
           console.log(player + ' registered.');
      } else {
        client.messages
          .create({
             body: 'You are already registered.  First question.  How long has Twilio been in business?',
             from: '+12063502614',
             to: '+' + player
           });
        console.log(player + ' re-registered.');
      }
    });
  } else {
    //Need to deal with if someone texts in something other than register first
    checkFirstAnswer(player, con, function(answers) {
      if (answers.Q1 == "XXX") {
        return;
      } else if (answers.Q1 == null) {
        if (response == 10 || response == "10 years" || response == "ten" || response == "10 yrs" || response == "10y" || response == "10") {
          var sql = "UPDATE answers SET Q1 = 1 WHERE phone_num = '" + player + "'";
          con.query(sql, function (err, result) {
            if (err) throw err;
            console.log(player + " correctly answered question 1");
          });
        } else {
          var sql = "UPDATE answers SET Q1 = 0 WHERE phone_num = '" + player + "'";
          con.query(sql, function (err, result) {
            if (err) throw err;
            console.log(player + " answered question 1 wrong");
          });
        }
        client.messages
          .create({
             body: 'After the SendGrid acquisition how many customers does Twilio now have?',
             from: '+12063502614',
             to: '+' + player
          });
      } else { //end of Q1 = null
        checkSecondAnswer(player, con, function(answers) {
          if (answers.Q2 == null) {
            if (response == 140000 || response == "140,000" || response == "140000 customers" || response == "140,000 customers" || response == "140k" || response == "140") {
              var sql = "UPDATE answers SET Q2 = 1 WHERE phone_num = '" + player + "'";
              con.query(sql, function (err, result) {
                if (err) throw err;
                console.log(player + " correctly answered question 2");
              });
            } else {
              var sql = "UPDATE answers SET Q2 = 0 WHERE phone_num = '" + player + "'";
              con.query(sql, function (err, result) {
                if (err) throw err;
                console.log(player + " answered question 2 wrong");
              });
            }
            client.messages
              .create({
                 body: 'Which is not a valid TwiML Programmable Voice action?  Pay, Find, Gather, or Say',
                 from: '+12063502614',
                 to: '+' + player
              });
          } else { //end of Q2 = null
            checkAnswer(player, con, function(answers) {
              if (answers.Q3 == null) {
                if (response == "find" || response == "<find>") {
                  var sql = "UPDATE answers SET Q3 = 1 WHERE phone_num = '" + player + "'";
                  con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(player + " correctly answered question 3");
                  });
                } else {
                  var sql = "UPDATE answers SET Q3 = 0 WHERE phone_num = '" + player + "'";
                  con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log(player + " answered question 3 wrong");
                  });
                }
                client.messages
                  .create({
                     body: 'Which of these languages is NOT a supported Twilio SDK language?  C#, Java, Python, Go',
                     from: '+12063502614',
                     to: '+' + player
                  });
              } else { // end of Q3 = null
                checkAnswer(player, con, function(answers) {
                  if (answers.Q4 == null) {
                    if (response == "go") {
                      var sql = "UPDATE answers SET Q4 = 1 WHERE phone_num = '" + player + "'";
                      con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log(player + " correctly answered question 4");
                      });
                    } else {
                      var sql = "UPDATE answers SET Q4 = 0 WHERE phone_num = '" + player + "'";
                      con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log(player + " answered question 4 wrong");
                      });
                    }
                    client.messages
                      .create({
                         body: 'Twilio Flex is built to scale to how many call center agents per instance?',
                         from: '+12063502614',
                         to: '+' + player
                      });
                  } else { // end of Q4 = null
                    checkAnswer(player, con, function(answers) {
                      if (answers.Q5 == null) {
                        if (response == 50000 || response == "50,000" || response == "50000 agentss" || response == "50,000 agents" || response == "50k") {
                          var sql = "UPDATE answers SET Q5 = 1 WHERE phone_num = '" + player + "'";
                          con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log(player + " correctly answered question 5");
                          });
                        } else {
                          var sql = "UPDATE answers SET Q5 = 0 WHERE phone_num = '" + player + "'";
                          con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log(player + " answered question 5 wrong");
                          });
                        }
                        client.messages
                          .create({
                             body: "Twilio's CEO Jeff Lawson has worked at what Seattle based company?",
                             from: '+12063502614',
                             to: '+' + player
                          });
                      } else { // end of Q5 = null
                        checkAnswer(player, con, function(answers) {
                          if (answers.Q6 == null) {
                            if (response == "amazon" || response == "aws" || response == "amzn" || response == "amazon.com" || response == "amz") {
                              var sql = "UPDATE answers SET Q6 = 1 WHERE phone_num = '" + player + "'";
                              con.query(sql, function (err, result) {
                                if (err) throw err;
                                console.log(player + " correctly answered question 6");
                              });
                            } else {
                              var sql = "UPDATE answers SET Q6 = 0 WHERE phone_num = '" + player + "'";
                              con.query(sql, function (err, result) {
                                if (err) throw err;
                                console.log(player + " answered question 6 wrong");
                              });
                            }
                            client.messages
                              .create({
                                 body: "What object does Twilio's logo respresent? Phone, Button, Jeff Lawson Family Crest, None",
                                 from: '+12063502614',
                                 to: '+' + player
                              });
                          } else { // end of Q6 = null
                            checkAnswer(player, con, function(answers) {
                              if (answers.Q7 == null) {
                                if (response == "phone" || response == "telephone") {
                                  var sql = "UPDATE answers SET Q7 = 1 WHERE phone_num = '" + player + "'";
                                  con.query(sql, function (err, result) {
                                    if (err) throw err;
                                    console.log(player + " correctly answered question 7");
                                  });
                                } else {
                                  var sql = "UPDATE answers SET Q7 = 0 WHERE phone_num = '" + player + "'";
                                  con.query(sql, function (err, result) {
                                    if (err) throw err;
                                    console.log(player + " answered question 7 wrong");
                                  });
                                }
                                client.messages
                                  .create({
                                     body: 'Which Twilio API can be leveraged for building intelligent bots, IVRs, and Alexa apps, using natural language understanding and machine learning framework?',
                                     from: '+12063502614',
                                     to: '+' + player
                                  });
                              } else { // end of Q7 = null
                                checkAnswer(player, con, function(answers) {
                                  if (answers.Q8 == null) {
                                    if (response == "autopilot" || response == "auto-pilot" || response == "auto pilot") {
                                      var sql = "UPDATE answers SET Q8 = 1 WHERE phone_num = '" + player + "'";
                                      con.query(sql, function (err, result) {
                                        if (err) throw err;
                                        console.log(player + " correctly answered question 8");
                                      });
                                    } else {
                                      var sql = "UPDATE answers SET Q8 = 0 WHERE phone_num = '" + player + "'";
                                      con.query(sql, function (err, result) {
                                        if (err) throw err;
                                        console.log(player + " answered question 8 wrong");
                                      });
                                    }
                                    client.messages
                                      .create({
                                         body: 'Which Twilio customer uses Authy for account security? Pinterest, Twitch, TransferWise, All of them',
                                         from: '+12063502614',
                                         to: '+' + player
                                      });
                                  } else { // end of Q8 = null
                                    checkAnswer(player, con, function(answers) {
                                      if (answers.Q9 == null) {
                                        if (response == "all" || response == "all of them" || response == "pinterest, twitch, transferwise" || response ==  "pinterest, twitch and transferwise") {
                                          var sql = "UPDATE answers SET Q9 = 1 WHERE phone_num = '" + player + "'";
                                          con.query(sql, function (err, result) {
                                            if (err) throw err;
                                            console.log(player + " correctly answered question 9");
                                          });
                                        } else {
                                          var sql = "UPDATE answers SET Q9 = 0 WHERE phone_num = '" + player + "'";
                                          con.query(sql, function (err, result) {
                                            if (err) throw err;
                                            console.log(player + " answered question 9 wrong");
                                          });
                                        }
                                        client.messages
                                          .create({
                                             body: "Thank you for playing, and we hope to see you at Twilio's customer and developer conference in San Francisco August 6 & 7th, Twilio Signal. https://signal.twilio.com/",
                                             from: '+12063502614',
                                             to: '+' + player
                                          });
                                      } else { // end of Q9 = null
                                        client.messages
                                          .create({
                                             body: "Thanks for playing, you've come to the end of the road.  https://youtu.be/zDKO6XYXioc?t=63",
                                             from: '+12063502614',
                                             to: '+' + player
                                          });
                                      } //end of Q9 if/else
                                    }); //end of checkEigthAnswer
                                  } //end of Q8 if/else
                                }); //end of checkEigthAnswer
                              } //end of Q7 if/else
                            }); //end of checkSeventhAnswer
                          } //end of Q6 if/else
                        }); //end of checkSixthAnswer
                      } //end of Q5 if/else
                    }); //end of checkFifthAnswer
                  } //end of Q4 if/else
                }); //end of checkFourthAnswer
              } //end of Q3 if/else
            }); //end of checkThirdAnswer
          } //end of Q2 if/else
        }); //end of checkSecondAnswer
      } //end of Q1 else
    }); //end of checkFirstAnswer
  } //end of first if/else

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

app.post('/status/', (req, res) => {
  console.log("Message Status: " + req.body.MessageStatus);
});

http.createServer(app).listen(8080, () => {
  console.log('Express server listening on port 8080');
});

var readList = (listFile) => {
  return fs.readFileSync(listFile, 'utf8').split(',');
};

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function getRegistration(player, con, callback) {
  //query the database to see if phone number is already a registered player
  let sql = "SELECT * FROM answers WHERE phone_num = '" + player + "'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    let reg = result[0];
    return callback(reg);
  });
}

function checkFirstAnswer(player, con, callback) {
  //query the database to see if the first question has been answered
  let sql = "SELECT * FROM answers WHERE phone_num = '" + player + "'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    if (!isEmpty(result)) {
      let answers = result[0];
      return callback(answers);
    } else {
      client.messages
          .create({
             body: "I don't see that you're registered to play yet.  Please text back the word 'register' if you would like to register your phone number to play the trivia game.",
             from: '+12063502614',
             to: '+' + player
          });
      let answers = {Q1:"XXX"};
      return callback(answers);
    }
  });
}

function checkSecondAnswer(player, con, callback) {
  //query the database to see if the first question has been answered
  let sql = "SELECT * FROM answers WHERE phone_num = '" + player + "'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    let answers = result[0];
    return callback(answers);
  });
}

function checkAnswer(player, con, callback) {
  //query the database to see if the first question has been answered
  let sql = "SELECT * FROM answers WHERE phone_num = '" + player + "'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    let answers = result[0];
    return callback(answers);
  });
}
