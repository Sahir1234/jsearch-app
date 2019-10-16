
sessionStorage.setItem('offset', '0');

$(document).ready(function(){

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

    $("#previousPage").hide();
    $("#nextPage").hide();

    if ($("#random").is(':checked')) {
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
    } else {
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
    url: "http://localhost:8888/api-connector",
    type: 'GET',
    data: args,
    success: function(result) {
      if(result.length == 0) {
        if(sessionStorage.get(offset) > 0) {
          alert("NO MORE RESULTS TO SHOW!");
        } else {
          alert("NO RESULTS FOR THIS SEARCH!");
        }
      } else {
        displayTable(result);
        if(parseInt(sessionStorage.getItem('offset')) > 0) {
          $("#previousPage").show();      
        }
        $("#nextPage").show();
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
        displayTable(result);
      }
    });
  
}

var displayTable = function(result) {

  $('#dataDisplay').empty();
  
  $("#dataDisplay").append("<tr><th>Airdate</th><th>Category</th><th>Point Value</th><th>Clue</th><th>Answer</th></tr>");

  for (var i = 0; i < result.length; i++) {

    if (result[i].question.length == 0 || result[i].category.title == undefined) {
      continue;
    }

    var questionValue = (result[i].value == null) ? "Final Jeopardy" : result[i].value.toString();

    var row = "<tr><td>"+result[i].airdate.substring(0,10)+"</td><td>"+result[i].category.title.toString()
              +"</td><td>"+questionValue+"</td><td>"+result[i].question.toString()+"</td><td>"
              +result[i].answer+"</td></tr>";

    $('#dataDisplay').append(row).hide();

  }

  $("#dataDisplay").fadeIn(1500);

}