$(document).ready(function(){

  $("#yearSelect").hide();
  $("#monthSelect").hide();
  $("#dateSelect").hide();

  $("input[type=radio][name='airtime']").change(function() {

    $("#yearSelect").hide();
    $("#monthSelect").hide();
    $("#dateSelect").hide();

    if(this.value == 'year' || 
       this.value == 'month' || 
       this.value == 'week' || 
       this.value == 'day') {
        $("#yearSelect").show();
    }

    if(this.value == 'month' || 
       this.value == 'week' || 
       this.value == 'day') {
        $("#monthSelect").show();
    }

    if(this.value == 'week' || 
       this.value == 'day') {
        $("#dateSelect").show();

    }

    getData(false);

  });

  $('#month').change(function() {
    month = $('#month').val();
    year = $( "#year" ).val();
    $('#date option:gt(27)').remove();
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

    var i;
    for (i = 1; i <= daysToAdd; i++) { 
      $('#date').append('<option value='+(i+28).toString()+'>'+(i+28).toString()+'</option>');
    }

    getData(false);
    
  });

  $('#year').change(function() {
    year = $( '#year' ).val();
    month = $('#month').val();

    if(month == 2) {
      $('#date option:gt(27)').remove();
      if(year % 4 == 0) {
        $('#date').append('<option value=29>29</option>');
      }
    }

    getData(false);
    
  });

  $('#date').change(function() {

    getData(false);
    
  });


  $("button").click(function(){

    getData(true);
    
  });

  $("input[type=text]").change(function() {
    getData(false);
  });

  $("#values").change(function() {
    getData(false);
  });

});

//Loop through all table rows and fade them in
var animateTable = function(rows) {

  var fadeTime = 700;
  var delayTime = 50;
  var i = 0;

  $("#dataDisplay tr").each(function() {
    setTimeout(function() {
      $("#dataDisplay tr:eq(" + i++ + ") ").fadeTo(fadeTime, 1.0);
    }, delayTime);
  });
};

var getData = function(random) {

  var value = random ? 0 : parseInt($( "#values option:selected" ).val());
  var category = random ? null : $( "input[name=category]" ).val();
  var year= random ? 0 : parseInt($( "#year option:selected" ).val());
  var month = random ? 0 : parseInt($( "#month option:selected" ).val());
  var date = random ? 0 : parseInt($( "#date option:selected" ).val());
  var airdateSearch = random ? "all" : $("input[name='airtime']:checked").val();

  $.ajax({
    url: "http://localhost:8888/api",
    type: 'GET',
    data: { 
      val: value,
      cat: category,
      yr: year,
      mon: month,
      day: date,
      type: airdateSearch
    },
    success: function(result) {

      $('#dataDisplay').empty();

      $("#dataDisplay").append("<tr><th>Airdate</th><th>Category</th><th>Point Value</th><th>Clue</th><th>Answer</th></tr>");

      var i = 0;
      var missingDataCount = 0;
      for(i = 0; i < result.length; i++) {
        if (result[i].value == null || result[i].question.length == 0 || result[i].category.title == undefined) {
          missingDataCount++;
          continue;
        }
        var row = "<tr style='opacity:0'><td>"+result[i].airdate.substring(0,10)+"</td><td>"+result[i].category.title.toString()
                  +"</td><td>"+result[i].value.toString()+"</td><td>"+result[i].question.toString()+"</td><td id='answer'>"
                  +result[i].answer+"</td></tr>";
        $('#dataDisplay').append('<tr>' + row + '</tr>');
      }

      animateTable(result.length - missingDataCount);
    }
  });

}

