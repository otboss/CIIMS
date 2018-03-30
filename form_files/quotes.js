$(document).ready(function (){
	setupMakeModelControls();
	setupMortgageeControls();
});
/**
 * Setup mortgagee controls so that the mortgagee is hidden if the user selects NO
 * @return {[type]} [description]
 */

function renderBootstrapSelect(){
	$('#button-id-add_accident').click(function(){
		$('.selectpicker').selectpicker('refresh');
	} );
}

function setupMortgageeControls(){
	$("#id_has_mortgage").change(function(){
		var val = $("#id_has_mortgage").val();
		$("#div_id_mortgagee").css("display", val == "True" ? "block" : "none");
	});
	$("#id_has_mortgage").change();
}


/**
 * Focuses the given field
 * @param  {[type]} fieldName
 */
function focusField(fieldName){
	$("#id_" + fieldName).focus();
}
/**
 * Save the users progress
 */
function saveForLater(){
	$("#id_save_for_later").val("on");
	$("form").submit();
}

$(document).ready(function(){
	// Make sure this is off by default
	$("#id_save_for_later").val("");
	$("input[name=next_url]").val("");
});

/**
 * Tells the form to go to the purchase url
 */
function returnToPage(url){
	$("input[name=next_url]").val(url);
	$("form").submit();
}

