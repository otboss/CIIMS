
// Some constants
var NESTED_CHILD_ADDED = "childAdded";
var NESTED_CHILD_REMOVED  = "childRemoved";

/**
 * The Management Form manages bindings for Django formset management forms.
 * The Django management form stores the following information:
 * - maximum number of forms addable 
 * - total of forms currently added (TOTAL_FORMS)
 * - total number of initial forms 
 * So basically, we want to use KnockoutJS to update the TOTAL_FORMS variable.
 * This scope provides an "addChild" function that can be called within the
 * scope of a management form binding to add a child form. 
 * In order to achieve this we take as input, the parentFormName, childTemplate 
 * name, the number of initial forms and also the prefix. 
 *
 * Now, every time we add a new management form, we actually need to call 
 * applyBindings on the entire structure that is being added because we actually
 * need KnockoutJS to translate some of the bidnings into actual properties. 
 *
 * We need to do this because the templates can't store the 'prefix' of the 
 * element before hand. So the field for TOTAL_FORMS could be called
 * buildings-0-TOTAL_FORMS or buildings-1-TOTAL_FORMS depending on which child 
 * it is and so on. So we have to apply bindings to get those variables put in.
 *
 * This works fine when the page is loading. We just apply the bindings to the 
 * management form div container which also has the actions form. We needed to 
 * put the actions form in that div because more than likely the actions will
 * need to call addChild or access something else in that scope. 
 *
 * Now we need to add a child....
 * In order to add a child, 
 * 
 * 
 * @param {String} parentFormName - the name of the parent form
 * @param {String} childTemplate  - the name of the child (template) that will be added
 * @param {String} initialForms   - the number of child forms at start
 * @param {String} prefix         - the prefix for the management form 
 */
function ManagementForm(parentFormName, childTemplate, initialForms, childPrefix){
    // e.g. BlockForm-form, BuildinForm-template, x, buildings
    // e.g. BuildingForm-form-buildings-0, TenantForm-template, x, buildings-0-tenants
    // console.log("Setup mgmt form: parentFormName=", parentFormName, 
        // " childTempalte=", childTemplate, " initialForms=", initialForms,
        // " childPrefix=", childPrefix);
    var self = this;
    self.childTemplate = childTemplate; // BuildingForm-template
    self.parentFormName = parentFormName;
    self.childrenDivFormName = self.parentFormName + "_children_div";
    self.childPrefix = childPrefix;

    // Declare some observables
    self.totalForms = ko.observable(initialForms);
    self.maxForms = ko.observable(1000);
    self.initialForms = ko.observable(initialForms);

    self.addChildForm = function() {
        console.log("Adding child " + this.childTemplate + " to " + this.childrenDivFormName + " with childPrefix: " + this.childPrefix, " parent is: ", this.parentFormName);

        // Adds a child form to this form
        var div = jQuery("<div/>");
        div.attr("data-bind", "template: {name: '" + self.childTemplate + "'}");
        div.addClass("child-form-wrapper");
        div.appendTo(jQuery("#" + self.childrenDivFormName));
        console.log("Adding div to the children div");
        if(jQuery("#" + self.childrenDivFormName).length == 0){
            console.log("Warning: " + this.childrenDivFormName + " container does not exist");
        }

        if(hasChild(getChildFormName(this.parentFormName.split("-")[0]))){
            /**
             * in this scneario, where the child we're adding now has children 
             * for e.g. we're adding a building, child of blocks.
             * we need to setup bindings for the grand child mgmt form.
             */

            // Setup bindings for the grand child management form
            var formName = this.parentFormName.split("-")[0];
            var childForm = getChildFormName(formName);
            var childFormName = childForm + "-form-" + self.childPrefix + "-" + self.totalForms();
            var grandChildTemplate = getChildTemplateName(childForm);
            var grandChildManagementFormDivId = childFormName + "_management_form_div";
            var grandChildPrefix = self.childPrefix + "-" + self.totalForms() + "-" + getChildRelName(childForm);

            var grandChildManagementForm = new ManagementForm(childFormName, 
                grandChildTemplate, 0, grandChildPrefix);
            grandChildManagementForm.index = self.totalForms();
            grandChildManagementForm.prefix = self.childPrefix;

            //console.log("Data for: ", ko.dataFor(div.get()[0]));
            //console.log("Context for: ", ko.dataFor(div.get()[0]));
            ko.applyBindings(grandChildManagementForm, div.get()[0]);
        } else {
            // no bindings to addChild
            ko.applyBindings({
                "index" : self.totalForms(),
                "prefix" : self.childPrefix,
                "totalForms" : 0
            }, div.get()[0]);

        }
        self.totalForms( self.totalForms() + 1 );

        // Trigger an event of children being added...
        jQuery("body").trigger({
            type: NESTED_CHILD_ADDED,
            prefix: self.childPrefix,
            container : jQuery("#" + self.childrenDivFormName),
            child: div.parents(".form-children")[0]
        });
    };
}

/**
 * Returns the name of the child template given the name of the form class (parent)
 * @param  {String} parentForm 
 * @return {String} - the name of the template
 */
function getChildTemplateName(parentForm){
    return childInfos[parentForm]["childTemplate"];
}

function hasChild(parentForm){
    console.log("Checking if '" + parentForm + "' has a child");
    if(childInfos[parentForm]){
        return true;
    }
    return false;
}

/**
 * Returns the name of the child form class
 * @param  {String} parentForm 
 * @return {String} - the name of the child form
 */
function getChildFormName(parentForm){
    return childInfos[parentForm]["childForm"];
}

function getChildRelName(parentForm){
    return childInfos[parentForm]["relName"];
}

/**
 * Returns the number of children
 * @param  {selector} childrenDiv - selector referring to the children div (.form-children) DIV
 * @return {number} - the number of undeleted children
 */
function getChildCount(childrenDiv){
    return $(childrenDiv).children(".form-container:visible").length + $(childrenDiv).children(".child-form-wrapper").children(".form-container:visible").length
}

function deleteChild(inp){
    var formContainer = $(inp).parents(".form-container")[0];
    var prefix = formContainer.id.replace("_form_div","").split("-").slice(2).join("-") + "-";
    var idField = "id_" + prefix + "id";
    var val = $("#" + idField).val();
    if(val){ // then this object already exists....
        // delete the form-container and add a DELETE field set to on
        //console.log("Hiding this, it already exists...");
        $("#id_" + prefix + "DELETE").val("on");
        var container = $(inp).parents(".form-container")[0];
        $(container).css("display", "none");
    } else {
        // we need to get the mgmt form
        //console.log("Cloberring this, it doesn't exist...");
        var pieces = prefix.split("-");
        var mgmtFormPrefix = pieces.slice(0, -2).join("-") + "-";
        var totalForms = $("#id_" + mgmtFormPrefix + "TOTAL_FORMS")[0];
        $(formContainer).css("display", "none");
        var inp = $("<input>");
        inp.attr("id", "id_" + prefix + "DELETE");
        inp.attr("name", prefix + "DELETE");
        inp.val("on");
        inp.appendTo($(formContainer));
    }

    // Trigger an event of children being deleted...
    jQuery("body").trigger({
        type: NESTED_CHILD_REMOVED,
        prefix: prefix,
        container : jQuery(formContainer).parents(".form-children")[0]
    });
}


$(document).ready(function(){
    (function() {
      var existing = ko.bindingProvider.instance;
        ko.bindingProvider.instance = {
            nodeHasBindings: existing.nodeHasBindings,
            getBindings: function(node, bindingContext) {
                var bindings;
                try {
                   bindings = existing.getBindings(node, bindingContext);
                }
                catch (ex) {
                   console.log("There was a binding error: ", ex.message, node, bindingContext);
                }
                return bindings;
            }
        };
    })();
});

