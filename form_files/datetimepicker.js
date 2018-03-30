$(document).ready(function (){
	$(document).delegate(".day.active","click",function(event){
		event.stopPropagation();
	});
 	var datePicker = $('.date-picker-field');
	setupDatePickers(datePicker);
});

function setupDatePickers(datePicker){
	var dateFormat = "yyyy-mm-dd";
 	var thisYear = new Date().getFullYear();
 	var thisMonth = new Date().getMonth() + 1;
 	var thisDay = new Date().getDate();
 	var startDate = (thisYear - 110) + "-01-01";
 	var endDate = (thisYear - 14) + "-01-01";
 	var today = thisYear + "-" + thisMonth + "-" + thisDay;
 	var minDate;
 	try {
 		minDate = MIN_DATE;
 	} catch(e){
 		minDate = today;
 	}
 	var startLimit = undefined;
 	try{
 		startLimit = START_DATE_LIMIT;
 	}catch(e){
 		startLimit = startDate;
 	}

 	var defaultParams = {
		format:dateFormat,
 	};

 	var dateOfBirthParams = {
		format:dateFormat,
		startDate: startDate,
		endDate: endDate,
		startView: 2,
		autoclose: true
 	};

 	var beforeTodayParams = {
 		format: dateFormat,
 		endDate: today,
 		startView: 2,
 		autoclose: true
 	};

 	var afterTodayParams = {
		format:dateFormat,
		startDate: today,
		startView: 2,
		autoclose: true
 	};

 	var todayParams = {
 		format:dateFormat,
		startDate: minDate,
		endDate: startLimit,
		startView: 3,
		autoclose: true,
 		todayHighlight: minDate == today
 	}

	if(datePicker.length > 0){
		datePicker.filter("[name*=birth]").datepicker(dateOfBirthParams);
		datePicker.filter("[name*=expiry]").datepicker(afterTodayParams);
		datePicker.filter("[name*=start_date]").datepicker(todayParams);
		datePicker.filter("[name*=date_of_issue]").datepicker(beforeTodayParams);
		datePicker.filter(":not([name*=birth])").datepicker(defaultParams);
	}

	$('.datetime-picker-field').datetimepicker(
	{
		timepicker:true,
		format:'Y-m-d H:i',
		yearStart:1885,
		allowBlank:true,
	});

	$(document).delegate(".datepicker","DOMNodeInserted",function(){
		var thisDatePick = $(this);
		$(".day.active").click(function(event){
			event.preventDefault();
			event.stopPropagation();
			thisDatePick.hide();
		})
	});

}

$("body").on(NESTED_CHILD_ADDED, function(event){
	var datePicker = event.container.find(".date-picker-field");
	setupDatePickers(datePicker);
});


