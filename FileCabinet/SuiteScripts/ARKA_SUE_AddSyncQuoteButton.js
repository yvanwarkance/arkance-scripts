/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([
    './BBE_LIB_GenericFunctionsSS2.js',
    'N/query',
    'N/url',
    'N/ui/message',
    'N/record',
    'N/ui/serverWidget',
    'N/search',
    'N/runtime',
], function (bbeLib, query, url, message, record, serverWidget, search, runtime) {
    const PROD_AUTODESK = '13'
    const SOFT_PROD_FLEX = '1711'
    const SOFT_PROD_AUTODESK_FLEX = '588'
    const TERM_CODE = {
        Annual: 'A01',
        Year3: 'A06',
    }
    const APPROVED = '2'
    const PENDING = 1 //"Pending",
    const IN_PROGRESS = 2 //"In Progress",
    const ACKNOWLEDGED = 3 //"Acknowledged",
    const FINALIZED = 4 //"Finalized"
    const COMPLETED = 5 //"Completed"
    const SUBS_CZ = 23 //"Completed"
    const SUBS_SK = 24 //"Completed"
    const QUOTE_DETAIL_STATUS = {
        RECEIVED: 1,
        'DRAFT-CREATED': 2,
        FINALIZING: 3,
        QUOTED: 4,
        'ORDER-SUBMITTED': 5,
        ORDERED: 6,
        EXPIRED: 7,
        CANCELLED: 8,
        'UNDER-REVIEW': 9,
        FAILED: 10,
    }
    const STATUS = {
        QUOTECLOSED_WON: '135',
        CLOSED_WON: '13',
        CLOSED_LOST: '14',
        CLOSED_LOST_STAGE8: '136',
    }
    const VALUE = {
        renewOrderScenrio: 2,
    }

    const CANCELLEDBUTTON_STATUS = [
        QUOTE_DETAIL_STATUS['DRAFT-CREATED'],
        QUOTE_DETAIL_STATUS['QUOTED'],
        QUOTE_DETAIL_STATUS['FINALIZING'],
        QUOTE_DETAIL_STATUS['UNDER-REVIEW'],
    ]
    const RESETBUTTON_STATUS = [QUOTE_DETAIL_STATUS['FAILED'], QUOTE_DETAIL_STATUS['CANCELLED']]

    /**
     * Function to be executed when the form is loaded.
     *
     * @param {Object} scriptContext
     * @governance 41 Units
     */
    function beforeLoad(scriptContext) {
        var rec = scriptContext.newRecord
        var recId = scriptContext.newRecord.id
        var approvalStatus = rec.getValue('custbody_quote_approval_status')
        var oppStatus = rec.getValue('status')
        var subs = rec.getValue('subsidiary')
        var entityStatus = rec.getValue('entitystatus')
        var autodeskValidationError = rec.getValue('custbody_autodesknxm_missing_fields')
        var autodeskQuoteStatus = rec.getValue('custbody_autodesk_quote_status')
        var autodeskQuoteNumber = rec.getValue('custbody_autodesk_quote_number')
        // if(subs == SUBS_CZ || subs == SUBS_SK)//No approval for CZ and SK
        // {
        //     approvalStatus = APPROVED;
        // }

        var queryResult
        var queryResultCheckConvAuto
        var doesContainRenewalNbeitem = false
        var listItems = new Set()
        var lineCount = rec.getLineCount({ sublistId: 'item' })
        let renewalLines = []

        for (var index = 0; index < lineCount; index++) {
            var itemId = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: index,
            })

            var adskScenario = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_trans_autodeskquotescenario',
                line: index,
            })

            var renOppNumber = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_renewal_number',
                line: index,
            })

            if (adskScenario == VALUE.renewOrderScenrio && renOppNumber && itemId) {
                renewalLines.push(parseInt(itemId))
            }

            listItems.add(itemId)
        }

        var listItemsArray = Array.from(listItems)

        if (listItemsArray.length) {
            var itemTypeSql =
                ' select i.id, itemid,custitem_software_product,custitem_product_line,pl.name,sp.name  ' +
                ' from item i  inner join CUSTOMRECORD_PRODUCT_LINE pl on i.custitem_product_line = pl.id ' +
                ' inner join CUSTOMRECORD_SOFTWARE_PRODUCTS sp on i.custitem_software_product = sp.id  ' +
                ' where i.id in (' +
                listItemsArray.join(',') +
                ") and  custitem_product_line = '" +
                PROD_AUTODESK +
                "' and custitem_autodesk_offering_id IS NOT NULL"

            //log.debug('itemTypeSql',itemTypeSql)

            var resultSet = query.runSuiteQL({
                //10 units
                query: itemTypeSql,
            })

            queryResult = resultSet.results

            queryResult.every((item) => {
                let nbeItem = item.values[0]

                if (nbeItem && renewalLines.includes(parseInt(nbeItem))) {
                    doesContainRenewalNbeitem = true
                }
            })

            let queryStringCheckConvAuto =
                ' select itemid,custitem_software_product,custitem_product_line,pl.name,sp.name  ' +
                ' from item i  inner join CUSTOMRECORD_PRODUCT_LINE pl on i.custitem_product_line = pl.id ' +
                ' inner join CUSTOMRECORD_SOFTWARE_PRODUCTS sp on i.custitem_software_product = sp.id  ' +
                ' where i.id in (' +
                listItemsArray.join(',') +
                ") and  custitem_product_line = '" +
                PROD_AUTODESK +
                "' and custitem_autodesk_offering_id IS NULL AND (i.custitem_autodesk_noneligiblenbe = 'F' OR i.custitem_autodesk_noneligiblenbe IS NULL)"

            var resultSetCheckConvAuto = query.runSuiteQL({
                //10 units
                query: queryStringCheckConvAuto,
            })

            queryResultCheckConvAuto = resultSetCheckConvAuto.results
        }

        if (
            scriptContext.type == scriptContext.UserEventType.VIEW ||
            scriptContext.type == scriptContext.UserEventType.EDIT
        ) {
            var customerId = rec.getValue('custbody_end_user')
            if (customerId) {
                var customerLookup = search.lookupFields({
                    type: search.Type.CUSTOMER,
                    id: customerId,
                    columns: [
                        'custentity_autodesk_cust_proc_readiness',
                        'companyname',
                        'custentity_autodesk_customer_type',
                    ],
                })

                var readinessStatus = customerLookup.custentity_autodesk_cust_proc_readiness
                var custName = customerLookup.companyname
                var autodeskCustomerType = customerLookup.custentity_autodesk_customer_type

                if (
                    readinessStatus !== 'Completed' &&
                    readinessStatus !== 'No Setup Required' &&
                    autodeskCustomerType != 'Government' &&
                    queryResult &&
                    queryResult.length
                ) {
                    var warningMessage = `The procurement readiness for the customer <b>${custName}</b> is not completed!`
                    let readinessMsg = message.create({
                        title: 'Warning',
                        message: warningMessage,
                        type: message.Type.WARNING,
                    })

                    scriptContext.form.addPageInitMessage(readinessMsg)
                }

                var customerNBEmsgString
                if (autodeskCustomerType == 'Government' && queryResult && queryResult.length) {
                    customerNBEmsgString = `<b>WARNING:</b> Mismatch Customer Type Government and Item Type ADSK NBE detected. Please check your items.`
                } else if (
                    autodeskCustomerType != 'Government' &&
                    queryResultCheckConvAuto &&
                    queryResultCheckConvAuto.length
                ) {
                    customerNBEmsgString = `<b>WARNING:</b>  Mismatch Customer Type End User and item Type ADSK Buy-Sell detected. Please check your items.`
                }

                if (customerNBEmsgString) {
                    let customerNBEmsg = message.create({
                        title: 'Warning',
                        message: customerNBEmsgString,
                        type: message.Type.WARNING,
                    })

                    scriptContext.form.addPageInitMessage(customerNBEmsg)
                }
            }
        }

        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_ssu_flexquote', //_testquote
            deploymentId: 'customdeploy_ssu_flexquote', //_testquote
            returnExternalUrl: false,
        })

        if (
            scriptContext.type == scriptContext.UserEventType.VIEW &&
            rec.type == record.Type.ESTIMATE &&
            (approvalStatus == APPROVED || subs == SUBS_CZ || subs == SUBS_SK)
        ) {
            var isAutodesk = false

            if (!listItemsArray.length) {
                return
            }

            if (!bbeLib.isNullOrEmpty(queryResult)) {
                isAutodesk = true
                hideSalesOrderButton(scriptContext) //Hide sales order button for new model autodesk item
            }

            if (isAutodesk /*&& oppStatus == 'Open'*/ && !autodeskValidationError) {
                var autodeskQuoteError = rec.getValue('custbody_autodesk_error')
                let autodeskQuoteDetailStatus = rec.getValue('custbody_autodesk_quote_detail_status')

                if (autodeskQuoteError) {
                    var Title = 'Autodesk Quote Error'
                    var Message = autodeskQuoteError

                    let myMsg4 = message.create({
                        title: Title,
                        message: Message,
                        type: message.Type.ERROR,
                    })

                    scriptContext.form.addPageInitMessage(myMsg4)
                }

                var buttonName = ''
                if (autodeskQuoteStatus == PENDING && !autodeskQuoteNumber) {
                    buttonName = 'Create Quote'
                } else if (autodeskQuoteStatus == IN_PROGRESS) {
                    buttonName = 'Get Status'
                } else if (autodeskQuoteStatus == ACKNOWLEDGED) {
                    buttonName = 'Get Details'
                } else if (autodeskQuoteStatus == FINALIZED) {
                    buttonName = 'Finalize Quote'
                }

                suiteletUrl += '&quoteid=' + recId

                //QUOTE SYNCHRONISATIOn BUTTON
                if (
                    buttonName &&
                    ![QUOTE_DETAIL_STATUS['CANCELLED'], QUOTE_DETAIL_STATUS['FAILED']].includes(
                        parseInt(autodeskQuoteDetailStatus)
                    )
                ) {
                    scriptContext.form.addButton({
                        id: 'custpage_flex_func',
                        label: buttonName,
                        functionName: "autodeskQuote('" + suiteletUrl + "')",
                    })
                }

                //CANCEL QUOTE BUTTON
                if (autodeskQuoteDetailStatus && CANCELLEDBUTTON_STATUS.includes(parseInt(autodeskQuoteDetailStatus))) {
                    let cancelledUrl = suiteletUrl + '&action=CANCEL'
                    scriptContext.form.addButton({
                        id: 'custpage_autodesk_cancel_func',
                        label: 'Cancel Quote',
                        functionName: "autodeskQuote('" + cancelledUrl + "')",
                    })
                }

                //RESET QUOTE BUTTON
                if (
                    ((autodeskQuoteDetailStatus && RESETBUTTON_STATUS.includes(parseInt(autodeskQuoteDetailStatus))) ||
                        autodeskQuoteError) &&
                    autodeskQuoteStatus != COMPLETED
                ) {
                    let resetUrl = suiteletUrl + '&action=RESET'
                    scriptContext.form.addButton({
                        id: 'custpage_autodesk_reset_func',
                        label: 'Reset Quote',
                        functionName: "autodeskQuote('" + resetUrl + "')",
                    })
                }

                //Sync Autodesk Portal Quote BUTTON
                let eligibleRolesSyncQuotePortal = [
                    3, //admin
                    1310, //Ody BO - EMEA
                ]

                if (
                    autodeskQuoteStatus == PENDING &&
                    autodeskQuoteNumber &&
                    eligibleRolesSyncQuotePortal.includes(runtime.getCurrentUser().role)
                ) {
                    let sycnPortalQuoteUrl = suiteletUrl + '&action=SYNCPORTALQUOTE'
                    scriptContext.form.addButton({
                        id: 'custpage_autodesk_reset_func',
                        label: 'Sync Portal Quote Details',
                        functionName: "autodeskQuote('" + sycnPortalQuoteUrl + "')",
                    })
                }

                scriptContext.form.clientScriptModulePath = './ARKA_CUE_AutodeskQuoteFuncs.js'
            }
        }

        //GENERATE ESTIMATE BUTTON
        if (
            scriptContext.type == scriptContext.UserEventType.VIEW &&
            rec.type == record.Type.OPPORTUNITY /*&& approvalStatus == APPROVED*/ &&
            ![STATUS.CLOSED_LOST, STATUS.QUOTECLOSED_WON, STATUS.CLOSED_WON, STATUS.CLOSED_LOST_STAGE8].includes(
                entityStatus
            )
        ) {
            //log.error('opp status', oppStatus);

            suiteletUrl = suiteletUrl + '&oppId=' + recId

            if (!autodeskValidationError) {
                scriptContext.form.addButton({
                    id: 'custpage_generate_ split_estimate_func',
                    label: 'Generate Estimate',
                    functionName: `opportunityFunc('${suiteletUrl}', 'opportunity', ${recId})`,
                })

                let canGenerate3yrEstimate = checkPossible3yrAlternate(listItemsArray) //10 units

                if (canGenerate3yrEstimate) {
                    let suiteletUrlAlternateEstimate = suiteletUrl + `&alternateEstimate=YES`
                    scriptContext.form.addButton({
                        id: 'custpage_alternate_3y_estimate_func',
                        label: 'Alternate 3Y Estimate',
                        functionName: `opportunityFunc('${suiteletUrlAlternateEstimate}', 'opportunity', ${recId})`,
                    })
                }
            }

            //update opportunity
            if (doesContainRenewalNbeitem) {
                let nbeoppupdates = rec.getValue('custbody_autodesk_nbeoppupdates')

                if (nbeoppupdates) {
                    var Title = 'Autodesk NBE Opportunity Updates'
                    var Message = nbeoppupdates

                    let myMsgOppUpdate = message.create({
                        title: Title,
                        message: Message,
                        type: message.Type.WARNING,
                    })

                    scriptContext.form.addPageInitMessage(myMsgOppUpdate)
                }

                let suiteletUrlUpdateOpp = suiteletUrl + `&checkUpdateOpportunity=YES`
                scriptContext.form.addButton({
                    id: 'custpage_check_update_opportunity',
                    label: 'Check Portal Opportunity Update',
                    functionName: `autodeskQuote('${suiteletUrlUpdateOpp}', 'opportunity', ${recId})`,
                })
            }

            scriptContext.form.clientScriptModulePath = './ARKA_CUE_AutodeskQuoteFuncs.js'
        }

        if (scriptContext.type == scriptContext.UserEventType.VIEW && rec.type == record.Type.OPPORTUNITY) {
            scriptContext.form.removeButton({
                id: 'createestimate',
            })
        }
    }

    /**
     * Hide SO button using inline html
     *
     * @param {*} scriptContext
     */
    function hideSalesOrderButton(scriptContext) {
        scriptContext.form.removeButton({
            id: 'createsalesord',
        })
        scriptContext.form.removeButton({
            id: 'createcashsale',
        })
        scriptContext.form.removeButton({
            id: 'createinvoice',
        })
    }

    /**
     * Function to check 1yr autodesk new model item
     *
     * @param {*} itemarr
     * @governacen 10 units
     */
    function checkPossible3yrAlternate(itemarr) {
        if (!itemarr.length) return false

        let queryString = `
            SELECT
                i.id
            FROM
                item i
            WHERE
                i.id IN (${itemarr.join(',')})
                AND i.custitem_product_line = ${PROD_AUTODESK} 
                AND i.custitem_autodesk_offering_id IS NOT NULL
                AND i.custitem_autodesk_term_code = '${TERM_CODE.Annual}'
        `

        let resultSet = query.runSuiteQL({
            query: queryString,
        }).results

        //if contain one year new model item
        if (resultSet.length) return true
        else return false
    }

    return {
        beforeLoad: beforeLoad,
    }
})
