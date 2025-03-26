/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/query', 'N/ui/message', 'N/record', 'N/ui/serverWidget'], function (query, message) {

   
    function beforeLoad(scriptContext) {

        var rec = scriptContext.newRecord;
        var recId = scriptContext.newRecord.id;
        
        if (scriptContext.type == scriptContext.UserEventType.VIEW && recId) {
           
            let queryString = `
                SELECT 
                    t.id
                FROM
                    transaction t 
                    INNER JOIN transactionline tll ON tll.transaction = t.id
                    INNER join item i ON tll.item = i.id
                WHERE
                    i.custitem_nbe_item = 'T'
                    AND TO_CHAR(t.trandate, 'YYYY-MM-DD')  < '2025-01-07'	
                    AND t.custbody_autodesk_quote_detail_status = 2
                    AND t.id = ${recId}
            `;

            let resultSet = query.runSuiteQL({
                query: queryString
            }).results;

            if (resultSet.length) 
            {
                let readinessMsg = message.create({
                    title: "Warning",
                    message: `Please re check the price for this draft estimate`,
                    type: message.Type.WARNING,
                });
    
                scriptContext.form.addPageInitMessage(readinessMsg);
            }
        }
        
      
    }


    return {
        beforeLoad: beforeLoad
    };
});