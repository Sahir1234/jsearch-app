
// animation time for table and button animations
const fadeTime = 900;

// base URL for HTTP requests for data to display
const URL = 'https://jsearch-app.herokuapp.com/';

/*
 * Store the offset as session variable so that it can be
 * used when user requests to see next page of results 
 */
sessionStorage.setItem('offset', '0');

/* 
 * If the local storage has been cleared out, reset the favorites
 * item so that user can safely store their favorite questions
 */
if(localStorage.getItem('favorites') == null) {
  localStorage.setItem('favorites','[]');
}

// get all the categories so that they can be used by the autocomplete
$.ajax(
  {
    url: URL.concat('get-categories'),
    type: 'GET',
    success: function(result) {

      var potentialCategories = JSON.parse(result);

      $( "#category" ).autocomplete({
        source: function(request, response) {
      
          // adjust the autocomplete suggestions every time user types
          var results = $.ui.autocomplete.filter(potentialCategories, request.term);

          // only show 30 suggestions to keep the app from getting too slow
          response(results.slice(0, 30));
    
        }

      });

    },
    error: function(xhr,status,error) {
      
      // log the errors and alerts that an error has occurred
      console.log(xhr);
      console.log(status);
      console.log(error);
      alert("UNABLE TO LOAD CATEGORIES FOR CATEGORY AUTOCOMPLETE! ENSURE THAT YOU ARE USING HTTPS TO ACCESS THIS APP!");

    }
  }
);

/*
 * When the user changes the month, this function adjusts the date as well since different months have different amounts of days
 * (prevents the user from entering an invalid date)
 *
 * @param {string} dateElement string with the jQuery selector for either the startingDate element or the endingDate element
 * @param {int} month that the user has selected
 * @param {int} year that the user has selected
 */
function respondToMonthChange(dateElement, month, year) {

  // remove all date options after the 28th since 28 is the minimum number of days in a month
  $(dateElement + ' option:gt(27)').remove();

  // keeps track of how many days we have to add after 28 based on the year and month
  var daysToAdd = 0;


  if(month == 2) {

    if(year % 4  == 0) {

      // for February in a leap year, we must add 29 which means we need one extra day
      daysToAdd = 1;

    }

  } else if(month == 4 || month == 6 ||  month == 9 || month == 11) {

    // if the month is April, June, September, or November, only add 2 days to make the day total 30
    daysToAdd = 2;

  } else {

    // if the month is anything else, add 3 days to make the day total 31
    daysToAdd = 3;
  }

  for (var i = 1; i <= daysToAdd; i++) { 

    $(dateElement).append('<option value='+(i+28).toString()+'>'+(i+28).toString()+'</option>');

  }

}



/*
 * When the user changes the year, this function adjusts the date as well since February has a different number of days based on the year
 * (prevents the user from entering an invalid date)
 *
 * @param {string} dateElement string with the jQuery selector for either the startingDate element or the endingDate element
 * @param {int} month that the user has selected
 * @param {int} year that the user has selected
 */
function respondToYearChange(dateElement, month, year) {

  // if the month is not February, date does not need to be adjusted if the year changes
  if(month == 2) {

    // remove all date options after the 28th since 28 is the minimum number of days in February
    $(dateElement + ' option:gt(27)').remove();

    if( year % 4 == 0) {

      // add 29 as a day option for leap years
      $(dateElement).append('<option value='+29+'>'+29+'</option>');

    }

  }

}



/*
 * Reads the inputs for the filter fields that the user selected and stores them in an object that can be used as arguments
 * for an HTTP request or API call
 * 
 * @return {Object} args containing arguments that can be used when making requests to API
 */
function getArgs() {

  var args = new Object();

  // read the point value field and store the integer value
  args.value = parseInt($( '#values option:selected' ).val());
    
  // read the sting that the user has entered in the category field
  args.category = $( 'input[name=category]' ).val();

  // read the string value corresponding to which radio button the user selection for the airdate filter
  args.searchType = $("input[name='airtime']:checked").val();

  if(args.searchType == 'between') {

    // if the user wants to filter between two dates, the day slection fields are read and stored in args
    args.startYear = parseInt($( '#startYearSelect option:selected' ).val());
    args.startMonth = parseInt($( '#startMonthSelect option:selected' ).val());
    args.startDate = parseInt($( '#startDateSelect option:selected' ).val());
    args.endYear = parseInt($( '#endYearSelect option:selected' ).val());
    args.endMonth = parseInt($( '#endMonthSelect option:selected' ).val());
    args.endDate = parseInt($( '#endDateSelect option:selected' ).val());

  }

  return args;

}



/*
 * Sends a get request to Flask route to retrieve data based on filters selected by the user and 
 * processes response data to display table and page adjustment buttons
 * 
 * @param {Object} args that will be sent in the HTTP request and used to filter out the return data
 */
function getData(args) {

  $.ajax({
    url: URL.concat('api-connector'),
    type: 'GET',
    data: args,
    success: function(result) {

      if(result.length == 0) {

        if(parseInt(sessionStorage.getItem('offset')) > 0) {

          alert('NO MORE RESULTS TO SHOW!');

          // reduce the offset since it would have been increased when the user clicked the next page button
          offset = parseInt(sessionStorage.getItem('offset'));
          offset -= 100;
          sessionStorage.setItem('offset', offset);

          // show the previous page button if at least the second page of results is being shown
          if(parseInt(sessionStorage.getItem('offset')) > 0) {
            $('#previousPage').show();
          }
          
          $('#nextPage').show();

        } else {

          // if this is a fresh search and the results are still 0, display an alert and don't show the table
          alert('NO RESULTS FOR THIS SEARCH!');

        }

      } else {

        // hide the buttons so that they can reappear alongside the table
        $('#previousPage').hide();
        $('#nextPage').hide();

        displayTable(result);

        // only show the previous page button if the user has moved onto the second page of results before
        if(parseInt(sessionStorage.getItem('offset')) > 0) {
          $('#previousPage').fadeIn(fadeTime);      
        }
        
        $('#nextPage').fadeIn(fadeTime);

      }

    },
    error: function(xhr,status,error) {

      // log the errors and alerts that an error has occurred
      console.log(xhr);
      console.log(status);
      console.log(error);
      alert("SOMETHING WENT WRONG! CHECK THE CONSOLE!")
    }

  });

}



/*
 * Gets a specific number of random questions from the jService API and displays them in the table
 * 
 * @param {int} count of how many random questions will be displayed
 */
function getRandom(count) {

  $.ajax(
    {
      url: URL.concat('get-random'),
      type: 'GET',
      data: {
        count: count
      },
      success: function(result) {

        // reset the offset because the next search made will be a fresh search
        sessionStorage.setItem('offset', '0');

        displayTable(result);

      },
      error: function(xhr,status,error) {
        
        // log the errors and alerts that an error has occurred
        console.log(xhr);
        console.log(status);
        console.log(error);
        alert("SOMETHING WENT WRONG! CHECK THE CONSOLE!");

      }
    });
  
}



/*
 * Either adds or deletes a question to the favorites collection
 * 
 * @param {HTML Row Element} row that contains question that must be added to the favorites collection
 */
function modifyFavorites(row) {

  // get the array of favorites currently selected and stored
  var favorites = JSON.parse(localStorage.getItem('favorites'));

  // creates an object to store the question data from the row
  var data = new Object();

  // formats the data into the same format that the API returns
  data.airdate = row.children[0].innerHTML;
  data.category = new Object();
  data.category.title = row.children[1].innerHTML;
  data.value = row.children[2].innerHTML;
  data.question = row.children[3].innerHTML;
  data.answer = row.children[4].innerHTML;

  for(var i = 0; i < favorites.length; i++) {

    // if the row argument matches a row found in the favorites collection,
    // prompt the user if they want to remove the question from their favorites
    if(JSON.stringify(favorites[i]) == JSON.stringify(data)) {

      var remove = confirm('REMOVE THIS QUESTION FROM FAVORITES?');

      if(remove) {

        favorites.splice(i, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        alert('QUESTION SUCCESSFULLY REMOVED!');

      }
      
      return;

    }

  }

  var add = confirm('ADD THIS QUESTION TO FAVORITES?');

  if(add) {

    favorites.push(data);
    localStorage.setItem('favorites', JSON.stringify(favorites));

    alert('QUESTION SUCCESFULLY ADDED TO FAVORITES!');
    
  }

}



/*
 * Displays the questions that the user has saved
 */
function showFavorites() {

  // retrieves the string of favorites stored in local storage and parses it into an object
  var favorites = JSON.parse(localStorage.getItem('favorites'));

  if(favorites.length == 0) {

    alert('NO SAVED QUESTIONS!');

  } else {

    // hide the buttons because there will only be one page of favorites
    $('#previousPage').hide();      
    $('#nextPage').hide();

    // reset the offset because the next search made will be a fresh search
    sessionStorage.setItem('offset', '0');

    displayTable(favorites);

  }

}



/*
 * Resets and displays table with the contents of the result object variable
 *
 * @param {array} result containing JavaScript objects that will be displayed in the table
 */
function displayTable(result) {

  $('#dataDisplay').empty();
  
  $('#dataDisplay').append('<tr><th>Airdate</th><th>Category</th><th>Point Value</th><th>Clue</th><th>Answer</th></tr>');

  for (var i = 0; i < result.length; i++) {

    // if the data has incomplete information, we ignore it can keep iterating through results
    if (result[i].question == undefined || result[i].question.length == 0 || 
        result[i].category == undefined || result[i].category.title == undefined) {
      continue;
    }

    // if the point value is missing, then the question must be a Final Jeopardy question
    var questionValue = (result[i].value == null) ? 'Final Jeopardy' : result[i].value.toString();

    // constructs the row as a string that contains valid HTML syntax to be added to the table
    var row = '<tr onclick=modifyFavorites(this)><td>'+result[i].airdate.substring(0,10)+'</td><td>'+result[i].category.title.toString()
              +'</td><td>'+questionValue+'</td><td>'+result[i].question.toString()+'</td><td>'+result[i].answer+'</td></tr>';

    $('#dataDisplay').append(row).hide();

  }

  $('#dataDisplay').fadeIn(fadeTime);

}



// when the document loads, the callback will set properties
// of the various  filter elements
$(document).ready(function(){

  // close the modal when user clicks outside of it
  var instructions = document.getElementById('instructions');
  window.onclick = function(event) {
    if (event.target == instructions) {
      instructions.style.display = 'none';
    } 
  }

  // hide the filters and buttons so that they only appear when the user requires
  // them to change filter/search parameters
  $('#betweenFilterInfo').hide();
  $('#count').hide();
  $('#previousPage').hide();
  $('#nextPage').hide();

  // Respond to a user selecting/unselecting the random question checkbox
  $("input[type=checkbox][name='random']").change(function() {

    if($('#random').is(':checked')) {

      // if user has checked the box, hide filters and prompt them for a count
      $('#count').show();
      $('#filters').hide();

    } else {

      // if user has unchecked the box, prompt for a count but not any other filters
      $('#count').hide();
      $('#filters').show();
    }

  });


  // Respond to user changing the airdate filter type selection
  $("input[type=radio][name='airtime']").change(function() {

    $('#betweenFilterInfo').hide();

    if(this.value == 'between'){

      // if the user wants to filter results between two dates, 
      // show the filter selectors so they can enter filters
      $('#betweenFilterInfo').show();
        
    }

  });
 

  // Changes the available dates that the user can select if
  // the user changes the month of the starting date field
  $('#startMonthSelect').change(function() {

    month = $('#startMonthSelect').val();
    year = $( '#startYearSelect' ).val();
    respondToMonthChange('#startDateSelect', month, year);

  });


  // Changes the available dates that the user can select if
  // the user changes the month of the ending date field
  $('#endMonthSelect').change(function() {

    month = $( '#endMonthSelect').val();
    year = $( '#endYearSelect' ).val();
    respondToMonthChange('#endDateSelect', month, year);
    
  });


  // Changes the available dates that the user can select if
  // the user changes the year of the starting date field
  $('#startYearSelect').change(function() {

    year = $( '#startYearSelect' ).val();
    month = $('#startMonthSelect').val();
    respondToYearChange('#startDateSelect', month, year);

  });


  // Changes the available dates that the user can select if
  // the user changes the year of the ending date field
  $('#endYearSelect').change(function() {
    
    year = $( '#endYearSelect' ).val();
    month = $('#endMonthSelect').val();
    respondToYearChange('#endDateSelect', month, year);
    
  });


  // Respond to all button clicks on the app webpage
  $('button').click(function(){

    // user clicked "SHOW FAVORITES!"
    if(this.id == 'favorites'){
      showFavorites();
      return;
    }

    // JavaScript object that stores arguments for the API call
    var args = getArgs();

    // gets the offset value so that we can paginate the results
    offset = parseInt(sessionStorage.getItem('offset'));

    if(this.id == 'search') {

      // when conducting a new search, the offset has to be reset to 0
      sessionStorage.setItem('offset', '0');

      if ($('#random').is(':checked')) {

        // if making a random search, hide the page adjustment buttons and
        // get the random data without continuing
        $('#previousPage').hide();
        $('#nextPage').hide();
        getRandom(parseInt($( '#countSelect option:selected' ).val()));
        return;
  
      }
  
      // if the search is not random, the offset argument is reset to 0
      args.offset = 0;

    } else if(this.id == 'nextPage') {

      // to move to the next page, increase the offset by 100 and set its value
      offset += 100;
      args.offset = offset;
      sessionStorage.setItem('offset', offset);

    } else if(this.id == 'previousPage') {

      // to move to the previous page, decrease the offset by 100 and set its value
      offset -= 100;
      args.offset = offset;
      sessionStorage.setItem('offset', offset);

    }

    // now that the arguments have been set, we can get the data and show the table
    getData(args);
    
  });

});
