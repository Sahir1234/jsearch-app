
/* Store the offset as session variable so that it can be
   used when user requests to see next page of results */
sessionStorage.setItem('offset', '0');

/* If local 
*/
if(localStorage.getItem('favorites') == null) {
  localStorage.setItem('favorites','[]');
}

const fadeTime = 900;

$(document).ready(function(){

  // When the user clicks anywhere outside of the modal, close it
  var instructions = document.getElementById("instructions");
  window.onclick = function(event) {
    if (event.target == instructions) {
      instructions.style.display = "none";
    } 
   }

  $("#betweenFilterInfo").hide();
  $("#count").hide();
  $("#previousPage").hide();
  $("#nextPage").hide();

  $("input[type=checkbox][name='random']").change(function() {

    if($("#random").is(':checked')) {
      $("#count").show();
      $("#filters").hide();
    } else {
      $("#count").hide();
      $("#filters").show();
    }

  });

  $("input[type=radio][name='airtime']").change(function() {

    $("#betweenFilterInfo").hide();

    if(this.value == 'between'){

      $("#betweenFilterInfo").show();
        
    }

  });

  $('#startMonthSelect').change(function() {
    month = $('#startMonthSelect').val();
    year = $( "#startYearSelect" ).val();
    $('#startDateSelect option:gt(27)').remove();
    var daysToAdd = 0;
    if(month == 2) {
      if(year % 4  == 0) {
        daysToAdd = 1;
      }
    } else if(month == 4 || month == 6 ||  
              month == 9 || month == 11) {
        daysToAdd = 2;
    } else {
      daysToAdd = 3;
    }

    for (var i = 1; i <= daysToAdd; i++) { 
      $('#startDateSelect').append('<option value='+(i+28).toString()+'>'+(i+28).toString()+'</option>');
    }
    
  });

  $('#endMonthSelect').change(function() {
    month = $('#endMonthSelect').val();
    year = $( "#endYearSelect" ).val();
    $('#endDateSelect option:gt(27)').remove();
    var daysToAdd = 0;
    if(month == 2) {
      if(year % 4  == 0) {
        daysToAdd = 1;
      }
    } else if(month == 4 || month == 6 ||  
              month == 9 || month == 11) {
        daysToAdd = 2;
    } else {
      daysToAdd = 3;
    }

    for (var i = 1; i <= daysToAdd; i++) { 
      $('#endDateSelect').append('<option value='+(i+28).toString()+'>'+(i+28).toString()+'</option>');
    }
    
  });

  $('#startYearSelect').change(function() {
    year = $( '#startYearSelect' ).val();
    month = $('#startMonthSelect').val();

    if(month == 2) {
      $('#startDateSelect option:gt(27)').remove();
      if( year % 4 == 0) {
        $('#startDateSelect').append('<option value='+29+'>'+29+'</option>');
      }
  }
    
  });

  $('#endYearSelect').change(function() {
    year = $( '#endYearSelect' ).val();
    month = $('#endMonthSelect').val();

    if(month == 2) {
        $('#endDateSelect option:gt(27)').remove();
        if( year % 4 == 0) {
          $('#endDateSelect').append('<option value='+29+'>'+29+'</option>');
        }
    }
    
  });


  $("button").click(function(){

    if(this.id == "favorites"){
      showFavorites();
      return;
    }

    if ($("#random").is(':checked')) {
      $("#previousPage").hide();
      $("#nextPage").hide();
      sessionStorage.setItem('offset', '0');
      getRandom(parseInt($( "#countSelect option:selected" ).val()));
      return;

    }

    var args = getArgs();

    offset = parseInt(sessionStorage.getItem('offset'));

    if(this.id == "search") {
      sessionStorage.setItem('offset', '0');
      args.offset = 0;
    } else if(this.id == "nextPage") {
      offset += 100;
      args.offset = offset;
      sessionStorage.setItem('offset', offset);
    } else if(this.id == "previousPage") {
      offset -= 100;
      args.offset = offset;
      sessionStorage.setItem('offset', offset);
    }

    getData(args);
    
  });

});

var getArgs = function() {

  var args = new Object();

  args.value = parseInt($( "#values option:selected" ).val());
    
  args.category = $( "input[name=category]" ).val();

  args.searchType = $("input[name='airtime']:checked").val();

  if(args.searchType == 'between') {

    args.startYear = parseInt($( "#startYearSelect option:selected" ).val());
    args.startMonth = parseInt($( "#startMonthSelect option:selected" ).val());
    args.startDate = parseInt($( "#startDateSelect option:selected" ).val());
    args.endYear = parseInt($( "#endYearSelect option:selected" ).val());
    args.endMonth = parseInt($( "#endMonthSelect option:selected" ).val());
    args.endDate = parseInt($( "#endDateSelect option:selected" ).val());

  }

  return args;

}

var getData = function(args) {

  $.ajax({
    url: "http://localhost:5000/api-connector",
    type: 'GET',
    data: args,
    success: function(result) {
      if(result.length == 0) {

        if(parseInt(sessionStorage.getItem('offset')) > 0) {

          if(parseInt(sessionStorage.getItem('offset')) > 100) {
            $("#previousPage").show();
          }

          $("#nextPage").show();
          alert("NO MORE RESULTS TO SHOW!");
          offset = parseInt(sessionStorage.getItem('offset'));
          offset -= 100;
          sessionStorage.setItem('offset', offset);

        } else {

          alert("NO RESULTS FOR THIS SEARCH!");

        }
      } else {

        $("#previousPage").hide();
        $("#nextPage").hide();
        displayTable(result);

        if(parseInt(sessionStorage.getItem('offset')) > 0) {
          $("#previousPage").fadeIn(fadeTime);      
        }
        
        $("#nextPage").fadeIn(fadeTime);
      }
    }
  });

}



var getRandom = function(count) {

  $.ajax(
    {
      url: "http://jservice.io/api/random",
      type: 'GET',
      data: {
        count: count
      },
      success: function(result) {
        sessionStorage.setItem('offset', '0');
        displayTable(result);
      }
    });
  
}


var modifyFavorites = function(row) {

  var favorites = JSON.parse(localStorage.getItem('favorites'));

  var data = new Object();

  data.airdate = row.children[0].innerHTML;

  data.category = new Object();
  data.category.title = row.children[1].innerHTML;

  data.value = row.children[2].innerHTML;

  data.question = row.children[3].innerHTML;

  data.answer = row.children[4].innerHTML;

  for(var i = 0; i < favorites.length; i++) {

    if(JSON.stringify(favorites[i]) == JSON.stringify(data)) {

      var remove = confirm("REMOVE THIS QUESTION FROM FAVORITES?");

      if(remove) {
        favorites.splice(i, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert("QUESTION SUCCESSFULLY REMOVED!");
      }
      
      return;

    }

  }

  favorites.push(data);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert("QUESTION SUCCESFULLY ADDED TO FAVORITES!");


}


var showFavorites = function() {

  var favorites = JSON.parse(localStorage.getItem('favorites'));
  if(favorites.length == 0) {
    alert("NO SAVED QUESTIONS!")
  } else {
    $("#previousPage").hide();      
    $("#nextPage").hide();
    sessionStorage.setItem('offset', '0');
    displayTable(favorites);
  }
}

var displayTable = function(result) {

  $('#dataDisplay').empty();
  
  $("#dataDisplay").append("<tr><th>Airdate</th><th>Category</th><th>Point Value</th><th>Clue</th><th>Answer</th></tr>");

  for (var i = 0; i < result.length; i++) {

    if (result[i].question.length == 0 || result[i].category.title == undefined) {
      continue;
    }

    var questionValue = (result[i].value == null) ? "Final Jeopardy" : result[i].value.toString();

    var row = '<tr onclick=modifyFavorites(this)><td>'+result[i].airdate.substring(0,10)+'</td><td>'+result[i].category.title.toString()
              +'</td><td>'+questionValue+'</td><td>'+result[i].question.toString()+'</td><td>'+result[i].answer+'</td></tr>';

    $('#dataDisplay').append(row).hide();

  }

  $("#dataDisplay").fadeIn(fadeTime);

}