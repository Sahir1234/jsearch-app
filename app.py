# import necessary packages
from flask import Flask, request, render_template, jsonify, redirect
from datetime import datetime
import requests
import json



app = Flask(__name__)

# url for API calls used later
URL = 'http://jservice.io/api/'


# Main route to render the home page of the app
@app.route('/')
def index():
    return render_template('index.html')


# route to get all the categories so that they can be used in the autocomplete
@app.route('/categories')
def get_categories():

    categories = {}

    url = URL + 'categories'

    # count is 100 because that is the maximum number of categories
    # that can be retrieved in one API call
    params = {'count': 100, 'offset': 0}
    
    r = requests.get(url=url, params=params)
    data = r.json()

    # keep getting batches of categories while the batches are nonempty
    while(len(data) > 0):

        for i in range(0,len(data)):

            # if any of the category data is missing, ignore that result
            if(data[i]["title"] == None or data[i]["id"] == None):
                continue

            # add the category data to the dictionary
            categories[data[i]["title"]] = data[i]["id"]

        # increment ofsfset by 100 to get the next batch of categories
        params["offset"] += 100

        r = requests.get(url=url, params=params)
        data = r.json()

    return json.dumps(list(categories.keys()))


# Connector to API to process search filters and properly format
# API call based on user's search parameters
@app.route('/api-connector')
def get_data():

    # if the search was for random questions, we don't need to look at the other arguments
    if (request.args["random"] == "true"):

        url = URL + 'random'
        params = {'count' : int(request.args["count"])}

        r = requests.get(url=url, params=params)
        data = r.json()

        return jsonify(data)

    url = URL + 'clues'

    params = {}

    # read in some of the user's arguments
    value = int(request.args["value"])
    category = request.args["category"]
    search_type = request.args["searchType"]

    # add value parameter if user  does not wnat  to search for all values
    if value > 0:
        params["value"] = value

    # add category ID as category parameter if the user entered a valid category or
    # add -1 as category ID parameter if the user entered an invalid category
    # (so that the query does not return any results) 
    if category in CATEGORIES.keys():
        params["category"] = CATEGORIES[category]
    elif category:
        params["category"] = -1

    
    # add the max and min date parameters if required by the user's filter selection
    if search_type == "between":

        min_date = datetime(int(request.args["startYear"]), int(request.args["startMonth"]), int(request.args["startDate"]))
        max_date = datetime(int(request.args["endYear"]), int(request.args["endMonth"]), int(request.args["endDate"]))

        params["min_date"] = min_date.isoformat()
        params["max_date"] = max_date.isoformat()

    # offset parameter that will be used for pagination on the webpage
    params["offset"] = int(request.args["offset"])

    r = requests.get(url=url, params=params)
    data = r.json()

    return jsonify(data)

# Handler for errors whenever user goes to an invalid route that
# redirects them back to 
@app.errorhandler(404)
@app.errorhandler(400)
def page_not_found(e):
    return redirect('/')


if(__name__ == '__main__'):
    get_categories()
    app.run()
