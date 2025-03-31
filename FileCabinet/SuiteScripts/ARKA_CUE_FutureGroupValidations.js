/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'SuiteScripts/BBE_LIB_GenericFunctionsSS2.js',
    'SuiteScripts/ARKA_LIB_ValidationRulesFutureGroup.js',
    'N/record',
    'N/search',
    'N/ui/dialog',
    'N/currentRecord',
    'N/query',
], function (bbeLib, validationLib, record, search, dialog, currentRecord, query) {
    const APPROVED_STATUS_ID = 2

    function validateLine(scriptContext) {
        var isEndOfLifeExpired = false

        if (
            scriptContext.currentRecord.type == record.Type.SALES_ORDER ||
            scriptContext.currentRecord.type == record.Type.ESTIMATE ||
            scriptContext.currentRecord.type == record.Type.PURCHASE_ORDER ||
            scriptContext.currentRecord.type == record.Type.OPPORTUNITY
        ) {
            if (scriptContext.sublistId == 'item') {
                isEndOfLifeExpired = validateEndOfLife(scriptContext)
                if (!isEndOfLifeExpired) {
                    return false
                }
            }
        }

        // if (
        //     scriptContext.currentRecord.type == record.Type.SALES_ORDER ||
        //     scriptContext.currentRecord.type == record.Type.ESTIMATE
        // ) {
        //     return validateFGConstraints(scriptContext);
        // }

        return true
    }

    /**
     * Validation function to be executed when sublist line is committed.
     * This function ensure the expected fields are fullfilled as expected, depending on the OrderType
     *
     * @param {Object} scriptContext
     * @returns {boolean} Return true if there is no missing fields
     * @governance 4 Units
     */
    function validateFGConstraints(scriptContext) {
        var lineIsValide = true
        var currentSublistId = scriptContext.sublistId
        var transactionRecord = scriptContext.currentRecord

        if (scriptContext.sublistId == 'item') {
            var itemId = transactionRecord.getCurrentSublistValue({
                sublistId: currentSublistId,
                fieldId: 'item',
            })

            if (!itemId) {
                return true
            }

            if (bbeLib.isNullOrEmpty(itemId)) {
                return false
            }
            // log.error('isFutureGroupTransaction', validationLib.isFutureGroupTransaction(transactionRecord))
            // log.error('isAutodeskItem', validationLib.isAutodeskItem(itemId))
            if (
                validationLib.isFutureGroupTransaction(transactionRecord) && // 2 Units
                validationLib.isAutodeskItem(itemId) // 2 Units
            ) {
                var orderType = transactionRecord.getCurrentSublistValue({
                    sublistId: currentSublistId,
                    fieldId: 'custcol_arka_ordertypeslinefield',
                })

                // log.error('orderType', orderType)

                if (bbeLib.isNullOrEmpty(orderType)) {
                    alert('It is required to select an Order Type on the item line level.')
                    lineIsValide = false
                } else {
                    var constraints = validationLib.SO_FIELDS_CONSTRAINTS.line
                    var errorMessage = ''
                    for (var field = 0; field < validationLib.LINE_FIELDS.length; field++) {
                        var fieldValue = transactionRecord.getCurrentSublistValue({
                            sublistId: currentSublistId,
                            fieldId: validationLib.LINE_FIELDS[field],
                        })
                        var fieldConstraints = constraints[validationLib.LINE_FIELDS[field]]
                        errorMessage += validateFieldFGConstraints(fieldValue, fieldConstraints, orderType)
                    }
                    if (!bbeLib.isNullOrEmpty(errorMessage)) {
                        lineIsValide = false
                        alert(errorMessage)
                    }
                }
            }
        }

        return lineIsValide
    }

    /**
     * Function to check end of life of item and display an alert
     *
     * @param {Object} scriptContext
     * @returns {boolean} Return true if there is no missing fields
     * @governance  Units
     */
    function validateEndOfLife(scriptContext) {
        var isSuccessfull = false
        var currentRecord = scriptContext.currentRecord

        var tranDate = currentRecord.getValue({
            fieldId: 'trandate',
        })

        var currentItem = currentRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
        })

        var name = currentRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item_display',
        })

        if (!currentItem) {
            return true
        }

        var queryEndOfLife =
            " select to_char(custitem_end_of_life_date, 'YYYY-MM-DD') from item    " + '   where id = ' + currentItem

        var resultSet = query.runSuiteQL({
            //10 units
            query: queryEndOfLife,
        })

        var queryResult = resultSet.results

        if (!bbeLib.isNullOrEmpty(queryResult)) {
            //Not found on item

            var endofLifeDate = queryResult[0].values[0]

            if (!bbeLib.isNullOrEmpty(endofLifeDate)) {
                //No value on field

                var dateObj = endofLifeDate.split('-')
                var endDateFormatted = new Date(dateObj[0], dateObj[1] - 1, dateObj[2])

                var dateDiff = endDateFormatted.getTime() - tranDate.getTime()

                dateDiff = dateDiff / (1000 * 3600 * 24)

                //verify end of life date
                if (!bbeLib.isNullOrEmpty(tranDate) && dateDiff < 0) {
                    alert(
                        'The end of life of the item ' +
                            name +
                            ' is less than the transaction date. End of Life of this item is : ' +
                            endofLifeDate
                    )
                    return false
                } else {
                    isSuccessfull = true
                }
            } else {
                isSuccessfull = true
            }
        } else {
            isSuccessfull = true
        }

        return isSuccessfull
    }

    /**
     * Update the line rate to round it based on rounded term
     * @param {*} scriptContext
     * @returns true
     */
    function updateRate(scriptContext) {
        if (validationLib.isFutureGroupTransaction(scriptContext.currentRecord)) {
            var currentSublistId = scriptContext.sublistId
            if (currentSublistId == 'item') {
                var roundedRate = scriptContext.currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_swe_contract_item_term_months',
                })
                var listRate = scriptContext.currentRecord.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_list_rate',
                })
                scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: roundedRate * listRate,
                })
            }
        }
        return true
    }

    /**
     * Ensure a given field is fulfilled as expected. If not, add a comment so the user can see it.
     *
     * @param {string} fieldValue - The field's value
     * @param {Object} fieldConstraints - The constraints of the field
     * @param {string} orderType - The id of the Order Type
     * @return {string} The error message
     * @governance 0 Units
     */
    function validateFieldFGConstraints(fieldValue, fieldConstraints, orderType) {
        var errorMessage = ''
        if (
            !bbeLib.isNullOrEmpty(fieldConstraints.mandatoryIn) &&
            fieldConstraints.mandatoryIn.indexOf(orderType) > -1 &&
            orderType != validationLib.ORDER_TYPE.MAN
        ) {
            if (bbeLib.isNullOrEmpty(fieldValue)) {
                errorMessage = '\t- The field "' + fieldConstraints.label + '" is mandatory.\n'
            } else if (
                !bbeLib.isNullOrEmpty(fieldConstraints.maxLength) &&
                fieldConstraints.maxLength < fieldValue.length
            ) {
                errorMessage =
                    '\t- The maximum length for the field "' +
                    fieldConstraints.label +
                    '" is ' +
                    fieldConstraints.maxLength +
                    ' characters.\n'
            }
        }
        return errorMessage
    }

    /**
     * Validation function to be executed when record is saved.
     * Show warning message is user is saving a FG PO that was already approved.
     *
     * @governance 2 Units
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     */
    function savePO(scriptContext) {
        var newRecord = scriptContext.currentRecord
        try {
            if (
                newRecord.type == record.Type.PURCHASE_ORDER &&
                validationLib.isFutureGroupTransaction(newRecord) &&
                newRecord.getValue('approvalstatus') == APPROVED_STATUS_ID
            ) {
                // 2 Units
                return confirm(
                    'You are about to save a Purchase Order that was already approved. Are you sure you want to modify it?'
                )
            }
            return true
        } catch (e) {
            log.debug(e.message)
            log.error(e.message)
        }
    }

    /**
     * Function to be executed when field is changed.
     * This function is used to automatically set the field that will be used as a filter for contract manager contact and validate the end user field on estimates
     *
     * @governance 5 Units
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     */
    function fieldChanged(scriptContext) {
        var companyId
        switch (scriptContext.currentRecord.type) {
            case record.Type.ESTIMATE:
                if (
                    scriptContext.fieldId == 'custbody_end_user' &&
                    !bbeLib.isNullOrEmpty(scriptContext.currentRecord.getValue('custbody_end_user'))
                    //&& validationLib.isFutureGroupTransaction( scriptContext.currentRecord ) 20240907
                ) {
                    var estimateRecord = currentRecord.get()
                    //validateEndUserForEstimate(estimateRecord); // 5 Units
                    estimateRecord.setValue({
                        fieldId: 'custbody_arka_sourcingrecord',
                        value: estimateRecord.getValue('custbody_end_user'),
                        ignoreFieldChange: true,
                    })
                }
                break
            case record.Type.SALES_ORDER:
                if (scriptContext.fieldId == 'custbody_end_user') {
                    var salesOrderRecord = scriptContext.currentRecord
                    salesOrderRecord.setValue({
                        fieldId: 'custbody_arka_sourcingrecord',
                        value: salesOrderRecord.getValue('custbody_end_user'),
                        ignoreFieldChange: true,
                    })
                }
                break
            case record.Type.PURCHASE_ORDER:
                if (scriptContext.fieldId == 'custbody_po_end_user') {
                    var purchaseOrderRecord = scriptContext.currentRecord
                    companyId = search.lookupFields({
                        type: record.Type.CUSTOMER,
                        id: purchaseOrderRecord.getValue('custbody_po_end_user'),
                        columns: ['custentity_cb_companyid'],
                    })

                    purchaseOrderRecord.setValue({
                        fieldId: 'custbody_arka_sourcingrecord',
                        value: companyId.custentity_cb_companyid,
                        ignoreFieldChange: true,
                    })
                }
                break
            case record.Type.CONTACT:
                if (scriptContext.fieldId == 'company') {
                    scriptContext.currentRecord.setValue({
                        fieldId: 'custentity_company_id',
                        value: scriptContext.currentRecord.getValue('company'),
                    })
                }
                break
        }
    }

    /**
     * Validate if the End User selected can be used.
     *
     * @governance 5 Units
     *
     * @param {record} estimateRecord
     */
    function validateEndUserForEstimate(estimateRecord) {
        var fieldIsValide = true
        var endUserRecord = record.load({
            type: record.Type.CUSTOMER,
            id: estimateRecord.getValue('custbody_end_user'),
            isDynamic: true,
        }) // 5 units
        if (
            endUserRecord.getValue('creditholdoverride') == 'ON' ||
            (endUserRecord.getValue('creditholdoverride') == 'AUTO' &&
                endUserRecord.getValue('creditlimit') < endUserRecord.getValue('balance'))
        ) {
            fieldIsValide = false
        }
        if (!fieldIsValide) {
            estimateRecord.setValue({
                fieldId: 'custbody_end_user',
                value: '',
                ignoreFieldChange: true,
            })
            dialog.alert({
                title: 'Invalide value',
                message: "The End User you have selected can't be used, please check the End User's credit limit.",
            })
        }
    }

    return {
        validateLine: validateLine,
        //saveRecord: savePO,
        fieldChanged: fieldChanged,
    }
})
