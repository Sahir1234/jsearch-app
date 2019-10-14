from flask import Flask, request, render_template, jsonify, redirect
import datetime
import calendar
from pytz import timezone
import requests
import json

app = Flask(__name__)

URL = 'http://jservice.io/api/'

CATEGORIES = {}

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

@app.route('/')
def index():
    return render_template('index.html', categories=list(CATEGORIES.keys()))

@app.errorhandler(404)
@app.errorhandler(400)
def page_not_found(e):
    return redirect('/')

@app.route('/api')
def get_data():

    url = URL + 'clues'

    params = {}

    value = request.args["val"]
    category = request.args["cat"]
    year = int(request.args["yr"])
    month = int(request.args["mon"])
    date = int(request.args["day"])
    search_type = request.args["type"]

    if int(value) > 0:
        params["value"] = request.args["val"]
    
    if category in CATEGORIES.keys():
        params["category"] = CATEGORIES[category]
    elif category:
        params["category"] = -1

    if not search_type == "all":

        min_date = None
        max_date = None

        if search_type == "year":
            min_date = datetime.datetime(year, 1, 1)
            max_date = datetime.datetime(year+1,1,1)
        elif search_type == "month":
            min_date = datetime.datetime(year,month,1)
            max_date = min_date.replace(day = calendar.monthrange(year, month)[1])
        else:
            min_date = datetime.datetime(year, month, date)
            adjustment_value = 7 if (search_type == "week") else 1
            max_date = min_date + datetime.timedelta(days=adjustment_value)  

        max_date = max_date - datetime.timedelta(seconds=1)

        params["min_date"] = str(min_date.isoformat())
        params["max_date"] = str(max_date.isoformat())

    if not params:
        url = URL + 'random'
        params["count"] = 50

    r = requests.get(url=url, params=params)
    data = r.json()

    return jsonify(data)


if(__name__ == '__main__'):
    get_categories()
    app.run(port=8888)
