/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.0
 * @NScriptType workflowactionscript
 */
define(['N/search'], // jshint ignore:line

function(search) {

	function updateAddressOnCreate(context) {

        var estimateRec = context.newRecord;
        var endUserID = estimateRec.getValue({fieldId: 'custbody_end_user'});
        var billToID = estimateRec.getValue({fieldId: 'entity'});

        if(endUserID != billToID){

            var address = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: endUserID,
                columns: ['address']
            });
    
            estimateRec.setValue({fieldId: 'shipaddress', value: address['address']});    

        }
        
	}

	
	return {
		onAction : updateAddressOnCreate
	};

});
