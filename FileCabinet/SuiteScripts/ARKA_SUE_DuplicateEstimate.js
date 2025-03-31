/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([
    'N/record',
    'N/search',
    'N/format',
    'N/task',
    'SuiteScripts/NX_LIB_GFunctions.js',
    'SuiteScripts/BBE_LIB_GenericFunctionsSS2.js',
], function (record, search, format, task, NXLIB, BBE_LIB_GenericFunctionsSS2) {
    var AUTODESK_PRODUCTLINE = 13
    var DATECH_ORDERTYPE_RENEWAL = 6
    var ORDERTYPE_FG = 7
    var SUBSIDIARY_ALLOWED = ['16', '12', '13']
    var DUMMY_ITEM = 21490
    var AGACAD_PRODUCTLINE = 185
    var CATEGORIZATION_PERPETUAL = '10'
    var CUSTOM = -1
    var ORDER_TYPE_CONTRACT_RENEWAL = 2
    var AGACAD = 40

    function getMissingContractItem(fromContractId) {
        var missingContractItems = []

        var customrecord_contractsSearchObj = search.create({
            type: 'customrecord_contracts',
            filters: [
                [
                    'formulanumeric: {custrecord_contracts_end_date}-{custrecord_ci_contract_id.custrecord_ci_enddate}',
                    'notequalto',
                    '0',
                ],
                'AND',
                ['internalidnumber', 'equalto', fromContractId],
                'AND',
                ['custrecord_ci_contract_id.custrecord_ci_renewals_exclusion', 'is', 'F'],
            ],
            columns: [
                search.createColumn({ name: 'internalid', label: 'Contract ID' }),
                search.createColumn({
                    name: 'custrecord_ci_renew_with',
                    join: 'CUSTRECORD_CI_CONTRACT_ID',
                    label: 'Renew with',
                }),
                search.createColumn({
                    name: 'custrecord_ci_quantity',
                    join: 'CUSTRECORD_CI_CONTRACT_ID',
                    label: 'Quantity',
                }),
                search.createColumn({
                    name: 'custrecord_ci_term',
                    join: 'CUSTRECORD_CI_CONTRACT_ID',
                    label: 'Contract Item Term',
                }),

                search.createColumn({
                    name: 'formuladate1',
                    formula:
                        'ADD_MONTHS({custrecord_ci_contract_id.custrecord_ci_startdate},{custrecord_contract_renewal_terms})',
                    label: 'New contract item start date',
                }),
                search.createColumn({
                    name: 'formuladate2',
                    formula:
                        'ADD_MONTHS({custrecord_ci_contract_id.custrecord_ci_enddate},{custrecord_contract_renewal_terms})',
                    label: 'New contract item end date',
                }),
                search.createColumn({
                    name: 'custrecord_autodesk_contract_num',
                    join: 'CUSTRECORD_CI_CONTRACT_ID',
                    label: 'Autodesk Contract number',
                }),
                search.createColumn({
                    name: 'custrecord_serial_number',
                    join: 'CUSTRECORD_CI_CONTRACT_ID',
                    label: 'Contract item serial number',
                }),
            ],
        })

        customrecord_contractsSearchObj.run().each(function (result) {
            missingContractItems.push({
                contractID: result.getValue({
                    name: 'internalid',
                }),

                renewWith: result.getValue({
                    name: 'custrecord_ci_renew_with',
                    join: 'CUSTRECORD_CI_CONTRACT_ID',
                }),

                quantity: result.getValue({
                    name: 'custrecord_ci_quantity',
                    join: 'CUSTRECORD_CI_CONTRACT_ID',
                }),

                renewalTerms: result.getValue({
                    name: 'custrecord_ci_term',
                    join: 'CUSTRECORD_CI_CONTRACT_ID',
                }),

                newStartDate: result.getValue({
                    name: 'formuladate1',
                    formula: '{custrecord_ci_contract_id.custrecord_ci_enddate}+1',
                }),

                newEndDate: result.getValue({
                    name: 'formuladate2',
                    formula:
                        'ADD_MONTHS({custrecord_ci_contract_id.custrecord_ci_enddate},{custrecord_ci_contract_id.custrecord_ci_term})',
                }),

                autodeskNumber: result.getValue({
                    name: 'custrecord_autodesk_contract_num',
                    join: 'CUSTRECORD_CI_CONTRACT_ID',
                }),

                serialNumber: result.getValue({
                    name: 'custrecord_serial_number',
                    join: 'CUSTRECORD_CI_CONTRACT_ID',
                }),
            })

            return true
        })

        log.debug('missingContractItems', missingContractItems)

        return missingContractItems
    }

    function insertMissingEstiLines(missingContractItems, estimateRecord) {
        for (var i = 0; i < missingContractItems.length; i++) {
            var renewWith = missingContractItems[i].renewWith
            var quantity = missingContractItems[i].quantity
            var renewalTerms = missingContractItems[i].renewalTerms

            var newStartDate = format.parse({
                value: missingContractItems[i].newStartDate,
                type: format.Type.DATE,
            })

            var newEndDate = format.parse({
                value: missingContractItems[i].newEndDate,
                type: format.Type.DATE,
            })

            var autodeskNumber = missingContractItems[i].autodeskNumber
            var serialNumber = missingContractItems[i].serialNumber

            var lineCount = estimateRecord.getLineCount({
                sublistId: 'item',
            })

            estimateRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: lineCount,
                value: renewWith,
            })

            estimateRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: lineCount,
                value: renewWith,
            })

            estimateRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: lineCount,
                value: quantity,
            })

            estimateRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_swe_contract_item_term_months',
                line: lineCount,
                value: renewalTerms,
            })

            estimateRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_swe_contract_start_date',
                line: lineCount,
                value: newStartDate,
            })

            estimateRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_swe_contract_end_date',
                line: lineCount,
                value: newEndDate,
            })

            estimateRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_line_deliverydate',
                line: lineCount,
                value: newEndDate,
                ignoreFieldChange: true,
                forceSyncSourcing: true,
            })

            estimateRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_autodesk_contract_number',
                line: lineCount,
                value: autodeskNumber,
            })

            estimateRecord.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_serial_number',
                line: lineCount,
                value: serialNumber,
            })
        }
    }

    function fillEstiWith3Version(estimateThreeYr, estiLines) {
        for (var index = 0; index < estiLines.length; index++) {
            var lineObj = estiLines[index]

            estimateThreeYr.selectNewLine({
                sublistId: 'item',
            })

            estimateThreeYr.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: lineObj.item3YrVersion,
                ignoreFieldChange: false,
            })

            var productLine = search.lookupFields({
                type: search.Type.NON_INVENTORY_ITEM,
                id: lineObj.item3YrVersion,
                columns: ['custitem_product_line', 'custitem_autodesk_offering_id'],
            })
            //log.error('productLine',productLine);
            //log.error('item3YrVersion',item3YrVersion);

            var isNBE = false
            log.debug('isNBE', isNBE)
            if (productLine.custitem_autodesk_offering_id && productLine.custitem_autodesk_offering_id != null) {
                isNBE = true
                log.debug('isNBE 121', isNBE)
            }

            productLine = productLine['custitem_product_line'][0]['value']

            if (productLine == AUTODESK_PRODUCTLINE && !isNBE) {
                estimateThreeYr.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_datech_order_scenario',
                    value: DATECH_ORDERTYPE_RENEWAL,
                    ignoreFieldChange: false,
                })
            }

            estimateThreeYr.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: lineObj.quantity,
                ignoreFieldChange: false,
            })

            var itemStrtDateFormatted = format.parse({
                value: lineObj.itemStrtDate,
                type: format.Type.DATE,
            })

            estimateThreeYr.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_swe_contract_start_date',
                value: itemStrtDateFormatted,
                ignoreFieldChange: false,
            })

            var itemEndDate = new Date(itemStrtDateFormatted.setMonth(itemStrtDateFormatted.getMonth() + 36))
            itemEndDate = new Date(itemEndDate.setDate(itemEndDate.getDate() - 1))

            log.debug({
                title: 'line dates',
                details: 'Start: ' + itemStrtDateFormatted.toDateString() + ' , end: ' + itemEndDate.toDateString(),
            })

            estimateThreeYr.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_swe_contract_item_term_months',
                value: 36,
                ignoreFieldChange: false,
            })

            estimateThreeYr.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_swe_contract_end_date',
                value: itemEndDate,
                ignoreFieldChange: false,
            })

            estimateThreeYr.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_serial_number',
                value: lineObj.serialNumber,
                ignoreFieldChange: false,
            })

            estimateThreeYr.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_autodesk_contract_number',
                value: lineObj.autodeskNumber,
                ignoreFieldChange: false,
            })

            estimateThreeYr.commitLine({
                sublistId: 'item',
                ignoreRecalc: false,
            })
        }

        return estimateThreeYr
    }

    function getEstLinesWith3YrVersion(estimateOneYrId) {
        var estiLines = []

        var estimateSearchObj = search.create({
            type: 'estimate',
            filters: [
                ['type', 'anyof', 'Estimate'],
                'AND',
                ['internalid', 'anyof', estimateOneYrId],
                'AND',
                ['mainline', 'is', 'F'],
                'AND',
                ['item.custitem_3yr_version', 'noneof', '@NONE@'],
            ],
            columns: [
                search.createColumn({ name: 'item', label: 'Item' }),
                search.createColumn({
                    name: 'custitem_3yr_version',
                    join: 'item',
                    label: '3 Year Version',
                }),
                search.createColumn({ name: 'quantity', label: 'Quantity' }),
                search.createColumn({
                    name: 'custcol_swe_contract_start_date',
                    label: 'Contract Item Start Date',
                }),
                search.createColumn({
                    name: 'custcol_serial_number',
                    label: 'Serial Number',
                }),
                search.createColumn({
                    name: 'custcol_serial_number_to_be_updated',
                    label: 'Serial Number To Be Updated',
                }),
                search.createColumn({
                    name: 'custcol_renewal_number',
                    label: 'Renewal Number',
                }),
                search.createColumn({
                    name: 'custbody_autodesk_number',
                    label: 'Autodesk Contract Number',
                }),
            ],
        })
        estimateSearchObj.run().each(function (result) {
            estiLines.push({
                item: result.getValue({ name: 'item' }),
                item3YrVersion: result.getValue({
                    name: 'custitem_3yr_version',
                    join: 'item',
                }),
                quantity: result.getValue({ name: 'quantity' }),
                itemStrtDate: result.getValue({
                    name: 'custcol_swe_contract_start_date',
                }),
                serialNumber: result.getValue({ name: 'custcol_serial_number' }),
                serialNumberToBeUpd: result.getValue({
                    name: 'custcol_serial_number_to_be_updated',
                }),
                renewalNumber: result.getValue({ name: 'custcol_renewal_number' }),
                autodeskNumber: result.getValue({ name: 'custbody_autodesk_number' }),
            })

            return true
        })

        return estiLines
    }

    function beforeSubmit(scriptContext) {
        var tranId = ''
        var item = ''

        try {
            var estimateRec = scriptContext.newRecord
            var orderType = estimateRec.getValue({ fieldId: 'custbody_order_type' })
            var subsidiary = estimateRec.getValue({ fieldId: 'subsidiary' })

            //CZ SK FIN
            if (subsidiary == 23 || subsidiary == 24 || subsidiary == 41 || true) {
                // for all subs
                var fromContractId = estimateRec.getValue({
                    fieldId: 'custbody_swe_from_contract',
                })

                log.debug('fromContractId', fromContractId)

                if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(fromContractId)) {
                    var missingContractItems = getMissingContractItem(fromContractId)

                    log.debug({
                        title: 'Data check 1',
                        details: 'missingContractItems: ' + missingContractItems.length,
                    })

                    if (missingContractItems.length !== 0) {
                        insertMissingEstiLines(missingContractItems, estimateRec)
                    }
                }

                var lineCount = estimateRec.getLineCount({
                    sublistId: 'item',
                })

                log.debug({ title: 'Data check 2', details: 'LineCount: ' + lineCount })

                for (var i = lineCount - 1; i >= 0; i--) {
                    var currentItem = estimateRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i,
                    })

                    if (currentItem == DUMMY_ITEM) {
                        estimateRec.removeLine({
                            sublistId: 'item',
                            line: i,
                            ignoreRecalc: true,
                        })
                    }

                    var productLine = search.lookupFields({
                        type: search.Type.NON_INVENTORY_ITEM,
                        id: estimateRec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i,
                        }),
                        columns: ['custitem_product_line', 'custitem_autodesk_offering_id'],
                    })
                    var isNBE = false
                    //log.error('productLine',productLine);
                    log.debug('isNBE 22', isNBE)
                    if (
                        productLine.custitem_autodesk_offering_id &&
                        productLine.custitem_autodesk_offering_id != null
                    ) {
                        isNBE = true
                        log.debug('isNBE 33', isNBE)
                    }

                    if (productLine.custitem_product_line[0].value == AUTODESK_PRODUCTLINE && !isNBE) {
                        //log.error("updating ordertypeFG on line ", i);

                        estimateRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_arka_ordertypeslinefield',
                            value: ORDERTYPE_FG,
                            line: i,
                        })

                        estimateRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_arka_ordertypeslinefield_display',
                            value: 'Renewal',
                            line: i,
                        })
                    }
                }
            }

            if (orderType == ORDER_TYPE_CONTRACT_RENEWAL && subsidiary != AGACAD) {
                var lines = estimateRec.getLineCount({
                    sublistId: 'item',
                })

                tranId = estimateRec.getValue({
                    fieldId: 'tranid',
                })

                for (var index = 0; index < lines; index++) {
                    item = estimateRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: index,
                    })

                    var productLine = search.lookupFields({
                        type: search.Type.NON_INVENTORY_ITEM,
                        id: estimateRec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: index,
                        }),
                        columns: ['custitem_product_line'],
                    })

                    if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(productLine)) {
                        if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(productLine['custitem_product_line'][0])) {
                            productLine = productLine['custitem_product_line'][0]['value']
                        } else {
                            productLine = -1
                        }
                    } else {
                        productLine = -1
                    }

                    if (productLine == AUTODESK_PRODUCTLINE && !isNBE) {
                        estimateRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_datech_order_scenario',
                            value: DATECH_ORDERTYPE_RENEWAL,
                            line: index,
                        })
                    }
                }
            }

            if (orderType == ORDER_TYPE_CONTRACT_RENEWAL && subsidiary == AGACAD) {
                var lines = estimateRec.getLineCount({
                    sublistId: 'item',
                })
                for (var index = 0; index < lines; index++) {
                    var item = search.lookupFields({
                        type: search.Type.NON_INVENTORY_ITEM,
                        id: estimateRec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: index,
                        }),
                        columns: ['custitem_product_line', 'custitem_item_categorization'],
                    })
                    if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(item)) {
                        if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(item['custitem_product_line'][0])) {
                            productLine = item['custitem_product_line'][0]['value']
                        }
                    }
                    if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(item['custitem_item_categorization'])) {
                        if (
                            productLine == AGACAD_PRODUCTLINE &&
                            item['custitem_item_categorization'][0]['value'] == CATEGORIZATION_PERPETUAL
                        ) {
                            estimateRec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'price',
                                value: CUSTOM,
                                line: index,
                            })
                            estimateRec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_list_rate',
                                value: 0,
                                line: index,
                            })
                            estimateRec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                value: 0,
                                line: index,
                            })
                            estimateRec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_rate_before_discount',
                                value: 0,
                                line: index,
                            })
                            estimateRec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_calculated_rate',
                                value: 0,
                                line: index,
                            })
                        }
                    }
                }
            }
        } catch (e) {
            NXLIB.trackScriptEvent(
                'ARKA_SUE_DuplicateEstimate',
                tranId + ' - ' + item + '- Fail to add ite: ' + e.message,
                658344
            )
        }
    }

    function initiateScheduleScript() {
        try {
            var scriptTask = task.create({
                taskType: task.TaskType.SCHEDULED_SCRIPT,
            })
            scriptTask.scriptId = 3360
            deploymentCount = deploymentCount + 1
            scriptTask.deploymentId = 'customdeploy_ssc_initializeestimate' + '_' + deploymentCount.toString()
            scriptTask.params = { custscript_estimateid: estimate3YrID }
            var scriptTaskId = scriptTask.submit()
        } catch (e) {
            if (e.message.includes('INPROGRESS')) {
                if (deploymentCount == 5) {
                    deploymentCount = 0
                }

                initiateScheduleScript()
            } else {
                NXLIB.trackScriptEvent('ARKA_SUE_DuplicateEstimate', 'Fail to update Estimate: ' + e.message, 658344)
            }
        }
    }

    function afterSubmit(scriptContext) {
        estimate3YrID = -1
        deploymentCount = 0

        try {
            var estimateOneYrId = scriptContext.newRecord.id
            var estimateOneYr = scriptContext.newRecord
            var type = estimateOneYr.getValue('type')
            log.debug('type', type)

            if (type == 'opprtnty') {
                //Generation for 3yr should not apply to opportunities
                return
            }

            var estiOneYrLineCount = estimateOneYr.getLineCount({
                sublistId: 'item',
            })
            var subsidiary = estimateOneYr.getValue({
                fieldId: 'subsidiary',
            })

            var contractTerm = estimateOneYr.getValue({
                fieldId: 'custbody_tran_term_in_months',
            })

            if (SUBSIDIARY_ALLOWED.includes(subsidiary)) {
                var estiLines = getEstLinesWith3YrVersion(estimateOneYrId)

                if (contractTerm == 12 && estiOneYrLineCount == estiLines.length) {
                    var estOneYr_strtDate = estimateOneYr.getValue({
                        fieldId: 'startdate',
                    })

                    var estOneYr_tranID = estimateOneYr.getValue({
                        fieldId: 'tranid',
                    })

                    var estimateThreeYr = record.copy({
                        type: record.Type.ESTIMATE,
                        id: estimateOneYrId,
                        isDynamic: true,
                    })

                    estimateThreeYr.setValue({
                        fieldId: 'memo',
                        value: '3Year version of: ' + estOneYr_tranID,
                        ignoreFieldChange: false,
                    })

                    estimateThreeYr.setValue({
                        fieldId: 'custbody_tran_term_in_months',
                        value: '36',
                        ignoreFieldChange: false,
                    })

                    estimateThreeYr.setValue({
                        fieldId: 'startdate',
                        value: estOneYr_strtDate,
                        ignoreFieldChange: false,
                    })

                    estimateThreeYr.setValue({
                        fieldId: 'entitystatus',
                        value: 124,
                        ignoreFieldChange: false,
                    })

                    var estOneYr_endDateObj = new Date(estOneYr_strtDate.setMonth(estOneYr_strtDate.getMonth() + 36))
                    estOneYr_endDateObj = new Date(estOneYr_strtDate.setDate(estOneYr_strtDate.getDate() - 1))

                    estimateThreeYr.setValue({
                        fieldId: 'enddate',
                        value: estOneYr_endDateObj,
                        ignoreFieldChange: false,
                    })

                    estimateThreeYr.setValue({
                        fieldId: 'custbody_3yr_version',
                        value: true,
                        ignoreFieldChange: false,
                    })

                    /** Remove existing lines from New Estimate **/
                    for (var index = 0; index < estiOneYrLineCount; index++) {
                        estimateThreeYr.removeLine({
                            sublistId: 'item',
                            line: 0,
                            ignoreRecalc: true,
                        })
                    }

                    /** Fill lines in 3Yr Estimate **/
                    estimateThreeYr = fillEstiWith3Version(estimateThreeYr, estiLines)

                    estimate3YrID = estimateThreeYr.save()

                    initiateScheduleScript()
                } else {
                }
            }
        } catch (e) {
            NXLIB.trackScriptEvent('ARKA_SUE_DuplicateEstimate', e.message, 658344)
        }
    }

    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit,
    }
})
