# import necessary packages 
from flask import Flask, request, render_template, jsonify, redirect
from datetime import datetime
import requests
import json

app = Flask(__name__)

# url for API calls used later
URL = 'http://jservice.io/api/'

# dictionary to map all category IDs to category names
CATEGORIES = {}

# This function 
def get_categories():

    url = URL + 'categories'

    params = {'count': 100, 'offset': 0}
    
    r = requests.get(url=url)
    data = r.json()

    while(len(data) > 0):
        for i in range(0,len(data)):
            if(data[i]["title"] == None or data[i]["id"] == None):
                continue
            CATEGORIES[data[i]["title"]] = data[i]["id"]
        params["offset"] += 100
        r = requests.get(url=url, params=params)
        data = r.json()

# 
@app.route('/')
def index():
    return render_template('index.html', categories=list(CATEGORIES.keys()))

@app.route('/api-connector')
def get_data():

    url = URL + 'clues'

    params = {}

    value = int(request.args["value"])
    category = request.args["category"]
    search_type = request.args["searchType"]

    if value > 0:
        params["value"] = value

    if category in CATEGORIES.keys():
        params["category"] = CATEGORIES[category]
    elif category:
        params["category"] = -1

    if search_type == "between":

        min_date = datetime(int(request.args["startYear"]), int(request.args["startMonth"]), int(request.args["startDate"]))
        max_date = datetime(int(request.args["endYear"]), int(request.args["endMonth"]), int(request.args["endDate"]))

        params["min_date"] = min_date.isoformat()
        params["max_date"] = max_date.isoformat()

    params["offset"] = int(request.args["offset"])

    r = requests.get(url=url, params=params)
    data = r.json()

    return jsonify(data)

# Handler for 
@app.errorhandler(404)
@app.errorhandler(400)
def page_not_found(e):
    return redirect('/')

# 
if(__name__ == '__main__'):
    get_categories()
    app.run(port=8888)
