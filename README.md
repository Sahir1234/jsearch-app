
# Jeopardy Search Application

This project is a web application that allows users to query an archive of
Jeopardy questions and filter out based on the point value, category, and 
even by the date the question was aired. It also allows users to mark questions
as favorites and save them so that even when they exit the app and return to it later,
those questions will still be accessible.

## Technologies

This app is built around the [jService](http://jservice.io) API, which supplies the raw JSON data
that the app displays. It uses the Python micro web framewrok `Flask` in conjunction
with the `requests` and `json` libraries in Python in order to set up routes that can render
webpages and process user requests for data. The webpages were built using `HTML`, styled
with `CSS`, and animated with `JavaScript`. The client-side script also uses a library
called `jQuery` to simplify responses to button clicks and make API calls when necessary.
However, one challenge I faced when writing the JavaScript portion of the project was
figuring out how to store user data even after they close the app (for the favorite 
questions feature). As a result, I looked into Web APIs and incorporated the `sessionStorage`
and `localStorage` properties into my JavaScript code in order to store "stringified" JSON data
representing the user's saved  questions. Finally, the app is deployed on Heroku at the 
following URL: [https://jsearch-app.herokuapp.com](https://jsearch-app.herokuapp.com).

## Purpose and Contributions

This application was developed by Sahir Mody. If you wish to contribute, please
submit a pull request or contact sahir.mody@gmail.com for more information
on how to contribute. Some new features I would like to add in future development
that I did not have time to do for this challenge include adding a game feature 
where users can play Jeopardy using their saved questions and a login system that keep
track of users activity and and favorite questions in a more secure way.


