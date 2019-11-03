const config = require('./config');
const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const fs = require('fs');
const mysql = require('mysql');

const client = require('twilio')(config.accountSid, config.authToken);
const from = config.from;
const databasePW = config.databasePW;
const databaseUsername = config.databaseUsername;
const database = config.database;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
  const body = req.body.Body;
  const player = req.body.From.slice(1);
  const twiml = new MessagingResponse();
  const response = body.toLowerCase().trim();
  let playerName = '';
  let registration = '';

  var con = mysql.createConnection({
    host: "localhost",
    user: databaseUsername,
    password: databasePW,
    database: database
  });

  con.connect();

  console.log(player + " texted in " + response);

  getRegistration(player, con, function(registration) {
    //parse the request sent in by the user and look for the first word then set the
    //command varible that will used to determine the proper response later
    if (isEmpty(registration) && (response != 'register')) {
      client.messages
        .create({
           body: 'If you would like to play, please text back "Register"',
           from: from,
           to: '+' + player
         });
    } else if (isEmpty(registration)) {
      getRegistration(player, con, function(registration) {
        //parse the request sent in by the user and look for the first word then set the
        //command varible that will used to determine the proper response later
        if (isEmpty(registration)) {
          var sql = "INSERT INTO participantAnswers (phone_num, q1) VALUES (" + player + ", '3')";
          con.query(sql, function (err, result) {
            if (err) throw err;
            console.log(player + " player created");
          });
          checkForName(player, con);
          client.messages
            .create({
               body: 'Registered!',
               from: from,
               to: '+' + player
             });
          getQuestions(player, con, function(questions) {
               client.messages
                 .create({
                    body: 'First question.  ' + questions[0].question,
                    from: from,
                    to: '+' + player
                  });
                  console.log(player + ' registered.');
             });
        } else {
          getQuestions(player, con, function(questions) {
               client.messages
                 .create({
                    body: 'You are already registered.  First question.  ' + questions[0].question,
                    from: from,
                    to: '+' + player
                  });
                  console.log(player + ' re-registered.');
             });
        }
      });
    } else {
      getNumOfQuestions(player, con).then(function(numOfQuestions){
        for (i=0; i < numOfQuestions; i++){
          getNextQuestion(player, con, i).then(function(nextQuestion) {
            let qid = nextQuestion.replace('q','');
            getNextAnswer(player, con, qid, function(answer) {
              if (response == answer.toLowerCase()) {
                logCorrectAnswer(player, con, qid);
                advanceToNextQuestion(player,con, qid);
              } else {
                logWrongAnswer(player, con, qid);
                advanceToNextQuestion(player,con, qid);
              }
            })
          })
        }
      });
    }
  });
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

http.createServer(app).listen(8080, () => {
  console.log('Express server listening on port 8080');
});

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function getRegistration(player, con, callback) {
  //query the database to see if phone number is already a registered player
  let sql = "SELECT * FROM participantAnswers WHERE phone_num = '" + player + "'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    let reg = result[0];
    return callback(reg);
  });
}

function getAnswers(player, con, counter, callback) {
  //query the database to see if phone number is already a registered player
  let sql = "SELECT * FROM participantAnswers WHERE phone_num = '" + player + "'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    return callback(result[0], counter);
  });
}

function getQuestions(player, con, callback) {
  //query the database to see if phone number is already a registered player
  let sql = "SELECT * FROM questions";
  con.query(sql, function (err, result) {
    if (err) throw err;
    return callback(result);
  });
}

function getNextAnswer(player, con, qid, callback) {
  //query the database to see if the first question has been answered
  let sql = "SELECT answer FROM questions WHERE qid = '" + qid + "'";
  con.query(sql, function (err, result) {
    //if (err) throw err;
    return callback(result[0].answer);
  });
}

function logCorrectAnswer(player, con, qid) {
  //query the database to see if the first question has been answered
  let sql = "UPDATE participantAnswers SET q" + qid + "='1' where phone_num='" + player + "'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(player + " correct answer logged for question " + qid);
  });
}

function logWrongAnswer(player, con, qid) {
  //query the database to see if the first question has been answered
  let sql = "UPDATE participantAnswers SET q" + qid + "='0' where phone_num='" + player + "'";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(player + " incorrect answer logged for question " + qid);
  });
}

function advanceToNextQuestion(player, con, qid) {
  qid++;
  //query the database to see if the first question has been answered
  let sql = "UPDATE participantAnswers SET q" + qid + "='3' where phone_num='" + player + "'";
  con.query(sql, function (err, result) {
    if (err) {
      console.log(player + " has answered all of the questions.");
      client.messages
      .create({
        body: "Thanks for playing, you've come to the end of the road.  https://youtu.be/zDKO6XYXioc?t=63",
        from: from,
        to: '+' + player
      });
    } else {
      console.log(player + " now on question " + qid);
      getQuestion(player, con, qid).then(function(question) {
        client.messages
          .create({
             body: question,
             from: from,
             to: '+' + player
           });
      });
    }
  });
}

function getNumOfQuestions(player, con){
  return new Promise(function(resolve, reject) {
    //query the database to see if phone number is already a registered player
    let sql = "SELECT * FROM questions";
    con.query(sql, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.length);
      }
    });
  });
}

function getNextQuestion(player, con, counter) {
  return new Promise(function(resolve, reject) {
    getAnswers(player,con, counter+1, function(answers, counter){
      let questionNumber = 'q' + counter;
      if (answers[questionNumber] == '3') {
        resolve(questionNumber);
      }
    })
  })
}

function getQuestion(player, con, questionNum) {
  //query the database to see if phone number is already a registered player
  let sql = "SELECT question FROM questions where qid=" + questionNum;
  return new Promise(function(resolve, reject) {
    con.query(sql, function (err, result) {
        resolve(result[0].question);
    });
  });
}

function checkForName(player, con) {
  async function nameGather(player) {
    let lookup = client.lookups.phoneNumbers('+' + player)
          .fetch({type: ['caller-name']})
          .then(info => {
            var name = info.callerName.caller_name;
            name = name.substring(0, name.indexOf(' '));
            return name;
          });

      let result = await lookup;

      return (result);
  }

  nameGather(player).then(name => {
    //query the database to see if the first question has been answered
    let sql = "UPDATE participantAnswers SET name='" + name + "' where phone_num='" + player + "'";
    con.query(sql, function (err, result) {
      if (err) console.log(err);
      console.log(player + " also has the name of " + name);
    });

  }).catch(err => {
    console.log(err);
    //console.log("Phone lookup failed");
  })
}
