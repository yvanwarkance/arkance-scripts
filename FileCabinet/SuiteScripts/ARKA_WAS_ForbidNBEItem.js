/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.1
 * @NScriptType workflowactionscript
 */
define(['N/query', 'N/search'], // jshint ignore:line

    function (query, search) {

        /**
         * Function to find whether NBE item exists on transactions; return true if exists otherwise false
         * 
         * @governance 10 units
         * @param {Object} record 
         * @returns {boolean} - True if NBE items are present, false otherwise.
         */
        function checkNBEItems(record) {
            var itemArray = [];
            var lineCount = record.getLineCount({
                sublistId: "item"
            });

            for (var i = 0; i < lineCount; i++) {
                var itemId = record.getSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    line: i
                });
                itemArray.push(itemId);
            }

            if (itemArray.length) {
                var queryString = `
                    SELECT
                        i.id
                    FROM
                        item i
                    WHERE
                        i.id IN (${itemArray.join(',')})
                        AND i.custitem_autodesk_offering_id IS NOT NULL
                `;

                let resultSet = query.runSuiteQL({
                    query: queryString
                }).results; //10 units

                return resultSet.length > 0;
            }

            return false;
        }

        /**
         * Function to check if the customer is of type Government
         * 
         * @governance 1 unit
         * @param {number} customerId 
         * @returns {boolean} - True if the customer is of type 'Government', false otherwise.
         */
        function isAutodeskCustTypeGovt(customerId) {
            var customer = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: customerId,
                columns: ['custentity_autodesk_customer_type']
            }); //1 unit

            return customer.custentity_autodesk_customer_type === 'Government';
        }

        /**
         * Main function to execute the workflow action
         * 
         * @governance 11 units
         * @param {Object} scriptContext 
         *  @returns {number} - 1 if the transaction contains NBE items and is a Purchase Order, Sales Order, or Invoice;
         *                      2 if the transaction contains both NBE items and 'Government' Autodesk Customer Type;
         *                      0 otherwise.
         */
        function onAction(scriptContext) {
            var record = scriptContext.newRecord;
            var recType = record.type;
            var customerId = record.getValue({ fieldId: 'entity' });

            var containNBEItem = checkNBEItems(record);

            if (containNBEItem) {
                if (recType == 'purchaseorder' || recType == 'salesorder' || recType == 'invoice') {
                    return 1; // Transaction contains NBE Items
                } else if (recType == 'salesorder' || recType == 'invoice' || recType == 'opportunity' || recType == 'estimate' || recType == 'itemfulfillment') {
                    var isGovernment = isAutodeskCustTypeGovt(customerId);
                    if (isGovernment) {
                        return 2; // Transaction contains both NBE Items and 'Government' Autodesk Customer Type
                    }
                }

            }

            return 0; // Transaction does not meet criteria for NBE Items or 'Government' Autodesk Customer Type
        }

        return {
            onAction: onAction
        };
    }
);
