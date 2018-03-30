$(document).ready(function (){
 	setUpTogglers();
    setupCommunityFilter();
    moreInfo();
    // Initialize input masks
    $(":input").inputmask();
});

/**
 * Sets community listing stuff after nested child added
 **/
$("body").on(NESTED_CHILD_ADDED, function(event){
    setupCommunityFilter();
    // Also need to re init the masks
    $(":input").inputmask();
});

/**
 * Sets up the change events for the make, model and year
 **/

 var makeListPopulatedEvent = $.Event('gkgo:makeListPopulated');
 var modelListPopulatedEvent = $.Event('gkgo:modelListPopulated');

BLANK_SELECT = "-----";

function getResults(ctx){
    var csrf = $("input[name='csrfmiddlewaretoken']").val();
    ctx["csrfmiddlewaretoken"] = csrf;
    var deferred = $.Deferred();
    $.post(makesModelsUrl, ctx).then(function(data){
        deferred.resolve(data);
    });
    return deferred.promise();
}

function setupMakeModelControls(){
    var yearField = $('.vehicle_year');
    var makeField = $('.vehicle_make');
    var modelField = $('.vehicle_model');

    yearField.change(function(){
        var year = yearField.val();

        var make = $(makeField).val();
        if(!make){
            filterMakes();
        }

        if(!year || year == BLANK_SELECT) {
            // empty fields beside it
            $(makeField).empty();
            $(modelField).empty();
            return;
        }
        filterMakes(yearField);
    });

    makeField.change(function(){
        makeField = this;
        var yearField = $($(this).parents('.form-group').siblings()[0]).find('select');
        filterModels(yearField);
    });
}

function filterMakes(yearField) {
    //  Use the yearfield to get the nearby make and modelfields
    var makeField = $($(yearField).parents('.form-group').siblings()[0]).find('select');
    var modelField = $($(yearField).parents('.form-group').siblings()[1]).find('select');
    //  get year value from yearField
    var year = $(yearField).val();
    //  remove the current makes
    var options = $(makeField).children('option');
    $(options).remove();
    // don't do anything if year value unsatisfactory
    if(!year || year == BLANK_SELECT) {
        return;
    }
    getResults({"year" : year}).then(function(data){
        var makes = data["makes"];
        // add BLANK_SELECT to top of makes array
        makes.unshift(BLANK_SELECT);
        for(var i = 0; i < makes.length; i++){
            var make = makes[i];
            var option = $("<option>" + make + "</option>");
            option.val(make);
            option.appendTo(makeField);
        }
        $(makeField).val(makes[0]).change(); // trigger change
        $(makeField).trigger(makeListPopulatedEvent);
    });
}

function filterModels(yearField){
    //  Use the yearfield to get the nearby make and modelfields
    var makeField = $($(yearField).parents('.form-group').siblings()[0]).find('select');
    var modelField = $($(yearField).parents('.form-group').siblings()[1]).find('select');
    //  get year and make value from yearField and makeField
    var year = $(yearField).val();
    var make = $(makeField).val();
    // removes current models
    var options = $(modelField).children('option');
    $(options).remove();
    // don't do anything if year/model are not sufficient values
    if (!year || year == BLANK_SELECT || !make || make == BLANK_SELECT) {
        return;
    }
    getResults({"year" : year, "make" : make}).then(function(data){
        var models = data["models"];
        // add BLANK_SELECT to top of makes array
        models.unshift(BLANK_SELECT);
        $("#id_model option").remove();

        for(var i = 0; i < models.length; i++){
            var make = models[i];
            var option = $("<option>" + make + "</option>");
            option.val(make);
            option.appendTo(modelField);
        }
        $(modelField).val(models[0]).change();
        $(modelField).trigger(modelListPopulatedEvent);
    });
}


//More Info JSON Object

function moreInfo (){
    var selector;
    $(".more-info").each(function(){
        var moreInfoHtml = $(this);
        field = moreInfoHtml.attr("field");
        var popupContent = moreInfoContent(field);
        if (popupContent) {
            content = '<div id="">' + popupContent.content +'</div>';
            selector = field.replace(/ /g,"");
            options = {
                html: true,
                placement: 'right',
                trigger: 'hover',
                title: popupContent.title,
                content: content,
                container: '.more-info-container'
            };
            moreInfoHtml.popover(options);
        }
        // moreInfoHtml.click(function(){
        //     moreInfoHtml.popover("show");
        // });
        // //Hook up close buttons
        // $(document).on("click","#close-"+selector+"-popover",function(){
        //     moreInfoHtml.popover("hide");
        // });
    });
}

var infoPopupContent = {};

function addInfoPopupContent(field, title, content) {
    // infoPopupContent[field] = content;
    infoPopupContent[field] = {
        'title': title,
        'content': content
    };
}

function moreInfoContent (field) {
    content = {
        "Community": "The area or district in which you reside.",

        "Politically Exposed": "A key political figure or relative of one that is in politics.",

        "VIN": "Vehicle Identification Number. Found under the bonnet of your vehicle.",

        "Financing Company": "The lending institution for your lien.",

        "Proof of Address": "A term describing someone who has been entrusted with a prominent public function, or an individual who is closely related to such a person.",

        "Ownership": "The owner(s) is everyone whose name(s) will appear on the vehicle documents.",

        "Original Date Of Issue": "The date on which you first acquired a driver's license.",

        "No Claim Discount": "NCD (No Claim Discount) is a special reward to customers who have not made any claims on their insurance policy. NCD is earned after the first year (20%) with an incremental 10% increase each year up to 5 years when the maximum of 60% is achieved. NCD is transferrable from one insurance company to another. NCD is applicable to only one vehicle.",

        "Engine CC": "The capacity of the vehicle's engine in cubic centimetres",

        "Max Laden Weight": "The maximum operating weight/mass of a vehicle as specified by the manufacturer"
    };

    // return content[field];
    return infoPopupContent[field];
}


/**
 * Sets up the filter so that when a parish is selected, it filters the
 * community.
 */
function setupCommunityFilter(){
    $(".parish-field").change(function(){
        var parishId = $(this).val();
        var parishFieldID = $(this).attr('id');
        if(parishId){
            console.log("Setup parish filter");
            refreshCommunityListing(parishId,parishFieldID);
        }
    });
}

function refreshCommunityListing(parishId, parishFieldID){
    var communitySelectorID ='#' + parishFieldID.replace("parish","community");
    var deferred = $.Deferred();
    var csrf = $("input[name='csrfmiddlewaretoken']").val();
    var ctx = {
        "parish_id" : parishId,
        "csrfmiddlewaretoken" : csrf
    };
    // var url in claim_wizard.html template because we cant render django template tags from here
    $.post(communitiesUrl, ctx).then(function(data){
        var communities = data.communities;
        $(communitySelectorID + " option").remove();

        if(communities){
            for (var i = 0; i < communities.length; i++) {
                var community = communities[i];
                var option = $("<option/>");
                option.html(community.name);
                option.attr("value", community.id);
                option.appendTo(communitySelectorID);
            };
            deferred.resolve();
        } else {
            deferred.reject();
        }
    });
    return deferred.promise();
}


function useAddress(parishId, communityId){
    $("#id_parish").val(parishId);
    refreshCommunityListing(parishId).then(function(){
        $("#id_community").val(communityId);
    });
}

function setUpTogglers(){
    function isAttrValue(toggler,attr_type,value){
        // You can assign a list of values to an attribute
        // This function parses the list into an array and checks if
        // the value is in the list
        attr_val = toggler.attr(attr_type);
        attr_trim = attr_val.replace(/ /g,'');
        attr_vals = attr_trim.split(",");
        console.log(attr_vals);
        console.log(value);
        //The empty string is represented by $
        if (attr_vals.indexOf("$") != -1 && value===""){
            return true;
        }
        return attr_vals.indexOf(value) != -1;
    }

    function get_toggle_value(toggler){
        //A toggle may have more than just a yes-no value
        //If it does then the toggle should have a list of
        // dont_show or show values
        //This function parses the list of values into a
        // a boolean value
        value= toggler.val();
        toggle_value = (value=="True")? true:false;
        if (toggler.is("[dont-show]")){
            toggle_value = isAttrValue(toggler,"dont-show",value)===false;
        }
        if (toggler.is("[show]")){
            toggle_value = isAttrValue(toggler,"show",value);
        }
        return toggle_value;
    }

    function toggle(context,toggler){
        //this function toggles information based on the
        //value of the toggler
        if(toggler){
            value = get_toggle_value(toggler);
            label = toggler.attr("name").split("-");
            if($.isArray(label)){
                tag = label[label.length-1];
            }else{
                tag = label;
            }
            toggled = context.find("[toggler*="+tag+"]");
            if(value){
                toggled.slideDown();
                selects = toggled.find("select");
                selects.each(function(index,select){
                    select = $(select);
                    defaultValue = select.children("[selected]").val();
                    select.val(defaultValue);
                });
                sub_toggler = toggled.find(".toggle.default");
                if(sub_toggler){
                    sub_toggler.val("");
                    sub_toggler.trigger("change");
                }
            }else{
                inputs = toggled.find("input");
                inputs = inputs.not(':checkbox, :button, :submit, :reset,'
                + ':hidden')
                toggled.slideUp('normal',function(){
                    inputs.removeAttr('selected');
                    inputs.filter("[type=checkbox]").prop('checked', false);
                    selects = toggled.find("select");
                    selects.each(function(index,select){
                        select = $(select);
                        var toggleDefault = select.attr("toggle-default");
                        if(toggleDefault!=undefined){
                            select.val(toggleDefault);
                        }else{
                            defaultValue = select.children("[selected]").val();
                            select.val(defaultValue);
                        }

                    });
                    sub_toggler = toggled.find(".toggle");
                    if(sub_toggler){
                        sub_toggler.val("False");
                        sub_toggler.addClass("default");
                        sub_toggler.trigger("change");
                    }
                });

            }
            return value;
        }
    }

    function setUpToggles(togglers,callback){
        function alreadySetUp(toggler){
            events = $._data(toggler,"events");
            if (events){
                if(events.change){
                    return true;
                }
            }
            return false;
        }

        function get_context(toggler){
            context = toggler.closest(".form-container");
            if(context.length===0){
                context = toggler.closest("form");
            }
            return context;
        }

        togglers.each(function(index,toggler){
            console.log(toggler);
            if(!alreadySetUp(toggler)){
                toggler = $(toggler);
                context = get_context(toggler);
                toggle(context,toggler);
                console.log("toggled");
                toggler.change(function(){
                    context = get_context($(this));
                    value=toggle(context,$(this));
                    if(callback){
                        callback(value,$(this),context);
                    }
                });
            }
        });

    }

    function manageAccidents(value,toggler,context){
        if(value){
            add_accident = $(context.find("[name*=add_accident]"));
            add_accident.click();
        }else{
            rmv_accident = $(context.find(".delete-accident-button"));
            rmv_accident.click();
        }
    }

    $("body").on(NESTED_CHILD_ADDED, function(event){
        var prefix = event.prefix;
        var childContainer = event.container;
        if(prefix=="drivers"){
            toggler = childContainer.find(".toggle-accidents");
            setUpToggles(toggler,manageAccidents);
        }
        form_container = $(childContainer).closest(".form-container");
    });

    $("body").on(NESTED_CHILD_REMOVED, function(event){
        var prefix = event.prefix;
        var childContainer = event.container;
        if(prefix.indexOf("accidents")!=-1){
            var childNumber = getChildCount(childContainer);
            if(childNumber===0){
                form_container = $(childContainer).closest(".form-container");
                toggler = form_container.find(".toggle-accidents");
                toggler.val("False");
                toggle(form_container,toggler);
            }
        }
    });

    setUpToggles($(".toggle"));
    setUpToggles($(".toggle-accidents"),manageAccidents);
    setUpToggles($(".toggle-related_party"));
    applicable = $("<span>").text(" (if applicable) ").css("color","#3745C7");
    // $("input.btn[data-bind]").after(applicable);
}

// Dismiss reminders
function dismissReminder(pk) {
    event.preventDefault();
    var dismissForm = $('#banner-notification-' + pk + ' > form');
    var portalUserPk = $(dismissForm).find("input[name=portal_user_pk]").val();
    var csrf = $(dismissForm).find("input[name=csrfmiddlewaretoken]").val();
    var ctx = {
        "portal_user_pk" : portalUserPk,
        "csrfmiddlewaretoken" : csrf,
        'notification_pk': pk
    };
    $.post(dismissReminderUrl,ctx, function(data){
        ctx = null; // clear out the context
        if(data.error){
            alert(data.error);
        } else {
            if (data.result == 'success') {
                $('#banner-notification-' + pk).slideUp();
            }
        }
    });
}

var CURRENT_PAGE;
var LAST_PAGE;

// Date filter action
function filterAction() {
    var page = CURRENT_PAGE || "";
    // Get the dates from the date filter form
    var startDate = $('#id_from_date').val();
    var endDate = $('#id_to_date').val();
    // Set the window location to the new url and profit!
    var queryStringParams = {};
    if (startDate != "") {
        queryStringParams['start_date'] = startDate;
    }
    if (endDate != "") {
        queryStringParams['end_date'] = endDate;
    }
    if (page != "") {
        queryStringParams['page'] = page;
    }
    var url = window.location.pathname + '?' + $.param(queryStringParams);
    window.location = url;
}

// Page navigation action
function goToPage(pageNumber) {
    // Get the dates from the date filter (if any)
    var startDate = $('#id_start_date').val();
    var endDate = $('#id_end_date').val();
    var queryStringParams = {};
    queryStringParams['page'] = pageNumber;
    if (startDate != "") {
        queryStringParams['start_date'] = startDate;
    }
    if (endDate != "") {
        queryStringParams['end_date'] = endDate;
    }
    var url = window.location.pathname + '?' + $.param(queryStringParams);
    window.location = url;
}

function goToNextPage() {
    if (CURRENT_PAGE == LAST_PAGE) {
        return;
    }
    var page = CURRENT_PAGE + 1;
    goToPage(page);
}

function goToPreviousPage() {
    if (CURRENT_PAGE == 1) {
        return;
    }
    var page = CURRENT_PAGE - 1;
    goToPage(page);
}
