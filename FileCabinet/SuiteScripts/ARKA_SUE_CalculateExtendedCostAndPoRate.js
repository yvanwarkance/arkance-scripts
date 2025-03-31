/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'SuiteScripts/BBE_LIB_GenericFunctionsSS2.js', 'N/log', 'N/error', 'N/runtime'], function (
    search,
    BBE_LIB_GenericFunctionsSS2,
    log,
    error,
    runtime
) {
    // jshint ignore:line
    var NUMBER_OF_MONTHS = '12'
    var DEFAULT_EMAIL_AUTHOR = -5 //Damien PINOT
    var govDiscount = 0
    var endUser = ''
    var subsidiary = ''

    /**
     * Calculate estimated extended cost and po rate on Sales Orders and Quote
     *
     * @param {Object} scriptContext
     * @governance 30 Units
     */
    function beforeSubmit(scriptContext) {
        try {
            //CR_GOV
            var currentScript = runtime.getCurrentScript()
            govDiscount = currentScript.getParameter({
                name: 'custscript_gov_discount',
            })
            //log.debug('govDiscount', govDiscount);

            var record = scriptContext.newRecord
            var status = record.getText({
                fieldId: 'status',
            })
        } catch (e) {
            log.error({
                title: 'Get initial Status',
                details: e,
            })

            var status = 'PENDING'
        }

        if (
            (scriptContext.type == scriptContext.UserEventType.CREATE ||
                scriptContext.type == scriptContext.UserEventType.EDIT) &&
            status != 'Billed'
        ) {
            var recordType = record.type
            var itemID
            var calcTerm
            var origTerm
            var extendedCost = 0
            var poExtendedRate = 0
            var itemList = []
            var itemObj
            var itemDetails
            var isAllowedForRounding

            try {
                var numItemLines = record.getLineCount({
                    sublistId: 'item',
                })

                subsidiary = record.getValue('subsidiary')

                for (var i = 0; i < numItemLines; i++) {
                    var rate = record.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i,
                    })

                    origTerm = record.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_swe_contract_item_term_months',
                        line: i,
                    })

                    var calculatedRate = record.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_calculated_rate',
                        line: i,
                    })

                    if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(origTerm)) {
                        itemID = record.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i,
                        })
                        var itemType = record.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemtype',
                            line: i,
                        })

                        if (itemType == 'Group' || itemType == 'EndGroup') {
                        } else {
                            record.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_mirrored_contract_term',
                                value: origTerm,
                                line: i,
                            })
                        }
                        itemList.push(itemID)
                    }

                    if (recordType != 'invoice' || BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(calculatedRate)) {
                        var itemType = record.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemtype',
                            line: i,
                        })

                        if (itemType == 'Group' || itemType == 'EndGroup') {
                        } else {
                            record.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_calculated_rate',
                                value: rate,
                                line: i,
                            })
                        }
                    }
                }

                if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(itemList)) {
                    itemDetails = getItemDetails(itemList) // 10 Units
                }

                if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(itemDetails)) {
                    //CR_GOV Customer
                    endUser = record.getValue('custbody_end_user')
                    subsidiary = record.getValue('subsidiary')

                    for (i = 0; i < numItemLines; i++) {
                        itemID = record.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i,
                        })

                        var productLine = search.lookupFields({
                            type: search.Type.NON_INVENTORY_ITEM,
                            id: itemID,
                            columns: ['custitem_product_line', 'custitem_custom_po_amount'],
                        })

                        var itemDept = record.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'department',
                            line: i,
                        })

                        var poAmountMargin = null

                        if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(productLine)) {
                            poAmountMargin = productLine.custitem_custom_po_amount

                            if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(productLine['custitem_product_line'][0])) {
                                productLine = productLine['custitem_product_line'][0]['text']
                                isAllowedForRounding =
                                    productLine == 'Autodesk' ||
                                    productLine == 'Trimble' ||
                                    productLine == 'Arkance Systems Finland' ||
                                    productLine == 'Bluebeam'
                            } else {
                                isAllowedForRounding = false
                            }
                        } else {
                            isAllowedForRounding = false
                        }

                        origTerm = record.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_swe_contract_item_term_months',
                            line: i,
                        })

                        itemObj = itemDetails[itemID]

                        if (
                            !BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(itemObj) &&
                            !BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(origTerm) &&
                            isNotGroupItem(record, i)
                        ) {
                            var itemPricingType = itemObj.itemPricingType
                            var itemIsDropship = itemObj.isdropshipitem
                            var itemIsSpecialOrder = itemObj.isspecialorderitem

                            if (itemPricingType == 'Monthly' || itemPricingType == 'Annual') {
                                var costEstimateType = record.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'costestimatetype',
                                    line: i,
                                })

                                var estUnitCost = record.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'costestimaterate',
                                    line: i,
                                })

                                var origEstUnitCost = record.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_orig_estimated_cost',
                                    line: i,
                                })

                                var quantity = record.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    line: i,
                                })

                                var poRate = record.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'porate',
                                    line: i,
                                })

                                var origPoRate = record.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_orig_porate',
                                    line: i,
                                })

                                var amount = record.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    line: i,
                                })

                                var discount = record.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_inline_discount',
                                    line: i,
                                })

                                if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(poAmountMargin)) {
                                    log.debug({
                                        title: 'porate + poAmountMargin + origPoRate',
                                        details: poRate + ' + ' + poAmountMargin + ' + ' + origPoRate,
                                    })

                                    if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(discount)) {
                                        var appliedDiscount = (100 - discount) / 100
                                        amount = amount / appliedDiscount
                                    }

                                    poRate = (amount * (Number.parseFloat(poAmountMargin) / 100)) / quantity
                                    estUnitCost = poRate

                                    origPoRate = null
                                    origEstUnitCost = null

                                    log.debug({
                                        title: 'estUnitCost',
                                        details: estUnitCost,
                                    })
                                }

                                var itemRates = setOrigEstimatedCostAndPoRate(
                                    record,
                                    recordType,
                                    i,
                                    itemIsDropship,
                                    itemIsSpecialOrder,
                                    itemPricingType,
                                    origEstUnitCost,
                                    estUnitCost,
                                    origPoRate,
                                    poRate,
                                    quantity,
                                    origTerm,
                                    extendedCost,
                                    poExtendedRate,
                                    isAllowedForRounding,
                                    itemID,
                                    itemDept,
                                    poAmountMargin
                                )

                                if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(costEstimateType)) {
                                    log.debug('costEstimateType', costEstimateType)
                                    if (costEstimateType != 'CUSTOM') {
                                        if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(itemRates[i].extendedCost)) {
                                            record.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'costestimate',
                                                value: itemRates[i].extendedCost,
                                                line: i,
                                            })
                                        } else {
                                            record.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'costestimate',
                                                value: 0,
                                                line: i,
                                            })
                                        }
                                    }
                                }

                                log.debug('itemRates[i].poExtendedRate', itemRates[i].poExtendedRate)
                                if (
                                    !BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(itemRates[i].poExtendedRate) &&
                                    !isNaN(itemRates[i].poExtendedRate) &&
                                    recordType == 'salesorder'
                                ) {
                                    /*record.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'costestimatetype',
                                        value: 'CUSTOM',
                                        line: i
                                    });*/

                                    record.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'porate',
                                        value: itemRates[i].poExtendedRate,
                                        line: i,
                                    })
                                } else {
                                    record.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'porate',
                                        value: 0,
                                        line: i,
                                    })
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                // 20 Units
                BBE_LIB_GenericFunctionsSS2.logError({
                    err: e,
                    title: 'An Error has occured: Unable to calculate extended cost and po rate.',
                    emailAuthorId: DEFAULT_EMAIL_AUTHOR,
                })

                throw error.create({
                    name: 'CALC_COST_RATE_ERR_CODE',
                    message: e,
                    notifyOff: true,
                })
            }
        }
    }

    /**
     * Identify if the item is a group item.
     *
     * @governance 0 Unit
     *
     * @param {TransactionRecord} transactionRecord
     * @param {int} line
     * @returns true if the line is not a group item (start or end group)
     */
    function isNotGroupItem(transactionRecord, line) {
        var itemType = transactionRecord.getSublistValue({
            sublistId: 'item',
            fieldId: 'itemtype',
            line: line,
        })
        return itemType != 'Group' || itemType != 'EndGroup'
    }

    /**
     * This function will set the original estimated unit cost and original po rate if empty and calculate the extended cost and po rate.
     *
     * @param {object} record: record object (transaction) being modified
     * @param {string} recordType: type of transaction
     * @param {integer} linenum: line number of the transaction being modified
     * @param {boolean} itemIsDropship: if item is checked dropship
     * @param {boolean} itemIsSpecialOrder: if item is checked special order
     * @param {string} itemPricingType: pricing type of the item (annual/monthly)
     * @param {decimal} origEstUnitCost: original estimated cost of the line item
     * @param {decimal} estUnitCost: calculated estimated cost of the line item
     * @param {decimal} origPoRate: original po rate of the line item
     * @param {decimal} poRate: calculated po rate of the line item
     * @param {decimal} quantity: quantity of item
     * @param {integer} term: number of contract terms of the item
     * @param {decimal} extendedCost: calculated extended cost of the line item
     * @param {decimal} poExtendedRate: calculated extended po rate of the line item
     * @returns {array} an array of rates
     * @governance 0 Units
     */
    function setOrigEstimatedCostAndPoRate(
        record,
        recordType,
        linenum,
        itemIsDropship,
        itemIsSpecialOrder,
        itemPricingType,
        origEstUnitCost,
        estUnitCost,
        origPoRate,
        poRate,
        quantity,
        origTerm,
        extendedCost,
        poExtendedRate,
        isAllowedForRounding,
        itemID,
        itemDept,
        poAmountMargin
    ) {
        //CR_GOV
        var GOVERNMENT_ID = '8'
        var isGov = false
        var normalPoRate = poRate

        var customer = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: endUser,
            columns: ['custentity1'],
        })

        if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(customer['custentity1'])) {
            var industryList = customer['custentity1']
            for (var index = 0; index < industryList.length && !isGov; index++) {
                isGov = industryList[index].value == GOVERNMENT_ID
            }
        }

        if (poRate && !isNaN(poRate) && isGov && (recordType == 'estimate' || recordType === 'salesorder')) {
            //Fetch base price as porate to calculate discount gov
            //load base price for sku
            var basePriceObj = search.lookupFields({
                type: search.Type.NON_INVENTORY_ITEM,
                id: itemID,
                columns: ['baseprice'],
            })

            poRate = basePriceObj.baseprice
            /*if(poRate && typeof poRate == 'string')
            {
                poRate = parseFloat(poRate);
            }*/
        }

        //Update Term:
        if (isAllowedForRounding || itemDept == 21 || itemDept == 41) {
            calcTerm = Math.ceil(origTerm)
        } else {
            calcTerm = origTerm
        }

        if (BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(origEstUnitCost)) {
            if (itemPricingType == 'Annual') {
                extendedCost = estUnitCost * quantity * (calcTerm / NUMBER_OF_MONTHS)
            } else if (itemPricingType == 'Monthly') {
                extendedCost = estUnitCost * quantity * calcTerm
            }

            record.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_orig_estimated_cost',
                value: estUnitCost,
                line: linenum,
            })
        } else {
            if (itemPricingType == 'Annual') {
                extendedCost = origEstUnitCost * quantity * (calcTerm / NUMBER_OF_MONTHS)
            } else if (itemPricingType == 'Monthly') {
                extendedCost = origEstUnitCost * quantity * calcTerm
            }
        }

        if (recordType === 'salesorder' || recordType === 'estimate' || recordType === 'opportunity') {
            if (isAllowedForRounding || itemDept == 21 || itemDept == 41) {
                recalculateAmount(
                    record,
                    linenum,
                    calcTerm,
                    origTerm,
                    quantity,
                    poAmountMargin,
                    poRate,
                    extendedCost,
                    normalPoRate
                )
            }

            if (itemIsDropship == true || itemIsSpecialOrder == true) {
                //Populate original PO Rate if empty or null
                if (BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(origPoRate)) {
                    if (itemPricingType == 'Annual') {
                        poExtendedRate = poRate * (calcTerm / NUMBER_OF_MONTHS)
                    } else if (itemPricingType == 'Monthly') {
                        poExtendedRate = poRate * calcTerm
                    }

                    if (normalPoRate) {
                        record.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_orig_porate',
                            value: normalPoRate, //CR_GOV poRate
                            line: linenum,
                        })
                    }
                } else {
                    if (itemPricingType == 'Annual') {
                        poExtendedRate = origPoRate * (calcTerm / NUMBER_OF_MONTHS)
                    } else if (itemPricingType == 'Monthly') {
                        poExtendedRate = origPoRate * calcTerm
                    }
                }

                //CR_GOV Changes
                if (recordType === 'salesorder' && (subsidiary == '3' || subsidiary == '12')) {
                    if (isGov) {
                        //log.debug('govDiscount', govDiscount + '--' + poExtendedRate);
                        var govPoRate = (poExtendedRate * (100 - govDiscount)) / 100
                        govPoRate = govPoRate.toFixed(2)
                        poExtendedRate = govPoRate
                        //log.debug('GOV PO RATE', govPoRate);
                    }
                }
            }
        }

        log.debug({
            title: 'PO values:',
            details:
                'poExtendedRate: ' +
                poExtendedRate +
                ' , origPoRate: ' +
                origPoRate +
                ', extendedCost: ' +
                extendedCost,
        })

        var ratesObj = {}

        ratesObj[linenum] = {
            origPoRate: origPoRate,
            poExtendedRate: poExtendedRate,
            extendedCost: extendedCost,
        }

        return ratesObj
    }

    /**
     * This function will search for Item Details based on Item IDs of the List of Items
     *
     * @param {array} itemList: list of ids of the items
     * @returns {Object} an object with all the item details needed for calculations
     * @governance 10 Units
     */
    function getItemDetails(itemList) {
        var itemSearchObj = search.create({
            type: 'item',
            filters: [['internalid', 'anyof', itemList], 'AND', ['custitem_autodesk_offering_id', 'isempty', '']],
            columns: [
                search.createColumn({
                    name: 'custitem_item_pricing_type',
                }),
                search.createColumn({
                    name: 'isdropshipitem',
                }),
                search.createColumn({
                    name: 'isspecialorderitem',
                }),
            ],
        })

        var options = {
            search: itemSearchObj,
        }

        itemSearchObj = BBE_LIB_GenericFunctionsSS2.getAllSearchResults(options) //@governance 10 Units

        var itemObj = {}
        for (var i = 0; i < itemSearchObj.length; i++) {
            itemObj[itemSearchObj[i].id] = {
                itemPricingType: itemSearchObj[i].getText('custitem_item_pricing_type'),
                isdropshipitem: itemSearchObj[i].getValue('isdropshipitem'),
                isspecialorderitem: itemSearchObj[i].getValue('isspecialorderitem'),
            }
        }
        return itemObj
    }
    /**
     * This function recalculates the amount based on the newly rounded 'term' value using the
     * following formula: amount = listRate * term * appliedDiscount * quantity.
     * where:
     *     appliedDiscount = (100 - inlineDiscount)/100
     *
     * @governance : 0 units
     *
     * @param {record} record - contains the current record as a record object
     * @param {Integer} linenum - the current item sublist line number
     * @param {Integer} term - the rounded term
     * @param {Integer} quantity - quantity sold for this particular line
     */
    function recalculateAmount(
        record,
        linenum,
        calcTerm,
        origTerm,
        quantity,
        poAmountMargin,
        poRate,
        extendedCost,
        normalPoRate
    ) {
        var listRate = record.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_list_rate',
            line: linenum,
        })

        var discount = record.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_inline_discount',
            line: linenum,
        })

        var appliedDiscount = (100 - discount) / 100
        var amount = listRate * calcTerm * appliedDiscount * quantity
        var calRate = (amount / quantity).toFixed(2)
        amount = calRate * quantity

        if (calcTerm != origTerm) {
            record.setSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                value: amount,
                line: linenum,
            })

            if (!BBE_LIB_GenericFunctionsSS2.isNullOrEmpty(poAmountMargin)) {
                record.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'porate',
                    value: ((amount / appliedDiscount) * (Number.parseFloat(poAmountMargin) / 100)) / quantity,
                    line: linenum,
                })

                poRate = ((amount / appliedDiscount) * (Number.parseFloat(poAmountMargin) / 100)) / quantity
                extendedCost = ((amount / appliedDiscount) * (Number.parseFloat(poAmountMargin) / 100)) / quantity
                normalPoRate = poRate

                log.debug({
                    title: 'recalculateAmount',
                    details:
                        'porate: ' + poRate + ', poAmountMargin: ' + poAmountMargin + ', extendedCost: ' + extendedCost,
                })
            }
        } else {
            amount = record.getSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                line: linenum,
            })
        }

        if (appliedDiscount != 1) {
            record.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_disc_amt',
                value: (listRate * discount).toFixed(3),
                line: linenum,
            })
        }

        record.setSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_calculated_rate',
            value: calRate,
            line: linenum,
        })

        record.setSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_mirrored_contract_term',
            value: calcTerm,
            line: linenum,
        })
    }

    return {
        beforeSubmit: beforeSubmit,
    }
})
