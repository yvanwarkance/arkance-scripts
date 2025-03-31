/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', './BBE_LIB_GenericFunctionsSS2', 'N/search', 'N/url', 'N/runtime'], function (
    log,
    record,
    bbeLib,
    search,
    url,
    runtime
) {
    var ARKA_LOGGING_EMAIL = 'logging.ns+arka@bigbang360.com'
    var CSC_FORM = '240'
    var CONTRACT_RENEWAL_ID = '2'
    var CONTRACT_RECORD = 'customrecord_contracts'

    /**
     * Function to add the 'Display Activation codes' button on customer record.
     * @param {Object} scriptContext
     *
     * @governance 0 unit
     */
    function beforeLoad(scriptContext) {
        var userObj = runtime.getCurrentUser()

        if (
            scriptContext.newRecord.type == record.Type.CUSTOMER &&
            scriptContext.type == scriptContext.UserEventType.VIEW &&
            userObj.subsidiary == 40
        ) {
            var form = scriptContext.form

            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_genagacodestable',
                deploymentId: 'customdeploy_genagacodestable',
                returnExternalUrl: false,
            })
            suiteletUrl += '&customerId=' + scriptContext.newRecord.id

            form.addButton({
                id: 'custpage_display_activation_codes',
                label: 'Display activation codes',
                functionName: "displayActivationCodes('" + suiteletUrl + "')",
            })
            form.clientScriptModulePath = './ARKA_CUE_ManualSyncPO.js'
        }
    }

    /**
     * Function that triggers after record is saved. It will update the autodesk contract and serial number
     * on the contract items
     *
     * @governance 20 units
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     */
    function afterSubmit(scriptContext) {
        var newRecord = scriptContext.newRecord
        try {
            if (newRecord.type == record.Type.ESTIMATE) {
                var estimateRecord = record.load({
                    type: record.Type.ESTIMATE,
                    id: scriptContext.newRecord.id,
                })
                if (
                    estimateRecord.getValue('custbody_order_type') == CONTRACT_RENEWAL_ID &&
                    estimateRecord.getValue('custbody_eshopmake_copy') == true
                ) {
                    makeCopyEstimate(scriptContext, estimateRecord.getValue('custbody_end_user')) // 0 units
                }
            }
            if (newRecord.type == record.Type.CUSTOMER) {
                addCurrencyCustomerRecord(scriptContext) // 0 units
            }
        } catch (e) {
            bbeLib.logError({
                err: e,
                title: 'Could Not Make a copy of Estimate or set it to void or update customer record',
                loggingEmail: ARKA_LOGGING_EMAIL,
            }) // 20 units
        }
    }
    /**
     * Function to ...
     * @governance 6 units
     * @param {Object} scriptContext
     */
    function makeCopyEstimate(scriptContext, customerId) {
        var customerLookUp = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: customerId,
            columns: ['custentity_currency_to_add'],
        })
        var currencyToSet = customerLookUp.custentity_currency_to_add.toString()
        var newRecordEstimate = record.copy({
            type: record.Type.ESTIMATE,
            id: scriptContext.newRecord.id,
            isDynamic: false,
        })
        newRecordEstimate.setValue({
            fieldId: 'currency',
            value: currencyToSet,
        })
        newRecordEstimate.setValue({
            fieldId: 'custbody_eshopmake_copy',
            value: false,
        })
        var newEstimateId = newRecordEstimate.save()
        record.submitFields({
            type: record.Type.CUSTOMER,
            id: customerId,
            values: {
                custentity_currency_to_add: '',
            },
        })
        record.delete({
            type: record.Type.ESTIMATE,
            id: scriptContext.newRecord.id,
        })
        record.submitFields({
            type: CONTRACT_RECORD,
            id: scriptContext.newRecord.getValue('custbody_swe_from_contract'),
            values: {
                custrecord_contract_renewal_tran: newEstimateId,
            },
        })
    }
    /**
     *Function to ....
     *@governance xxx units
     *@param {Object} scriptContext
     */
    function addCurrencyCustomerRecord(scriptContext) {
        var customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: scriptContext.newRecord.id,
        })
        var currencyCount = customerRecord.getLineCount({
            sublistId: 'currency',
        })
        var eshopCurrency = customerRecord.getValue('custentity_currency_to_add')
        if (!bbeLib.isNullOrEmpty(eshopCurrency)) {
            var toUpdate = false
            for (var index = 0; index < currencyCount; index++) {
                var currencyId = customerRecord.getSublistValue({
                    sublistId: 'currency',
                    fieldId: 'currency',
                    line: index,
                })
                if (currencyId == eshopCurrency) {
                    toUpdate = true
                }
            }
            if (!toUpdate) {
                customerRecord.setSublistValue({
                    sublistId: 'currency',
                    fieldId: 'currency',
                    line: currencyCount,
                    value: eshopCurrency,
                })
                customerRecord.save()
            }
        }
    }
    return {
        afterSubmit: afterSubmit,
        beforeLoad: beforeLoad,
    }
})
