/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define([
    'N/record',
    'SuiteScripts/BBE_LIB_GenericFunctionsSS2.js',
    'N/search',
    'N/format',
    'N/ui/serverWidget',
    'N/ui/message',
    'N/runtime',
    'N/email',
    'N/query',
], function (record, bbeLib, search, format, serverWidget, message, runtime, email, query) {
    const USER_Email = 'rohan.ramlochund@nx2square.com'
    //ARK-323 - pending
    const statusStage4 = 129
    const statusStage4Percentage = 75

    /**
     * Executes after the record is submitted.
     * @param {Object} scriptContext - Script context.
     * @param {Record} scriptContext.newRecord - New record.
     * @param {string} scriptContext.type - Trigger type.
     * @governance 30 units
     */
    function afterSubmit(scriptContext) {
        var currentRecord = scriptContext.newRecord
        var IsCreatedFromOpportunity = currentRecord.getValue('opportunity')

        //ARK-323 - pending
        if (
            currentRecord.type == 'estimate' &&
            (scriptContext.type == scriptContext.UserEventType.CREATE ||
                scriptContext.type == scriptContext.UserEventType.COPY) &&
            IsCreatedFromOpportunity
        ) {
            record.submitFields({
                type: record.Type.OPPORTUNITY,
                id: IsCreatedFromOpportunity,
                values: {
                    entitystatus: statusStage4,
                },
            })
        }

        //ARK-323 - pending
        if (currentRecord.type == 'estimate' && scriptContext.type == scriptContext.UserEventType.EDIT) {
            var currentRecordID = currentRecord.id
            if (currentRecordID) {
                let hasSalesOrder = hasRelatedSalesOrder(currentRecordID) //10 units

                if (hasSalesOrder) {
                    var IsCreatedFromOpportunity = currentRecord.getValue('opportunity')
                    let winLossReasonCopy = currentRecord.getValue({ fieldId: 'custbody_winlossreason_estimate' })
                    try {
                        if (IsCreatedFromOpportunity) {
                            record.submitFields({
                                type: record.Type.OPPORTUNITY,
                                id: IsCreatedFromOpportunity,
                                values: {
                                    winlossreason: winLossReasonCopy,
                                },
                            })
                        }
                    } catch (error) {
                        email.send({
                            author: runtime.getCurrentUser().id,
                            recipients: USER_Email,
                            subject: 'Fail To Winloss Reason Value',
                            body: `<html><body> <p> Hello, <br/> The following error occur while setting the win /loss reason value:<br/> ${error.message} <br/><br/><br/><br/>Thanks!`,
                        }) //20 units
                    }
                }
            }
        }
    }

    /**
     * Checks if the current estimate has a related sales order.
     * @param {string} currentRecordID - ID of the current record.
     * @returns {boolean} - True if a related sales order exists, false otherwise.
     * @governance 10 units
     */
    function hasRelatedSalesOrder(currentRecordID) {
        var salesorderSearchObj = search.create({
            type: 'salesorder',
            filters: [
                ['type', 'anyof', 'SalesOrd'],
                'AND',
                ['createdfrom', 'anyof', currentRecordID],
                'AND',
                ['mainline', 'is', 'T'],
            ],
            columns: [search.createColumn({ name: 'internalid', label: 'Internal ID' })],
        })
        const resultInternalID = bbeLib.getAllSearchResults({ search: salesorderSearchObj })
        return resultInternalID.length > 0
    }

    //New
    /**
     * This function will get the opportunity form + subsidairy
     * Will search and get the correct estimate form to map in estimate
     * @param {ID} createdFrom - The created from the load the data from opportunity
     * @governance 15 units
     */
    function setEstimateFrom(createdFrom, currentRecord) {
        let recOpportunity = record.load({
            type: record.Type.OPPORTUNITY,
            id: createdFrom,
        })

        let subsidiary = recOpportunity.getValue({ fieldId: 'subsidiary' })
        let customForm = recOpportunity.getValue({ fieldId: 'customform' })

        if (subsidiary && customForm) {
            var searchEstimate = search.create({
                type: 'customrecord_mapping_est_form',
                filters: [
                    ['custrecord_subsidairy', 'anyof', subsidiary],
                    'AND',
                    ['custrecord_opp_form', 'anyof', customForm],
                ],
                columns: [search.createColumn({ name: 'custrecord_esti_form', label: 'Estimate Form' })],
            })
            var searchResults = searchEstimate.run().getRange(0, 1)

            if (searchResults && searchResults.length > 0) {
                var estimateForm = searchResults[0].getValue({ name: 'custrecord_esti_form' })
                // currentRecord.setValue({
                //     fieldId: 'customform',
                //     value: estimateForm,
                //     ignoreFieldChange: true
                // });
            }
        }
    }

    /**
     * Executes before the record is loaded.
     * @param {Object} scriptContext - Script context.
     * @param {Record} scriptContext.newRecord - New record.
     * @param {Form} scriptContext.form - Current form.
     * @governance 10 units
     */
    function beforeLoad(scriptContext) {
        var currentRecord = scriptContext.newRecord
        var currentRecordID = currentRecord.id

        if (
            (scriptContext.type == scriptContext.UserEventType.COPY ||
                scriptContext.type == scriptContext.UserEventType.TRANSFORM ||
                scriptContext.type == scriptContext.UserEventType.CREATE) &&
            (currentRecord.type == 'opportunity' || currentRecord.type == 'estimate')
        ) {
            let currentUser = runtime.getCurrentUser().id
            if (currentUser) {
                currentRecord.setValue({
                    fieldId: 'custbody_cb_issued_by',
                    value: currentUser,
                })
            }
        }

        //ARK-323 - pending
        if (currentRecord.type == 'estimate') {
            if (currentRecordID) {
                let haveSO = hasRelatedSalesOrder(currentRecordID)
                if (haveSO) {
                    let winLossReason = scriptContext.form.getField({ id: 'custbody_winlossreason_estimate' })
                    if (winLossReason) {
                        winLossReason.isMandatory = true
                    }
                }
            }
        }

        //Ark-321 Date Validation - pending
        if (
            (currentRecord.type == 'opportunity' || currentRecord.type == 'estimate') &&
            (scriptContext.type === scriptContext.UserEventType.CREATE ||
                scriptContext.type === scriptContext.UserEventType.EDIT) &&
            runtime.executionContext == runtime.ContextType.USER_INTERFACE
        ) {
            let currentForm = currentRecord.getValue({ fieldId: 'customform' })
            let projectForm = 125
            let form = scriptContext.form
            let sublist = form.getSublist({ id: 'item' })
            if (currentForm != projectForm) {
                scriptContext.form.clientScriptModulePath = 'SuiteScripts/ARKA_CUE_TenderCheckboxControl.js'
                if (sublist) {
                    sublist.addButton({
                        id: 'custpage_updateDateBtn',
                        label: 'Update Line Date',
                        functionName: 'updateDates()',
                    })
                }
            }
        }

        //Ark-321 Date Validation
        if (
            (currentRecord.type == 'estimate' || currentRecord.type == 'opportunity') &&
            scriptContext.type === scriptContext.UserEventType.VIEW
        ) {
            let dateError = currentRecord.getValue({ fieldId: 'custbody_datemessage' })
            let currentForm = currentRecord.getValue({ fieldId: 'customform' })
            let projectForm = 125
            if (dateError && currentForm != projectForm) {
                scriptContext.form.addPageInitMessage({
                    type: message.Type.ERROR,
                    message: dateError,
                })
            }
        }

        let haveCreatedFrom = currentRecord.getValue({ fieldId: 'opportunity' })
        if (
            (scriptContext.type === scriptContext.UserEventType.CREATE ||
                scriptContext.type === scriptContext.UserEventType.COPY) &&
            currentRecord.type == 'estimate' &&
            haveCreatedFrom
        ) {
            setEstimateFrom(haveCreatedFrom, currentRecord)
            currentRecord.setValue({
                fieldId: 'entitystatus',
                value: statusStage4,
            })

            currentRecord.setValue({
                fieldId: 'probability',
                value: statusStage4Percentage,
            })
        }
    }

    /**
     * Executes before the record is submitted.
     * @param {Object} scriptContext - Script context.
     * @param {Record} scriptContext.newRecord - New record.
     * @governance 5 units
     */
    function beforeSubmit(scriptContext) {
        var currentRecord = scriptContext.newRecord
        var hasContract = currentRecord.getValue({ fieldId: 'custbody_swe_from_contract' })
        let terms = currentRecord.getValue({ fieldId: 'custbody_tran_term_in_months' })
        var contractEndDate

        if (scriptContext.type == scriptContext.UserEventType.CREATE) {
            if (currentRecord.type == 'opportunity' && hasContract) {
                var contractSearchObj = search.create({
                    type: 'customrecord_contracts',
                    filters: [['isinactive', 'is', 'F'], 'AND', ['id', 'equalto', hasContract]],
                    columns: [
                        search.createColumn({
                            name: 'formulatext',
                            formula: "TO_CHAR({custrecord_contracts_end_date}, 'YYYY-MM-DD HH:MI:SS')",
                            label: 'Formula (Text)',
                        }),
                    ],
                })

                var searchResultContract = contractSearchObj.run().getRange(0, 1)

                if (searchResultContract.length > 0) {
                    contractEndDate = searchResultContract[0].getValue({
                        name: 'formulatext',
                        formula: "TO_CHAR({custrecord_contracts_end_date}, 'YYYY-MM-DD HH:MI:SS')",
                        label: 'Formula (Text)',
                    })

                    let contractNewEndDate = new Date(contractEndDate)
                    contractNewEndDate.setDate(contractNewEndDate.getDate() + 1)

                    if (terms && contractNewEndDate) {
                        /*currentRecord.setValue({ fieldId: 'custbody_startdate', value: new Date(contractNewEndDate) });
                        let endDate = new Date(contractNewEndDate.setMonth(contractNewEndDate.getMonth() + terms));
                        endDate.setDate(endDate.getDate() - 1);
                        currentRecord.setValue({ fieldId: 'custbody_enddate', value: new Date(endDate) });*/

                        //New
                        currentRecord.setValue({ fieldId: 'custbody_startdate', value: new Date(contractNewEndDate) })
                        let fullMonths = Math.floor(terms)
                        let endDate = new Date(contractNewEndDate.setMonth(contractNewEndDate.getMonth() + fullMonths))
                        let remainingDays = Math.round((terms - fullMonths) * 30)
                        endDate.setDate(endDate.getDate())
                        endDate.setDate(endDate.getDate() + remainingDays)
                        endDate.setDate(endDate.getDate() - 1)
                        currentRecord.setValue({ fieldId: 'custbody_enddate', value: new Date(endDate) })
                    }
                }
            }
        }

        if (
            (scriptContext.type == scriptContext.UserEventType.CREATE ||
                scriptContext.type == scriptContext.UserEventType.EDIT) &&
            (currentRecord.type == 'estimate' || currentRecord.type == 'opportunity')
        ) {
            validateDateHeader(currentRecord)
        }
    }
    /**
     * Formats a date string into 'DD/MM/YYYY' format.
     *
     * @param {string} dateString - Date string in a format parsable by the Date constructor.
     * @returns {string} - Formatted date string.
     * @governance 0 unit
     */
    function formatDate(dateString) {
        let date = new Date(dateString)
        let day = String(date.getDate()).padStart(2, '0')
        let month = String(date.getMonth() + 1).padStart(2, '0')
        let year = date.getFullYear()
        return `${year}/${month}/${day}`
    }

    /**
     * Validate Header date{Start and End Date} with that of the Line DateStart and End Date} ,
     * display an error message if date don't match and prevent saving of record.
     * @param {context} - The contex of the current record.
     * @governance 0 unit
     */
    function validateDateHeader(currentRec) {
        let startDate
        let endDate
        if (currentRec.type == 'opportunity') {
            startDate = currentRec.getValue({ fieldId: 'custbody_startdate' })
            endDate = currentRec.getValue({ fieldId: 'custbody_enddate' })
        }
        if (currentRec.type == 'estimate') {
            startDate = currentRec.getValue({ fieldId: 'startdate' })
            endDate = currentRec.getValue({ fieldId: 'enddate' })
        }
        let headerStartDate = formatDate(startDate)
        let headerEndDate = formatDate(endDate)
        let headerTerm = currentRec.getValue({ fieldId: 'custbody_tran_term_in_months' })
        let lineCount = currentRec.getLineCount({ sublistId: 'item' })
        let bool = true
        let mismatchedLines = []

        let itemIdArr = []
        for (let i = 0; i < lineCount; i++) {
            let itemId = currentRec.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i,
            })
            itemIdArr.push(itemId)
        }
        let licenseTermItem = []
        if (itemIdArr.length) {
            licenseTermItem = getLicenseTermItem(itemIdArr)
        }

        for (let i = 0; i < lineCount; i++) {
            let itemType = currentRec.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line: i })
            let itemId = currentRec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i })

            if (itemType == 'NonInvtPart' && licenseTermItem.includes(itemId)) {
                let lineTerm = currentRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_swe_contract_item_term_months',
                    line: i,
                })

                let startDates = currentRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_swe_contract_start_date',
                    line: i,
                })

                let lineStartDate = formatDate(startDates)
                let endDates = currentRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_swe_contract_end_date',
                    line: i,
                })

                let lineEndDate = formatDate(endDates)
                if (headerStartDate > lineStartDate || headerEndDate < lineEndDate) {
                    mismatchedLines.push(i + 1)
                }
            }
        }
        let messages = ''
        if (mismatchedLines.length > 0) {
            messages = 'The Line Date is out of range  match on the following Line(s): ' + mismatchedLines.join(', ')
        }
        currentRec.setValue({
            fieldId: 'custbody_datemessage',
            value: messages,
        })

        return bool
    }
    function getLicenseTermItem(itemIdArr) {
        let queryString = `
            SELECT
                id
            FROM
                item
            WHERE
                custitem_item_category = 2
                AND id IN (${itemIdArr.join(',')})
        `

        let resultSet = query.runSuiteQL({
            query: queryString,
        }).results

        return resultSet.map((result) => result.values[0])
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit,
    }
})
