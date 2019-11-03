  # A Demonstration of the Twilio SMS services using [Node.js](https://nodejs.org/en/), [MySQL](https://www.mysql.com/), and the [Twilio Programmable SMS API](https://www.twilio.com/sms).

This is a Node.js program to demonstrate the Twilio Programmable SMS API by sending SMS messages to survey participants. Participants get questions and respond to answers.  Answers are saved into a MySQL database.  A winner of the contest is determined by who answers the most number of questions correctly.

## Getting Started

Step 1.  Install Node.js.</br>
Step 2.  Install MySQL.</br>
Step 3.  Install [Express](https://expressjs.com/).</br>
Step 4.  Install [Twilio helper libraries](https://www.twilio.com/docs/libraries/node).</br>
Step 5.  Install the [MySQL node Module](https://www.npmjs.com/package/mysql).</br>
Step 6.  Input your twilio phone in the config file as the "from" number.</br>
Step 7.  Run the Node.js program with the commands "node questions.js".</br>

## Running the demonstration

Using the demonstration is very straightforward.  Display your Twilio phone number and request participants to text the number.  The Node.js program will respond to the text with questions and will accept their responses to the questions and compare them to a list of acceptable answers and log which ones the participants gets correct.

### Prerequisites

[A Twilio account](https://www.twilio.com/console)</br>
[A Twilio phone number](https://www.twilio.com/docs/phone-numbers)</br>
[Node.js](https://nodejs.org/en/)</br>
[MySQL](https://www.mysql.com/)</br>

## Authors

* **Mark Shavers** - *Initial work* - [shavez00](https://github.com/shavez00)
