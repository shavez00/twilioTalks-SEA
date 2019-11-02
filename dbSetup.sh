#!/bin/bash
echo What is the user name you want to use to access the database?
read username
export DATABASE_USER_NAME=$username

echo What is the password you want to use to accesss the databasse?
read password
export DATABASE_PW=$password

export PATH=${PATH}:/usr/local/mysql/bin

mysql -uroot -p -e "CREATE USER '$username'@'localhost' IDENTIFIED WITH mysql_native_password BY '$password'; GRANT ALL PRIVILEGES ON *.* TO '$username'@'localhost';"

echo -e "[mysql]\nuser=$username\npassword=$password\n\n[mysqldump]\nuser=$username\npassword=$password" > ~/.my.cnf
chmod 600 ~/.my.cnf

echo User created.
echo What is the name you want to use for the database.
read database
export DATABASE=$database

mysql -u $username -e "CREATE DATABASE $database; USE $database; CREATE TABLE questions (qid int NOT NULL AUTO_INCREMENT, question VARCHAR(255), answer VARCHAR(255), PRIMARY KEY(qid));"
echo Database created

mysql -u $username -e "USE $database; CREATE TABLE participantAnswers (pid int NOT NULL AUTO_INCREMENT, phone_num VARCHAR(255), PRIMARY KEY(pid));"


echo How many questions are you going to ask in the survey?
read numQuestions

for (( i=1; i<=$numQuestions; i++ ))
	do
		echo What is question number $i?
		read question
		echo What is the answer to question number $1?
		read answer
		mysql -u $username -e "USE $database; INSERT INTO questions (question, answer) VALUES ( \"$question\",  \"$answer\" ); ALTER TABLE participantAnswers ADD q$i INT"
	done

echo Questions created
echo Now launching survey
node questions.js
