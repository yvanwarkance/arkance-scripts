/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
 define(['N/ui/message', 'N/query', 'N/record'], function(message, query, record) {

    /**
     * Logic to applied while saving record
     * 1. Prevent saving of record if estimate contain mix item (old autodesk SKu, new autodesk item, non-autodesk item)
     * 
     * @param {*} context 
     * @governance 10 units
     */
    function saveRecord(context) 
    {
        let currentRecord = context.currentRecord;
        let errorMessage = null;

        //Autodesk New model 
        if (currentRecord.type == record.Type.ESTIMATE)
        {
           errorMessage = checkMixItem(currentRecord);// 10 units
        }

        if (errorMessage)
        {
            const alertMessage = message.create({
                title: 'Error',
                message: errorMessage,
                type: message.Type.ERROR
            });

            alertMessage.show(5000);

            return false;
        }

        return true;
    }

    /**
     * Function to check mixitem in a transaction, and prepare error message
     * 
     * @param {*} currentRecord 
     * @governance 10 units
     * @return message{String}
     */
    function checkMixItem(currentRecord)
    {
        let message = '';
        let itemArray = [];

        let lineCount = currentRecord.getLineCount({
            sublistId: 'item'
        });

        for (let line = 0; line < lineCount; line++)
        {
            let itemType = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'itemtype',
                line: line
            });

            let itemId = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: line
            });

            if (itemType != 'Group' && itemType != 'EndGroup' && itemType != 'Description')
            {
                itemArray.push(itemId);
            }
        }

        if (itemArray.length)
        {
            let queryString = `
                SELECT	
                    DISTINCT
                    /*CASE 
                        WHEN (CASE WHEN i.custitem_product_line IN (13) THEN 1 ELSE 0 END) ||'_'|| (CASE WHEN i.custitem_autodesk_offering_id IS NOT NULL THEN 1 ELSE 0 END) = '0_0' THEN 'Non-Autodesk Item'
                        WHEN (CASE WHEN i.custitem_product_line IN (13) THEN 1 ELSE 0 END) ||'_'|| (CASE WHEN i.custitem_autodesk_offering_id IS NOT NULL THEN 1 ELSE 0 END) = '1_0' THEN 'Old Autodesk SKU'
                        WHEN (CASE WHEN i.custitem_product_line IN (13) THEN 1 ELSE 0 END) ||'_'|| (CASE WHEN i.custitem_autodesk_offering_id IS NOT NULL THEN 1 ELSE 0 END) = '1_1' THEN 'New Model Autodesk Item'
                    END*/
                    CASE 
                        WHEN (CASE WHEN i.custitem_autodesk_offering_id IS NOT NULL THEN 1 ELSE 0 END) = '0' THEN 'Other Items Category'
                        WHEN (CASE WHEN i.custitem_autodesk_offering_id IS NOT NULL THEN 1 ELSE 0 END) = '1' THEN 'New Model Autodesk Item'
                    END
                FROM
                    item i
                WHERE
                    i.id IN (${itemArray.join(',')})
            `;

            let resultSet = query.runSuiteQL({
                query: queryString,
            }).results;//10 units

            if (resultSet.length > 1)
            {
                message = `This transaction contains mixed items: ${resultSet.map(result => result.values[0]).join(',')}</br>Please seperate the items into different transactions`;
            }
        }

        return message;
    }


    return {
        saveRecord: saveRecord
    }
 });