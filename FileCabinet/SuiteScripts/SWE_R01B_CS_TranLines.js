/**
 * � 2014 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * This script is a compilation of all the R01 CS scripts used for validation and
 * automatic field population for the lines items
 *
 * @author Adriel Tipoe (atipoe)
 * @author Carlo Abiog (mabiog)
 * @author Chris Camacho (ccamacho)
 *
 * @version 1.0
 */
var SWE = SWE || {}
SWE.R01B = SWE.R01B || {}
SWE.R01B.CS = SWE.R01B.CS || {}
SWE.R01B.CS.TranLines = SWE.R01B.CS.TranLines || {}

/**
 * GLOBAL VARIABLES
 */
if (!SWE.R01B.CS.TranLines.Variables)
    SWE.R01B.CS.TranLines.Variables = {
        // This variable is used by the CS_resetTranLines function to skip the alerts made by the validate line on resets.
        bSKIP_EMPTY_RESET_DATA_ALERT: false,
        // Used so Custom Blocking doesn't go into endless loop
        CUSTOM_PRICE_CHECK_DONE: false,
        CUSTOM_PRICE_CHECK_ITERATION: 0,
        // This variable stores all M/S Types
        MS_TYPE_DATA: null,
        // This keeps track if the Save Alert message of Item Group processing has been shown
        bItemGroupMsgShown: false,
        //Get Parameters
        isR01ACSEnabled: SWE.Parameters.isR01ACSEnabled() == 'T',
        isR01CCSEnabled: SWE.Parameters.isR01CCSEnabled() == 'T',
        isR01DCSEnabled: SWE.Parameters.isR01DCSEnabled() == 'T',
        arrTermCat: SWE.Renewals.Library.splitList(SWE.Renewals.Library.Constants.ITEMCATS_FOR_TERM),
        arrMaintCat: SWE.Renewals.Library.splitList(SWE.Renewals.Library.Constants.ITEMCATS_FOR_MAINTENANCE),
        arrSupportCat: SWE.Renewals.Library.splitList(SWE.Renewals.Library.Constants.ITEMCATS_FOR_SUPPORT),
        arrPerpCat: SWE.Renewals.Library.splitList(SWE.Renewals.Library.Constants.ITEMCATS_FOR_PERPETUAL),
        MS_MODEL: SWE.Parameters.getRenewalMSModel(),
        arrLimitCat: SWE.Renewals.Library.splitList(SWE.Parameters.getCustomLimits()),
        DFLT_CUST_DISC_ON_TRAN_LINE: SWE.Parameters.getTranDiscountFlag() == 'T',
        MS_CUST_INLINE_DISC: SWE.Parameters.getInlineDiscountFlag() == 'T',
        ALLOW_DISCOUNT: SWE.Parameters.getDiscountFlag() == 'T',
        //ITEM_COMMIT_LIMIT : SWE.Parameters.getLineLimit(),
        arrItemCatsToProcess: SWE.Renewals.Library.splitList(SWE.Parameters.getItemCatsForTranLineAuto()),
        arrSupportBasisCat: SWE.Renewals.Library.splitList(SWE.Renewals.Library.Constants.ITEMCATS_FOR_SUPPORT_BASIS),
        arrMaintenanceBasisCat: SWE.Renewals.Library.splitList(
            SWE.Renewals.Library.Constants.ITEMCATS_FOR_MAINTENANCE_BASIS
        ),
        arrRenewalsCat: SWE.Renewals.Library.splitList(SWE.Parameters.getItemCategoriesForRenewal()),
        isRevRecOn: SWE.Library.misc.getSWEPreference('feature', 'revenuerecognition'),
        NUMBER_OF_PREFERRED_DECIMAL: 4, //Global variable used to instantiate the number of preferred decimal places
        DECIMAL_PLACES_LISTRATE: SWE.Parameters.getDecimalPlacesForListrate(),
        DECIMAL_PLACES_RATE: SWE.Parameters.getDecimalPlacesForRate(),
        ENABLE_FLEXIBLE_START: SWE.Parameters.getEnableFlexibleStartDate(),
        NUMBER_OF_CONTRACT_TERM_DECIMAL: 3, //Global variable used to instantiate the number of preferred decimal places for contract item term
        flOrigRate: null,
        flOrigListRate: null,
        isQuantityPricingOn: nlapiGetContext().getSetting('FEATURE', 'QUANTITYPRICING'),
        arrOrigQuantity: new Array(), // This is used for checking if the item quantity has changed (only used if Quantity Pricing is on)
        createdFromRecType: null,
        currentDate: nlapiDateToString(new Date()),
        origItemsCount: 0,
    }

SWE.R01B.CS.TranLines.Variables.DECIMAL_PLACES_LISTRATE =
    SWE.Library.misc.isUndefinedNullOrEmpty(SWE.R01B.CS.TranLines.Variables.DECIMAL_PLACES_LISTRATE) ||
    parseInt(SWE.R01B.CS.TranLines.Variables.DECIMAL_PLACES_LISTRATE) < 0
        ? SWE.R01B.CS.TranLines.Variables.NUMBER_OF_PREFERRED_DECIMAL
        : parseInt(SWE.R01B.CS.TranLines.Variables.DECIMAL_PLACES_LISTRATE)
SWE.R01B.CS.TranLines.Variables.DECIMAL_PLACES_RATE =
    SWE.Library.misc.isUndefinedNullOrEmpty(SWE.R01B.CS.TranLines.Variables.DECIMAL_PLACES_RATE) ||
    parseInt(SWE.R01B.CS.TranLines.Variables.DECIMAL_PLACES_RATE) < 0
        ? SWE.R01B.CS.TranLines.Variables.NUMBER_OF_PREFERRED_DECIMAL
        : parseInt(SWE.R01B.CS.TranLines.Variables.DECIMAL_PLACES_RATE)

SWE.R01B.CS.TranLines.pageInit = function () {
    return SWE.R01B.CS.TranLines.pageInit_TranLines()
}

SWE.R01B.CS.TranLines.saveRecord = function () {
    return SWE.R01B.CS.TranLines.saveRecord_TranLines()
}

SWE.R01B.CS.TranLines.fieldChanged = function (stListName, stFieldName, iLineIndex) {
    return SWE.R01B.CS.TranLines.fieldChanged_TranLines(stListName, stFieldName, iLineIndex)
}

SWE.R01B.CS.TranLines.postSourcing = function (stListName, stFieldName) {
    return SWE.R01B.CS.TranLines.postSourcing_TranLines(stListName, stFieldName)
}

SWE.R01B.CS.TranLines.lineInit = function (stListName) {
    return SWE.R01B.CS.TranLines.lineInit_TranLines(stListName)
}

SWE.R01B.CS.TranLines.validateLine = function (stListName) {
    return SWE.R01B.CS.TranLines.validateLine_TranLines(stListName)
}

SWE.R01B.CS.TranLines.validateDelete = function (type) {
    return SWE.R01B.CS.TranLines.validateDelete_TranLines(type)
}

SWE.R01B.CS.TranLines.recalc = function (stType, stAction) {
    return SWE.R01B.CS.TranLines.recalc_TranLines(stType, stAction)
}

SWE.R01B.CS.TranLines.pageInit_TranLines = function () {
    var globalVar = SWE.R01B.CS.TranLines.Variables
    /******************** SWE_R01C_CS_RateCalculation.js - pageInit_DisableLineItemFields ********************/
    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    if (globalVar.isR01CCSEnabled) {
        nlapiSetLineItemDisabled('item', 'amount', true)
        nlapiSetLineItemDisabled('item', 'custcol_list_rate', true)
    }

    /******************** SWE_R01D_CS_InlineDiscount.js - pageInit_enableDiscountField ********************/
    if (globalVar.isR01DCSEnabled) {
        nlapiSetLineItemDisabled('item', 'custcol_inline_discount', !globalVar.ALLOW_DISCOUNT)
    }

    // get original items count
    globalVar.origItemsCount = nlapiGetLineItemCount('item')
}

SWE.R01B.CS.TranLines.fieldChanged_TranLines = function (stListName, stFieldName, iLineIndex) {
    var globalVar = SWE.R01B.CS.TranLines.Variables
    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    //for fieldChanged event
    var arrFieldChangeHandlers = {
        item: SWE.R01B.CS.TranLines.itemFieldChangeHandler,
        price: SWE.R01B.CS.TranLines.priceFieldChangeHandler,
        custcol_list_rate: SWE.R01B.CS.TranLines.listRateFieldChangeHandler,
        custcol_swe_contract_item_term_months: SWE.R01B.CS.TranLines.contractItemTermFieldChangeHandler,
        custcol_swe_contract_start_date: SWE.R01B.CS.TranLines.contractStartDateFieldChangeHandler,
        custcol_swe_contract_end_date: SWE.R01B.CS.TranLines.contractEndDateFieldChangeHandler,
        quantity: SWE.R01B.CS.TranLines.quantityFieldChangeHandler,
    }

    if (!SWE.Library.misc.isUndefinedNullOrEmpty(arrFieldChangeHandlers[stFieldName])) {
        if (globalVar.isR01CCSEnabled) {
            var tranLine = new TranLine(iLineIndex)
            var handler = arrFieldChangeHandlers[stFieldName]
            var result = handler(stListName, iLineIndex, tranLine)
            if (result == false) {
                return false
            }
        }
    }
}

SWE.R01B.CS.TranLines.saveRecord_TranLines = function () {
    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables
    var logger = new SWE.Renewals.Library.Logger(true)

    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    //RMA Validation
    if (SWE.Renewals.Library.isRecordTypeRMA() && !SWE.R01B.CS.TranLines.validateRMATranLines()) {
        return false
    }

    /******************** SWE_R01C_CS_RateCalculation.js - saveRecord_ValidateTranLines ********************/
    if (globalVar.isR01CCSEnabled) {
        var iItemsRecommitted = 0

        // Get Tran Start & End Dates
        var arrTranDates = SWE.Renewals.Library.getTranDates()
        var stTranStartDt = arrTranDates[0]
        var stTranEndDt = arrTranDates[1]

        // Go through the tran lines
        var bIsItemGroup = false
        var iItemGroupLineCnt = 0
        var tranLineItemCount = 0
        var displayRecalcMessage = false

        for (var idx = 1; idx <= nlapiGetLineItemCount('item'); idx++) {
            var tranLine = new TranLine(idx)

            // Make sure that tran line has a list rate.
            var stItemType = tranLine.getItemType()
            if (!tranLine.isItemTypeProcessable()) {
                if (stItemType == 'Group') {
                    bIsItemGroup = true
                    iItemGroupLineCnt = SWE.R01B.CS.TranLines.CS_CountItemGroupLines(idx, tranLine)
                }
                if (stItemType == 'EndGroup') {
                    bIsItemGroup = false
                }
                continue
            }

            tranLineItemCount++

            //var stItemCat = tranLine.getCategory();
            var bIsProjItem = nlapiGetLineItemValue('item', constants.FLD_IS_PROJECT_ITEM, idx) == 'T'

            // If there's an item group, loop through the item's and trigger the codes again.
            if (bIsItemGroup || bIsProjItem) {
                /*if (iItemsRecommitted >= ITEM_COMMIT_LIMIT) {
                    alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[12], (iItemGroupLineCnt - ITEM_COMMIT_LIMIT), ITEM_COMMIT_LIMIT, ITEM_COMMIT_LIMIT));
                    return false;
                }*/

                var flCurListRate = tranLine.getListRate()
                if (SWE.Library.misc.isUndefinedNullOrEmpty(flCurListRate)) {
                    /*if (!globalVar.bItemGroupMsgShown) {
                        if (iItemGroupLineCnt > ITEM_COMMIT_LIMIT) {
                            alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[13], iItemGroupLineCnt, ITEM_COMMIT_LIMIT, ITEM_COMMIT_LIMIT));
                            globalVar.bItemGroupMsgShown = true;
                        }
                    }*/
                    nlapiSelectLineItem('item', idx)
                    SWE.R01B.CS.TranLines.setMSValueManually(idx, tranLine)
                    nlapiCommitLineItem('item')

                    // Keep track of last recommitted item
                    iItemsRecommitted++
                } //end if
            } else {
                //this 'else' statement is so items in an item group can pass through server side validation with incomplete data.

                // if rate and item category has value but list rate don't have
                // code must trigger the validateLine_TranLines to calculate the list rate
                // Issue 238123
                if (
                    !SWE.Library.misc.isUndefinedNullOrEmpty(
                        nlapiGetLineItemValue('item', 'custcol_item_category', idx)
                    ) &&
                    !SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetLineItemValue('item', 'rate', idx)) &&
                    SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetLineItemValue('item', 'custcol_list_rate', idx))
                ) {
                    nlapiSelectLineItem('item', idx)
                    SWE.R01B.CS.TranLines.setMSValueManually(idx, tranLine)
                    nlapiCommitLineItem('item')
                }

                if (SWE.R01B.CS.TranLines.validateListRate(tranLine, idx) == false) {
                    return false
                }
                if (
                    SWE.R01B.CS.TranLines.validateItemDatesAgainstContractDates(
                        tranLine,
                        stTranStartDt,
                        stTranEndDt,
                        idx
                    ) == false
                ) {
                    return false
                }
                if (SWE.R01B.CS.TranLines.validateItemTermsAndDates(tranLine, idx) == false) {
                    return false
                }
            }

            var MSPricingOption = nlapiGetLineItemValue('item', 'custcol_swv_cr_ms_pricing_option', idx)
            if (SWE.Library.misc.isUndefinedNullOrEmpty(MSPricingOption)) {
                MSPricingOption = globalVar.MS_MODEL
            }

            //Issue 190421: Automatically recalculate Support & Maintenance Item rates
            if (
                MSPricingOption == constants.MS_MODEL_PERCENTAGE ||
                MSPricingOption == constants.MS_MODEL_PERCENTAGE_NET
            ) {
                var oldListRate = tranLine.getListRate()
                if (tranLine.isMaintenanceCategoryType()) {
                    nlapiSelectLineItem('item', idx)
                    //if (SWE.R01B.CS.TranLines.processSupportOrMaintenance(globalVar.arrPerpCat, true) != true) {//globalVar.arrMaintenanceBasisCat
                    if (
                        SWE.R01B.CS.TranLines.processSupportOrMaintenance(globalVar.arrMaintenanceBasisCat, true) !=
                        true
                    ) {
                        return false
                    }
                    if (tranLine.getPrice() == -1) {
                        SWE.R01B.CS.TranLines.updateExtendedRate(tranLine)
                    }
                    nlapiCommitLineItem('item')
                } else if (tranLine.isSupportCategoryType()) {
                    nlapiSelectLineItem('item', idx)
                    if (
                        SWE.R01B.CS.TranLines.processSupportOrMaintenance(globalVar.arrSupportBasisCat, false) != true
                    ) {
                        return false
                    }
                    if (tranLine.getPrice() == -1) {
                        SWE.R01B.CS.TranLines.updateExtendedRate(tranLine)
                    }
                    nlapiCommitLineItem('item')
                }
                if (oldListRate != tranLine.getListRate() && !displayRecalcMessage) {
                    displayRecalcMessage = true
                }
            }
        } //end for

        //Inform the user that a Support/Maintenance Item's rates were recalculated
        if (displayRecalcMessage) {
            alert(SWE.Library.constants.MSGS_CONSTANTS[1])
        }

        // Issue: 199099 SWV-CR > No need to check rev rec dates and compare to transaction start/end dates
        //Confirm if the user wants to proceed with saving even if rev rec dates don't match the transaction dates
        //if (globalVar.isRevRecOn && SWE.R01B.CS.TranLines.confirmRevRecDatesNotTheSameAsContractDates(stTranStartDt, stTranEndDt) == false) {
        //    return false;
        //}
    }

    return true
}

SWE.R01B.CS.TranLines.lineInit_TranLines = function (stListName) {
    if (stListName != 'item') {
        return true
    }

    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables

    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    /******************** SWE_R01C_CS_RateCalculation.js - lineInit_DisableLineItemFields ********************/
    if (globalVar.isR01CCSEnabled && stListName == 'item') {
        var iLineNo = nlapiGetCurrentLineItemIndex(stListName)
        var tranLine = new TranLine(iLineNo)

        nlapiSetLineItemDisabled('item', 'amount', true)
        SWE.R01B.CS.TranLines.enableListRateFieldOnItemType(tranLine)

        /* Enable/Disable Line Reset based on renewal reset data availability */
        SWE.R01B.CS.TranLines.enableResetRenewalFieldOnResetData(tranLine)

        /* Enable/Disable contract fields based on Order Status and if new record is selected and if record type is invoice */
        var stOrderStatus = nlapiGetFieldValue('orderstatus')
        SWE.R01B.CS.TranLines.enableFieldOnOrderStatus(stOrderStatus, tranLine)

        //nlapiSetLineItemDisabled('item', 'quantity', nlapiGetFieldValue('custbody_order_type') == constants.ORDER_TYPE_RENEWAL);

        if (globalVar.isQuantityPricingOn == 'T') {
            // store the quantity of this line item
            var lineIndex = nlapiGetCurrentLineItemIndex('item')
            var qty = nlapiGetCurrentLineItemValue('item', 'quantity')
            globalVar.arrOrigQuantity[lineIndex] = qty
        }
    }

    var priceLevel = nlapiGetCurrentLineItemValue('item', 'custcol_swe_price_level')
    //If Order Type is not Contract-New, and stOrigPriceLvlHidden is empty, store the current Price Level
    var stOrderType = nlapiGetFieldValue('custbody_order_type')
    var stOrigPriceLvlHidden = nlapiGetCurrentLineItemValue('item', 'custcol_swe_orig_price_level')
    if (stOrderType != constants.ORDER_TYPE_NEW && SWE.Library.misc.isUndefinedNullOrEmpty(stOrigPriceLvlHidden)) {
        var stOrigPrice = nlapiGetCurrentLineItemValue('item', 'price')
        nlapiSetCurrentLineItemValue('item', 'custcol_swe_orig_price_level', stOrigPrice, true, true)
    }
    nlapiLogExecution('DEBUG', 'lineInit_TranLines', 'stOrigPriceLvlHidden: ' + stOrigPriceLvlHidden)
}

SWE.R01B.CS.TranLines.validateLine_TranLines = function (stListName) {
    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables
    var logger = new SWE.Renewals.Library.Logger(true)

    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    var tranLine = new TranLine(null)

    var contractID = nlapiGetFieldValue('custbody_contract_name')
    if (
        SWE.Renewals.Library.isRecordTypeRMA() &&
        SWE.Renewals.Library.itemCategoryRequiresContract(tranLine.getCategory())
    ) {
        if (!(contractID != null && contractID != '' && parseInt(contractID) > 0)) {
            // Issue: 199577 SWV-CR > allow for RMA that does not reference contract
            // alert(SWE.Library.constants.MSGS_CONSTANTS[29]);
            // return false;
            alert(SWE.Library.constants.MSGS_CONSTANTS[51])
        }
    }

    var MSPricingOption = nlapiGetCurrentLineItemValue('item', 'custcol_swv_cr_ms_pricing_option')
    if (SWE.R01B.CS.TranLines.validateRenewalSOAndPerpetualLicenses(tranLine, MSPricingOption) == false) {
        alert(SWE.Library.constants.MSGS_CONSTANTS[38])
        return false
    }

    /******************** SWE_R01A_CS_DefaultStartDates.js - validateLine_defaultRevRecStartDate ********************/
    if (globalVar.isR01ACSEnabled) {
        if (stListName == 'item') {
            var arrTranDates = SWE.Renewals.Library.getTranDates()
            var stStartDate = SWE.Library.misc.isUndefinedNullOrEmpty(arrTranDates[0])
                ? nlapiDateToString(new Date())
                : arrTranDates[0]
            var stEndDate = arrTranDates[1]

            //Dates will not be validated if record type is opportunity
            if (!SWE.Renewals.Library.isRecordTypeOpportunity()) {
                if (tranLine.isProcessableCategoryType()) {
                    if (!SWE.Renewals.Library.isRecordTypeCreditMemo()) {
                        // credit memo has no header start and end dates
                        if (!SWE.R01B.CS.TranLines.isValidTransactionDates(stStartDate, stEndDate)) {
                            return false
                        }
                    }

                    var iTermInMonths = SWE.R01B.CS.TranLines.getTermInMonths()
                    iTermInMonths = SWE.Library.misc.isUndefinedNullOrEmpty(iTermInMonths) ? 12 : iTermInMonths

                    SWE.R01B.CS.TranLines.updateContractItemDateFields(tranLine, stStartDate, stEndDate, iTermInMonths)

                    //validate date ranges for rma
                    if (!SWE.R01B.CS.TranLines.isValidContractItemDates(tranLine, stStartDate, stEndDate)) {
                        return false
                    }
                } else if (
                    tranLine.isPerpetualCategoryType() ||
                    tranLine.isHardwareCategoryType() || // for Perpetual or Hardware item category
                    tranLine.getCategory() == constants.ITEMCAT_TYPE_OTHER
                ) {
                    // Issue 204869 : SWV-CR | Compatibility with VSOE Feature >
                    // Remove auto-population logic of Term and End Date when Item Category = "Other"
                    if (!SWE.R01B.CS.TranLines.isValidTransactionDates(stStartDate, stEndDate)) {
                        return false
                    }
                    SWE.R01B.CS.TranLines.updateContractItemDatesForPerpItem(tranLine, stStartDate)
                    if (!SWE.R01B.CS.TranLines.isValidContractItemDates(tranLine, stStartDate, stEndDate)) {
                        return false
                    }
                }
                // Issue 204869 : SWV-CR | Compatibility with VSOE Feature > Remove auto-population logic of Term and End Date when Item Category = "Other"
                // Removed since the auto-population for the perpetual items and others will just be the same
            } else if (SWE.Renewals.Library.isRecordTypeOpportunity()) {
                var tranTerm = nlapiGetFieldValue('custbody_tran_term_in_months')
                var tranStart = nlapiGetFieldValue('startdate')

                if (SWE.Library.misc.isUndefinedNullOrEmpty(tranTerm)) {
                    tranTerm = 12
                }

                /*if (SWE.Library.misc.isUndefinedNullOrEmpty(tranLine.getContractItemStartDate())) {            		            		
            		
            		var startDate = new Date();
            		var term = tranLine.getItemTermInMonths();
            		
            		if (!tranLine.isPerpetualCategoryType()) {
	            		
            			if(!SWE.Library.misc.isUndefinedNullOrEmpty(tranLine.getContractItemEndDate())){
	            			if (SWE.Library.misc.isUndefinedNullOrEmpty(term)){            			
	                			startDate = SWE.Library.dates.addMonths2(tranTerm * -1, tranLine.getContractItemEndDate());            			
	                		}else{
	                			startDate = SWE.Library.dates.addMonths2(term*-1, tranLine.getContractItemEndDate());
	                		}
	            		}
	            		
	            		tranLine.setItemTermInMonths(tranTerm);	            		
            		}
            		
            		tranLine.setContractItemStartDate(nlapiDateToString(startDate));
            	}
            	else*/
                if (
                    !SWE.Library.misc.isUndefinedNullOrEmpty(tranLine.getContractItemStartDate()) &&
                    SWE.Library.misc.isUndefinedNullOrEmpty(tranLine.getContractItemEndDate())
                ) {
                    var endDate = new Date()
                    var term = tranLine.getItemTermInMonths()
                    var startDate = endDate

                    if (!tranLine.isPerpetualCategoryType()) {
                        if (!SWE.Library.misc.isUndefinedNullOrEmpty(tranLine.getContractItemStartDate())) {
                            startDate = tranLine.getContractItemStartDate()
                        }
                        /*else{
            				tranLine.setContractItemStartDate(startDate);
            			}*/

                        if (SWE.Library.misc.isUndefinedNullOrEmpty(term)) {
                            endDate = SWE.Library.dates.addMonths2(tranTerm, startDate)
                            tranLine.setItemTermInMonths(tranTerm)
                        } else {
                            endDate = SWE.Library.dates.addMonths2(term, startDate)
                        }

                        if (SWE.Library.dates.compare(startDate, tranStart) > -1) {
                            tranLine.setContractItemEndDate(nlapiDateToString(endDate))
                        }
                    }
                } else if (SWE.Library.misc.isUndefinedNullOrEmpty(tranLine.getItemTermInMonths())) {
                    tranLine.setItemTermInMonths(tranTerm)
                }
            }
        }
    }

    /******************** SWE_R01C_CS_RateCalculation.js - validateLine_CalculateRate ********************/
    if (globalVar.isR01CCSEnabled) {
        var constants = SWE.Renewals.Library.Constants

        globalVar.flOrigRate = SWE.Renewals.Library.parseFloatOrZero(nlapiGetCurrentLineItemValue('item', 'rate'))
        globalVar.flOrigListRate = SWE.Renewals.Library.parseFloatOrZero(
            nlapiGetCurrentLineItemValue('item', 'custcol_list_rate')
        )
        var stItemType = tranLine.getItemType()
        var stPriceLevel = tranLine.getPrice()
        var stClassOfSale = nlapiGetFieldValue('custbody_order_type')
        //var stTranType = nlapiGetFieldValue('baserecordtype');

        // Check if the item should be processed.
        var bIsRenewalSO = stClassOfSale == constants.ORDER_TYPE_RENEWAL

        // Check if this machine is the item machine.
        if (stListName != 'item') {
            //do nothing
        } else if (stItemType == 'Group' || stItemType == 'EndGroup') {
            /* Check if the item is an Item Group. */
            //do nothing
        } else if (!tranLine.isItemTypeProcessable()) {
            /* Skip Discounts and Markups */
            //do nothing
        } else {
            // If this is a line reset, check if there is any reset data available.
            if (tranLine.isResetLine()) {
                var stResetData = tranLine.getResetData()
                if (!SWE.Library.misc.isUndefinedNullOrEmpty(stResetData)) {
                    SWE.R01B.CS.TranLines.processResetData(stResetData)
                } else {
                    if (!SWE.R01B.CS.TranLines.Variables.bSKIP_EMPTY_RESET_DATA_ALERT) {
                        if (!confirm(SWE.Library.constants.MSGS_CONSTANTS[8])) {
                            return false
                        }
                    } else {
                        /*
                         * Since the reset is triggered by the CS_resetTranLines function then autocalculation
                         * should not be performed. The function would prompt the users of the tran lines that
                         * were not updated.
                         */
                    }
                }
            } else {
                /* If this is a renewal transaction, disallow manual updates. */
                //Issue#189641
                if (bIsRenewalSO) {
                    //alert(SWE.Library.constants.MSGS_CONSTANTS[9]);
                    //return false;
                    nlapiSetFieldValue('custbody_manual_renewal', 'T', true)
                }

                /* If renewal item, make sure to prompt the user of the implications of changing the line data. */
                if (tranLine.isRenewal() && stPriceLevel != -1) {
                    alert(SWE.Library.constants.MSGS_CONSTANTS[10])
                    return false
                }

                /* Move the rate to the list rate */
                if (!SWE.Library.misc.isUndefinedNullOrEmpty(stPriceLevel)) {
                    var flRate = null
                    var stOldPrice = tranLine.getPrice()
                    var stOrigListRate = tranLine.getExtendedRate()
                    var flListRate = 0
                    var flTermInMonths = 0

                    //                    if (!SWE.Renewals.Library.isRecordTypeInvoice()) {
                    //                    	tranLine.setPrice('-1', false, true);
                    //                    	tranLine.setPrice(stOldPrice, false, true);
                    //                    }

                    /* If Term In Months is needed, retrieve it */
                    if (
                        tranLine.isSupportCategoryType() ||
                        tranLine.isTermCategoryType() ||
                        tranLine.isMaintenanceCategoryType() ||
                        tranLine.isServiceCategoryType()
                    ) {
                        /* Compute for the duration of the license in months if there is any. */
                        flTermInMonths = tranLine.getItemTermInMonths()
                        // If term in months is set, use it. Else, compute for it!
                        if (SWE.Library.misc.isUndefinedNullOrEmpty(flTermInMonths)) {
                            var dtStartDate = tranLine.getContractItemStartDate()
                            var dtEndDate = tranLine.getContractItemEndDate()
                            // Make sure that the start date is provided.
                            flTermInMonths =
                                SWE.Library.misc.isUndefinedNullOrEmpty(dtStartDate) ||
                                SWE.Library.misc.isUndefinedNullOrEmpty(dtEndDate)
                                    ? null
                                    : SWE.Library.dates.dateDiff(dtStartDate, dtEndDate)
                        }
                    }

                    var stItemPricingType = tranLine.getPricingType()
                    /* If Custom Rate is used, List Rate is populated by user, else Extended Rate is Populated */
                    if (stPriceLevel != -1) {
                        if (SWE.Library.misc.isUndefinedNullOrEmpty(flTermInMonths)) {
                            //Issue 276233 invoice > perpetual license.
                            if (SWE.Renewals.Library.isRecordTypeInvoice()) {
                                if (SWE.Library.misc.isUndefinedNullOrEmpty(tranLine.getListRate())) {
                                    //for new entries, assign rate to list rate
                                    tranLine.setListRate(
                                        SWE.Library.misc.getRoundedDec(
                                            tranLine.getExtendedRate(),
                                            globalVar.DECIMAL_PLACES_LISTRATE
                                        ),
                                        true,
                                        true
                                    )
                                } else {
                                    var createdFromId = nlapiGetFieldValue('createdfrom')
                                    if (
                                        !SWE.Library.misc.isUndefinedNullOrEmpty(createdFromId) &&
                                        globalVar.createdFromRecType == null
                                    ) {
                                        //set the global variable so that getTransactionType is only called once
                                        globalVar.createdFromRecType =
                                            SWE.Renewals.Library.getTransactionType(createdFromId)
                                        if (!globalVar.createdFromRecType) {
                                            globalVar.createdFromRecType = 'none'
                                        }
                                    }

                                    if (globalVar.createdFromRecType == 'salesorder') {
                                        //assign list rate to rate (quantity pricing has no effect)
                                        tranLine.setExtendedRate(
                                            SWE.Library.misc.getRoundedDec(
                                                tranLine.getListRate(),
                                                globalVar.DECIMAL_PLACES_LISTRATE
                                            ),
                                            true,
                                            true
                                        )
                                    } else {
                                        //reset price level to update rate (esp. for quantity pricing changes)
                                        nlapiSetCurrentLineItemValue('item', 'price', '-1', false, true)
                                        nlapiSetCurrentLineItemValue('item', 'price', stOldPrice, true, true)
                                        //assign rate to list rate
                                        tranLine.setListRate(
                                            SWE.Library.misc.getRoundedDec(
                                                tranLine.getExtendedRate(),
                                                globalVar.DECIMAL_PLACES_LISTRATE
                                            ),
                                            true,
                                            true
                                        )
                                    }
                                }
                            } else {
                                tranLine.setPrice('-1', false, true)
                                tranLine.setPrice(stOldPrice, true, true)

                                tranLine.setListRate(
                                    SWE.Library.misc.getRoundedDec(
                                        tranLine.getExtendedRate(),
                                        globalVar.DECIMAL_PLACES_LISTRATE
                                    ),
                                    true,
                                    true
                                )
                            }
                        } else {
                            flRate = tranLine.getExtendedRate()

                            if (stItemPricingType == constants.ITEM_PRICING_ANNUAL && stPriceLevel != -1) {
                                flListRate = SWE.Renewals.Library.parseFloatOrZero(flRate / flTermInMonths)
                            } else if (stItemPricingType == constants.ITEM_PRICING_ACTUAL_PRICE) {
                                flListRate = SWE.Renewals.Library.parseFloatOrZero(flRate)
                            } else {
                                flListRate = SWE.Renewals.Library.parseFloatOrZero(flRate * flTermInMonths)
                            }

                            tranLine.setListRate(
                                SWE.Library.misc.getRoundedDec(flListRate, globalVar.DECIMAL_PLACES_LISTRATE),
                                true,
                                true
                            )
                        }
                    } else {
                        flRate = tranLine.getListRate()
                        if (SWE.Library.misc.isUndefinedNullOrEmpty(flRate)) {
                            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stOrigListRate)) {
                                //                              flRate = (stItemPricingType == constants.ITEM_PRICING_ANNUAL && (!tranLine.isPerpetualCategoryType())) ? (Math.round((stOrigListRate / 12) * 10000) / 10000) : stOrigListRate;
                                flRate =
                                    stItemPricingType == constants.ITEM_PRICING_ANNUAL &&
                                    !tranLine.isPerpetualCategoryType()
                                        ? SWE.Library.misc.getRoundedDec(
                                              stOrigListRate / 12,
                                              globalVar.DECIMAL_PLACES_LISTRATE
                                          )
                                        : stOrigListRate
                                tranLine.setListRate(flRate, true, true)
                            }
                        }
                        //Issue 202027 - Change all round off code to 4 decimal places
                        //var extendedRateValue = SWE.Library.misc.isUndefinedNullOrEmpty(flTermInMonths) ? Math.round(flRate * 100000) / 100000 : Math.round((flRate * flTermInMonths)*100000) / 100000;
                        var extendedRateValue = SWE.Library.misc.isUndefinedNullOrEmpty(flTermInMonths)
                            ? SWE.Renewals.Library.parseFloatOrZero(flRate)
                            : SWE.Renewals.Library.parseFloatOrZero(flRate) * flTermInMonths

                        tranLine.setExtendedRate(extendedRateValue, true, true) //round off in updateExtendedRate()
                    }
                }

                //validate list rates whether it's renewal or not
                /* Make sure that start date is provided */
                // Issue 199100: SWV-CR > Remove validation of rev rec dates on line validate
                //if (globalVar.isRevRecOn && (tranLine.isSupportCategoryType() || tranLine.isTermCategoryType() || tranLine.isMaintenanceCategoryType())) {
                //    if (stTranType == 'salesorder' || stTranType == 'invoice' || stTranType == 'creditmemo' || stTranType == 'returnauthorization') {
                //        var dtStartDate = nlapiGetCurrentLineItemValue('item', "revrecstartdate", iLineNo);
                //        if (SWE.Library.misc.isUndefinedNullOrEmpty(dtStartDate)) {
                //            alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[19], iLineNo));
                //            return false;
                //        }
                //    }
                //}

                /*
                 * Exclude Opportunity in processing terms the
                 * computation of rate & listRate is the same
                 * for term and service category type of
                 * items
                 */
                if (tranLine.isTermCategoryType() || tranLine.isServiceCategoryType()) {
                    var iLineNo = nlapiGetCurrentLineItemIndex(stListName)
                    if (SWE.R01B.CS.TranLines.processTermLicense(stListName, iLineNo) != true) {
                        return false
                    }
                } else if (tranLine.isMaintenanceCategoryType()) {
                    //if (SWE.R01B.CS.TranLines.processSupportOrMaintenance(globalVar.arrPerpCat, true) != true) {//globalVar.arrMaintenanceBasisCat
                    if (
                        SWE.R01B.CS.TranLines.processSupportOrMaintenance(globalVar.arrMaintenanceBasisCat, true) !=
                        true
                    ) {
                        //
                        return false
                    }
                } else if (tranLine.isSupportCategoryType()) {
                    if (
                        SWE.R01B.CS.TranLines.processSupportOrMaintenance(globalVar.arrSupportBasisCat, false) != true
                    ) {
                        return false
                    }
                }
            }
        }
    }

    /******************** SWE_R01D_CS_InlineDiscount.js - validateLine_CalculateDiscounts ********************/
    //if (globalVar.isR01DCSEnabled) {
    if (stListName == 'item' && !tranLine.isResetLine() && tranLine.isItemTypeProcessable()) {
        /* Get the discount rate and update Extended rate*/
        SWE.R01B.CS.TranLines.updateExtendedRate(tranLine)
    }
    //}

    /***********************RMA Validations*********************/
    if (
        SWE.Renewals.Library.isRecordTypeRMA() &&
        SWE.Renewals.Library.itemCategoryRequiresContract(tranLine.getCategory()) &&
        nlapiGetFieldValue('custbody_check_log_status') == SWE.Renewals.Library.Constants.CHECK_LOG_STATUS_PENDING
    ) {
        if (!SWE.R01B.CS.TranLines.isValidRMAItem(tranLine, null)) {
            return false
        }
    }

    return true
}

// TODO: refactor - put the internal functions inside this scope
;(function (TranLines, Constants) {
    TranLines.updateRateForServiceCategoryType = function () {
        var _ID = {
            recordType: 'item',
            pricingType: 'custcol_item_pricing_type',
            listRate: 'custcol_list_rate',
            rate: 'rate',
        }

        var itemPricingType = nlapiGetCurrentLineItemValue(_ID.recordType, _ID.pricingType)

        /*
         * if monthly, switch the value of rate and list rate.
         * if annual, rate and list rate is already computed
         */
        if (itemPricingType == Constants.ITEM_PRICING_MONTHLY) {
            var listRate = nlapiGetCurrentLineItemValue(_ID.recordType, _ID.listRate) + ''
            var rate = nlapiGetCurrentLineItemValue(_ID.recordType, _ID.rate) + ''

            nlapiSetCurrentLineItemValue(_ID.recordType, _ID.rate, listRate, true, true)
            nlapiSetCurrentLineItemValue(_ID.recordType, _ID.listRate, rate, true, true)
        }
    }
})(SWE.R01B.CS.TranLines, SWE.Renewals.Library.Constants)

/**
 * This is an internal function for the rate calculation script.
 * This processes the License on the tran line idx that was passed.
 *
 * @param (string) stListName The list name
 * @param (string) iLineIndex The tran line index
 * @author Michael Franz V. Sumulong
 * @version 1.0
 */
SWE.R01B.CS.TranLines.processTermLicense = function (stListName, iLineIndex) {
    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables
    var logger = new SWE.Renewals.Library.Logger(true)

    // Retrieve needed field values
    var dtStartDate = nlapiGetCurrentLineItemValue(stListName, 'custcol_swe_contract_start_date', iLineIndex)
    var dtEndDate = nlapiGetCurrentLineItemValue(stListName, 'custcol_swe_contract_end_date', iLineIndex)
    var stPriceLevel = nlapiGetCurrentLineItemValue(stListName, 'price', iLineIndex)
    var stItemId = nlapiGetCurrentLineItemValue(stListName, 'item', iLineIndex)
    //var stCurrency = nlapiGetFieldValue('currency');
    var stItemPricingType = nlapiGetCurrentLineItemValue('item', 'custcol_item_pricing_type')

    if (globalVar.isQuantityPricingOn == 'T') {
        if (SWE.Renewals.Library.isRecordTypeInvoice()) {
            var createdFromId = nlapiGetFieldValue('createdfrom')
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(createdFromId) && globalVar.createdFromRecType == null) {
                globalVar.createdFromRecType = SWE.Renewals.Library.getTransactionType(createdFromId)
                if (!globalVar.createdFromRecType) {
                    globalVar.createdFromRecType = 'none'
                }
            }
        }
        // if invoice is created from a salesorder, do not clear stored original rates
        if (globalVar.createdFromRecType != 'salesorder') {
            var lineIndex = nlapiGetCurrentLineItemIndex('item')
            var qty = nlapiGetCurrentLineItemValue('item', 'quantity')

            // if quantity has changed, clear stored rates
            if (globalVar.arrOrigQuantity[lineIndex] != qty) {
                globalVar.flOrigRate = null
                globalVar.flOrigListRate = null
            }
        }
    }

    /* Get the Original Rate */
    var flOldRate = null
    if (stPriceLevel == null) {
        flOldRate = SWE.Renewals.Library.getItemRate(stItemId, stPriceLevel)
    } else {
        if (stPriceLevel != -1) {
            var stOldPrice = nlapiGetCurrentLineItemValue('item', 'price')
            if (!SWE.Renewals.Library.isRecordTypeInvoice()) {
                nlapiSetCurrentLineItemValue('item', 'price', '-1', false, true)
                nlapiSetCurrentLineItemValue('item', 'price', stOldPrice, false, true) //DRT - 415685
            }
            flOldRate = nlapiGetCurrentLineItemValue('item', 'rate')

            //Check if Price level Changed>
            var stOrderType = nlapiGetFieldValue('custbody_order_type')
            var stOrigPriceLvlHidden = nlapiGetCurrentLineItemValue('item', 'custcol_swe_orig_price_level')
            if (
                stOrderType != constants.ORDER_TYPE_NEW &&
                !SWE.Library.misc.isUndefinedNullOrEmpty(stOrigPriceLvlHidden)
            ) {
                if (stOrigPriceLvlHidden == stPriceLevel) {
                    var origListRate = nlapiGetCurrentLineItemValue('item', 'custcol_swe_orig_list_rate')

                    nlapiLogExecution(
                        'DEBUG',
                        'processTermLicense',
                        'globalVar.flOrigListRate1:' + globalVar.flOrigListRate
                    )
                    if (!SWE.Library.misc.isUndefinedNullOrEmpty(origListRate)) {
                        globalVar.flOrigListRate = origListRate
                    }
                }
            }

            if (!SWE.Library.misc.isUndefinedNullOrEmpty(globalVar.flOrigListRate)) {
                flOldRate = globalVar.flOrigListRate
                if (stItemPricingType == constants.ITEM_PRICING_ANNUAL) flOldRate = flOldRate * 12
            }
        }
    }
    /* If Item Pricing Type is annual and not custom, convert to monthly rate. */
    if (
        stItemPricingType != constants.ITEM_PRICING_ACTUAL_PRICE &&
        stItemPricingType == constants.ITEM_PRICING_ANNUAL &&
        stPriceLevel != -1
    ) {
        flOldRate = flOldRate / 12
    }
    flOldRate = SWE.Library.misc.getRoundedDec(flOldRate, globalVar.DECIMAL_PLACES_LISTRATE)

    /* Compute for the duration of the license in months. */
    var flTermInMonths = nlapiGetCurrentLineItemValue(stListName, 'custcol_swe_contract_item_term_months', iLineIndex)
    // If term in months is set, use it. Else, compute for it!
    if (SWE.Library.misc.isUndefinedNullOrEmpty(flTermInMonths)) {
        // Make sure that the dates are provided.
        if (
            SWE.Library.misc.isUndefinedNullOrEmpty(dtStartDate) ||
            SWE.Library.misc.isUndefinedNullOrEmpty(dtEndDate)
        ) {
            if (SWE.Renewals.Library.isRecordTypeOpportunity()) {
                return true
            } else {
                var stContractID = nlapiGetFieldValue('custbody_contract_name')
                if (
                    SWE.Renewals.Library.isRecordTypeCreditMemo() &&
                    SWE.Library.misc.isUndefinedNullOrEmpty(stContractID)
                ) {
                    return true
                } else {
                    alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[16], iLineIndex))
                    return false
                }
            }
        }
        flTermInMonths = SWE.Library.dates.dateDiff(dtStartDate, dtEndDate)
    } else if (SWE.Renewals.Library.isRecordTypeOpportunity() && flTermInMonths <= 0) {
        if (
            !SWE.Library.misc.isUndefinedNullOrEmpty(dtStartDate) &&
            !SWE.Library.misc.isUndefinedNullOrEmpty(dtEndDate) &&
            SWE.Library.dates.compare(dtStartDate, dtEndDate) == 1
        ) {
            alert(SWE.Library.constants.MSGS_CONSTANTS[7])
            return false
        } else {
            alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[20], iLineIndex))
            return false
        }
    }

    /* Skip process if Price Level is set to custom */
    if (stPriceLevel == -1) {
        var flCustomRate = nlapiGetCurrentLineItemValue(stListName, 'custcol_list_rate', iLineIndex)

        //BC:  adding 3 zeros of precision
        //Issue 202027 - Change all round off code to 4 decimal places
        //nlapiSetCurrentLineItemValue(stListName, "rate", Math.round(flCustomRate * flTermInMonths *100000)/100000, false,true);
        //nlapiSetCurrentLineItemValue(stListName, "rate", Math.round(flCustomRate * flTermInMonths *10000)/10000, false,true);
        //nlapiSetCurrentLineItemValue(stListName, 'rate', SWE.Renewals.Library.parseFloatOrZero(flCustomRate * flTermInMonths), false,true); //round off in updateExtendedRate()
        // Issue 268985, G/L impact error when updating rev rec start date in invoice.
        // Fix: Use preference, "No. of Decimal Places for Rate"
        var flFinalCustomRate = 0
        if (stItemPricingType == constants.ITEM_PRICING_ACTUAL_PRICE) {
            flFinalCustomRate = SWE.Renewals.Library.parseFloatOrZero(flCustomRate)
        } else {
            flFinalCustomRate = SWE.Renewals.Library.parseFloatOrZero(flCustomRate * flTermInMonths)
        }

        flFinalCustomRate = SWE.Library.misc.getRoundedDec(
            flFinalCustomRate,
            SWE.R01B.CS.TranLines.Variables.DECIMAL_PLACES_RATE
        )
        nlapiSetCurrentLineItemValue(stListName, 'rate', flFinalCustomRate, true, true) //round off in updateExtendedRate()
        return true
    }

    // Compute for new rate.
    //var flNewRate = Math.round(flOldRate * flTermInMonths * 100) / 100;
    //BC: adding 3 zeros of precision
    //Issue 202027 - Change all round off code to 4 decimal places
    //var flNewRate = Math.round(flOldRate * flTermInMonths * 100000) / 100000;
    //var flNewRate = Math.round(flOldRate * flTermInMonths * 10000) / 10000;
    var flNewRate = 0
    if (stItemPricingType == constants.ITEM_PRICING_ACTUAL_PRICE) {
        flNewRate = SWE.Renewals.Library.parseFloatOrZero(flOldRate)

        nlapiSetCurrentLineItemValue(
            stListName,
            'custcol_list_rate',
            SWE.Library.misc.getRoundedDec(flNewRate, globalVar.DECIMAL_PLACES_LISTRATE),
            false,
            true
        )
    } else {
        flNewRate = SWE.Renewals.Library.parseFloatOrZero(flOldRate * flTermInMonths)

        // Set the value for the rate.
        if (flTermInMonths == 0) {
            nlapiSetCurrentLineItemValue(stListName, 'custcol_list_rate', 0, true, true)
        } else {
            //nlapiSetCurrentLineItemValue(stListName, "custcol_list_rate", Math.round(flNewRate / flTermInMonths * 10000)/10000, false, true);
            nlapiSetCurrentLineItemValue(
                stListName,
                'custcol_list_rate',
                SWE.Library.misc.getRoundedDec(flNewRate / flTermInMonths, globalVar.DECIMAL_PLACES_LISTRATE),
                true,
                true
            )
        }
    }

    //BC: adding 3 zeros of precision
    //Issue 202027 - Change all round off code to 4 decimal places
    //nlapiSetCurrentLineItemValue(stListName, "rate", Math.round(flNewRate*100000)/100000, false, true);
    //nlapiSetCurrentLineItemValue(stListName, "rate", Math.round(flNewRate*10000)/10000, false, true);

    if (
        (SWE.Renewals.Library.parseFloatOrZero(globalVar.flOrigRate) !=
            SWE.Renewals.Library.parseFloatOrZero(flNewRate) &&
            SWE.Renewals.Library.isRecordTypeInvoice()) ||
        !SWE.Renewals.Library.isRecordTypeInvoice()
    ) {
        //nlapiSetCurrentLineItemValue(stListName, 'rate', SWE.Renewals.Library.parseFloatOrZero(flNewRate), false, true); //round off in updateExtendedRate()
        // Issue 268985, G/L impact error when updating rev rec start date in invoice.
        // Fix: Use preference, "No. of Decimal Places for Rate"

        nlapiSetCurrentLineItemValue(
            stListName,
            'rate',
            SWE.Library.misc.getRoundedDec(flNewRate, SWE.R01B.CS.TranLines.Variables.DECIMAL_PLACES_RATE),
            true,
            true
        ) //round off in updateExtendedRate()
    }
    return true
}

/**
 * This computes for the amount of the Support/Maintenance item line
 *
 * @param (array) arrBasisCat The list of item categories the support/maintenance item needs to base on
 * @param (boolean) isMaintenance
 * @author Michael Franz V. Sumulong / Adriel Tipoe
 * @version 1.1
 */
SWE.R01B.CS.TranLines.processSupportOrMaintenance = function (arrBasisCat, isMaintenance) {
    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables
    var logger = new SWE.Renewals.Library.Logger(true)

    var stProdLine = nlapiGetCurrentLineItemValue('item', 'custcol_product_line')
    var stPriceLevel = nlapiGetCurrentLineItemValue('item', 'price')
    var stItemId = nlapiGetCurrentLineItemValue('item', 'item')
    var flTermInMonths = nlapiGetCurrentLineItemValue('item', 'custcol_swe_contract_item_term_months')
    //var flItemPricingType = nlapiGetCurrentLineItemValue('item', 'custcol_item_pricing_type'); // issue 263377 mbalmeo
    var stItemPricingType = nlapiGetCurrentLineItemValue('item', 'custcol_item_pricing_type')

    //get M/S Pricing Option on Item Level; if empty, then get the default from preference
    var MSPricingOption = nlapiGetCurrentLineItemValue('item', 'custcol_swv_cr_ms_pricing_option')
    if (SWE.Library.misc.isUndefinedNullOrEmpty(MSPricingOption)) {
        MSPricingOption = globalVar.MS_MODEL
    }

    // Skip process if Price Level is set to custom
    if (stPriceLevel != -1) {
        // Compute for the List Rate
        switch (MSPricingOption) {
            case constants.MS_MODEL_PERCENTAGE:

            case constants.MS_MODEL_PERCENTAGE_NET:
                var flPercentage = nlapiGetCurrentLineItemValue('item', 'custcol_mtce_support_percent')
                if (!SWE.Library.misc.isUndefinedNullOrEmpty(flPercentage)) {
                    flPercentage = flPercentage.replace('%', '')
                    flPercentage = parseFloat(flPercentage)
                } else {
                    // This item might belong to an item group so double check the M/S % value because it doesn't load up for item groups
                    var stMSType = nlapiGetCurrentLineItemValue('item', 'custcol_mtce_support_type')
                    var stMSPercent = null
                    if (!SWE.Library.misc.isUndefinedNullOrEmpty(stMSType)) {
                        // Retrieve M/S Types if not yet retrieved.
                        if (globalVar.MS_TYPE_DATA == null) {
                            globalVar.MS_TYPE_DATA = SWE.Renewals.Library.retrieveMSTypes()
                        }

                        // Find a match for the M/S Type of the item line
                        for (var iMTDidx = 0; iMTDidx < globalVar.MS_TYPE_DATA.length; iMTDidx++) {
                            if (globalVar.MS_TYPE_DATA[iMTDidx].id == stMSType) {
                                stMSPercent = globalVar.MS_TYPE_DATA[iMTDidx].percentage
                                break
                            }
                        }
                        if (!SWE.Library.misc.isUndefinedNullOrEmpty(stMSPercent)) {
                            nlapiSetCurrentLineItemValue(
                                'item',
                                'custcol_mtce_support_percent',
                                stMSPercent,
                                true,
                                true
                            )
                            flPercentage = stMSPercent
                            flPercentage = flPercentage.replace('%', '')
                            flPercentage = parseFloat(flPercentage)
                        } else {
                            flPercentage = 0
                        }
                    }
                }

                // Compute total amount based on M/S Model
                var flTotalAmt = 0
                switch (MSPricingOption) {
                    case constants.MS_MODEL_PERCENTAGE:
                        flTotalAmt = SWE.Renewals.Library.computeTotalAmount(arrBasisCat, stProdLine, stItemPricingType)
                        nlapiSetCurrentLineItemValue('item', 'custcol_swe_ms_basis_amount', flTotalAmt)
                        break
                    case constants.MS_MODEL_PERCENTAGE_NET:
                        flTotalAmt = SWE.Renewals.Library.computeTotalNetAmount(
                            arrBasisCat,
                            stProdLine,
                            stItemPricingType
                        )
                        nlapiSetCurrentLineItemValue('item', 'custcol_swe_ms_basis_amount', flTotalAmt)
                        break
                }

                /** ***********************************************************
                 * @modifiedBy Marco Balmeo
                 * @date Sep 23, 2013
                 * @issue 263377
                 * @reason Update process for Annual Pricing items.
                 */
                /*if( flItemPricingType==constants.ITEM_PRICING_ANNUAL && SWE.Library.misc.isUndefinedNullOrEmpty(flTermInMonths) ) {
                	flTotalAmt = flTotalAmt * 12;
                }*/
                /** ******************************************************** */

                //var flListRate = Math.round(flTotalAmt * flPercentage) / 100;
                var flListRate = (flTotalAmt * flPercentage) / 100

                if (isMaintenance && stItemPricingType != constants.ITEM_PRICING_ACTUAL_PRICE) {
                    flListRate = flListRate / 12
                }

                //flListRate = Math.round(flListRate * 10000) / 10000;
                flListRate = SWE.Library.misc.getRoundedDec(flListRate, globalVar.DECIMAL_PLACES_LISTRATE)

                nlapiSetCurrentLineItemValue('item', 'custcol_list_rate', flListRate, true, true)
                break

            case constants.MS_MODEL_ITEMIZED:
                // Process like License Term
                SWE.R01B.CS.TranLines.processTermLicense('item', nlapiGetCurrentLineItemIndex('item'))
                break
            // for Code Coverage purposes, unreachable code after this line was removed, please see issue 290198.
        }

        if (!SWE.Renewals.Library.isRecordTypeOpportunity()) {
            //Term, startdate, enddate should have been validated/populated by this point
        } else {
            if (SWE.Library.misc.isUndefinedNullOrEmpty(flTermInMonths)) {
                flTermInMonths = 1
            }
        }
    } else {
        if (SWE.Library.misc.isUndefinedNullOrEmpty(flTermInMonths)) {
            flTermInMonths = 1
        }
    }

    // Compute for the Rate
    flListRate = nlapiGetCurrentLineItemValue('item', 'custcol_list_rate')
    //Issue 202027 - Change all round off code to 4 decimal places
    //var flTermAmt = Math.round(flListRate * flTermInMonths * 100000) / 100000;
    //var flTermAmt = Math.round(flListRate * flTermInMonths * 10000) / 10000;
    var flTermAmt = 0
    if (stItemPricingType == constants.ITEM_PRICING_ACTUAL_PRICE) {
        flTermAmt = SWE.Renewals.Library.parseFloatOrZero(flListRate) //round off in updateExtendedRate()
    } else {
        flTermAmt = SWE.Renewals.Library.parseFloatOrZero(flListRate * flTermInMonths) //round off in updateExtendedRate()
    }

    nlapiSetCurrentLineItemValue('item', 'rate', flTermAmt, true, true)

    return true
}

/**
 * This function goes through each tran line and resets the data based on the stored reset data
 */
SWE.R01B.CS.TranLines.CS_resetTranLines = function () {
    var constants = SWE.Renewals.Library.Constants
    var stOldOrderType = nlapiGetFieldValue('custbody_order_type')
    if (stOldOrderType != constants.ORDER_TYPE_RENEWAL && stOldOrderType != constants.ORDER_TYPE_RENEWAL_MANUAL) {
        alert(SWE.Library.constants.MSGS_CONSTANTS[23])
    } else {
        SWE.R01B.CS.TranLines.Variables.bSKIP_EMPTY_RESET_DATA_ALERT = true
        var iTranLineCnt = nlapiGetLineItemCount('item')
        var arrLinesSkipped = new Array()
        for (var x = 1; x <= iTranLineCnt; x++) {
            nlapiSelectLineItem('item', x)
            var stResetData = nlapiGetLineItemValue('item', 'custcol_renewal_reset_data', x)
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stResetData)) {
                nlapiSetCurrentLineItemValue('item', 'custcol_reset_renewal_data', 'T', false, true)
                nlapiCommitLineItem('item')
            } else {
                arrLinesSkipped.push(x)
            }
        }
        if (arrLinesSkipped.length > 0) {
            nlapiSelectNewLineItem('item')
            alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[21], arrLinesSkipped))
        }
        SWE.R01B.CS.TranLines.Variables.bSKIP_EMPTY_RESET_DATA_ALERT = false
    }
}

SWE.R01B.CS.TranLines.recalc_TranLines = function (stType, stAction) {
    var globalVar = SWE.R01B.CS.TranLines.Variables

    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    /******************** SWE_R01C_CS_RateCalculation.js - recalc_PopulateDisplayAmount ********************/
    if (globalVar.isR01CCSEnabled) {
        if (stType == 'item') {
            var iItemLineCnt = nlapiGetLineItemCount('item')
            for (var iLineIdx = 1; iLineIdx <= iItemLineCnt; iLineIdx++) {
                nlapiSetLineItemValue('item', 'custcol_reset_renewal_data', iLineIdx, 'F')
            }
        }
    }
}

/**
 * Retrieves the number of items that need processing
 * @param {Object} iStartIdx
 */
SWE.R01B.CS.TranLines.CS_CountItemGroupLines = function (iStartIdx, tranLine) {
    var constants = SWE.Renewals.Library.Constants
    var iCount = 0
    var bInGroup = false
    var bIsProjItem = false

    if (SWE.Library.misc.isUndefinedNullOrEmpty(iStartIdx)) {
        iStartIdx = 1
    }

    // added by ruel
    if (nlapiGetLineItemCount('item') > 0) {
        bIsProjItem = nlapiGetLineItemValue('item', constants.FLD_IS_PROJECT_ITEM, iStartIdx) == 'T'
    }

    for (var x = iStartIdx; x <= nlapiGetLineItemCount('item'); x++) {
        var stItemType = nlapiGetLineItemValue('item', 'itemtype', x)
        if (!tranLine.isItemTypeProcessable()) {
            if (stItemType == 'Group') {
                bInGroup = true
                continue
            }
            if (stItemType == 'EndGroup') {
                bInGroup = false
                continue
            }
            continue
        }

        if (bInGroup || bIsProjItem) {
            var flCurListRate = nlapiGetLineItemValue('item', 'custcol_list_rate', x)
            if (SWE.Library.misc.isUndefinedNullOrEmpty(flCurListRate)) {
                iCount++
            }
        }
    }
    return iCount
}

SWE.R01B.CS.TranLines.postSourcing_TranLines = function (stListName, stFieldName) {
    var globalVar = SWE.R01B.CS.TranLines.Variables
    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    /******************** SWE_R01C_CS_RateCalculation.js - postSourcing_DisableFields ********************/
    if (globalVar.isR01CCSEnabled) {
        var logger = new SWE.Renewals.Library.Logger(true)

        if (stListName == 'item' && stFieldName == 'item') {
            var stPriceLevel = nlapiGetCurrentLineItemValue(stListName, 'price')
            var stItemType = nlapiGetCurrentLineItemValue('item', 'itemtype')
            var stItemStart = nlapiGetCurrentLineItemValue('item', 'custcol_swe_contract_start_date')

            if (
                stItemType != 'Discount' &&
                stItemType != 'Markup' &&
                stItemType != 'Description' &&
                stItemType != 'Subtotal' &&
                stItemType != 'Payment' &&
                stItemType != 'Group' &&
                stItemType != 'EndGroup' &&
                stItemType != null &&
                stItemType != ''
            ) {
                nlapiSetLineItemDisabled('item', 'rate', true)

                if (stPriceLevel == -1 || stPriceLevel == '') {
                    nlapiSetLineItemDisabled('item', 'custcol_list_rate', false)
                } else {
                    nlapiSetLineItemDisabled('item', 'custcol_list_rate', true)
                }

                // Customer In-line Discounting
                // Default Customer Level discount if turned on
                var stItemCat = nlapiGetCurrentLineItemValue('item', 'custcol_item_category')

                // Do not default if this is an M/S Item and the M/S Customer Inline Discount is set to NO
                if (
                    (SWE.Renewals.Library.searchInList(globalVar.arrMaintCat, stItemCat) ||
                        SWE.Renewals.Library.searchInList(globalVar.arrSupportCat, stItemCat)) &&
                    globalVar.MS_CUST_INLINE_DISC
                ) {
                    SWE.R01B.CS.TranLines.applyDefaultCustomerDiscount()
                } else {
                    if (
                        !(
                            SWE.Renewals.Library.searchInList(globalVar.arrMaintCat, stItemCat) ||
                            SWE.Renewals.Library.searchInList(globalVar.arrSupportCat, stItemCat)
                        ) &&
                        globalVar.DFLT_CUST_DISC_ON_TRAN_LINE
                    ) {
                        SWE.R01B.CS.TranLines.applyDefaultCustomerDiscount()
                    }
                }

                if (SWE.Renewals.Library.isRecordTypeRMA()) {
                    var stContractId = nlapiGetFieldValue('custbody_contract_name')
                    if (!SWE.Library.misc.isUndefinedNullOrEmpty(stContractId)) {
                        var tranLine = new TranLine(null)
                        var flDiscountRate = SWE.R01B.CS.TranLines.getContractItemDiscount(
                            stContractId,
                            tranLine,
                            'custrecord_ci_original_discount',
                            'min'
                        )
                        if (flDiscountRate.indexOf('%') != -1) {
                            nlapiSetCurrentLineItemValue('item', 'custcol_inline_discount', flDiscountRate, false)
                        }
                    }
                }
            }

            // Enable/Disable Line Reset based on renewal reset data availability
            var stResetData = nlapiGetCurrentLineItemValue('item', 'custcol_renewal_reset_data')
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stResetData)) {
                nlapiSetLineItemDisabled('item', 'custcol_reset_renewal_data', false)
            } else {
                nlapiSetLineItemDisabled('item', 'custcol_reset_renewal_data', true)
            }

            // Disable contract and rev. rec. end dates for Perpetual line items.
            var stItemCat = nlapiGetCurrentLineItemValue('item', 'custcol_item_category')
            if (SWE.Renewals.Library.searchInList(globalVar.arrPerpCat, stItemCat)) {
                nlapiSetCurrentLineItemValue('item', 'custcol_swe_contract_item_term_months', '', false)
                nlapiSetLineItemDisabled('item', 'custcol_swe_contract_item_term_months', true)
                nlapiSetCurrentLineItemValue('item', 'custcol_swe_contract_end_date', '', false)
                nlapiSetLineItemDisabled('item', 'custcol_swe_contract_end_date', true)
            } else {
                nlapiSetLineItemDisabled('item', 'custcol_swe_contract_item_term_months', false)
                nlapiSetLineItemDisabled('item', 'custcol_swe_contract_end_date', false)
            }

            if (nlapiGetCurrentLineItemValue('item', 'item') == '') {
                if (!SWE.Renewals.Library.isRecordTypeOpportunity()) {
                    //Quick fix for Issue 215719
                    SWE.R01B.CS.TranLines.clearLineItemFields()
                }
            }
        }
    }
}

SWE.R01B.CS.TranLines.clearLineItemFields = function () {
    nlapiSetCurrentLineItemValue('item', 'description', '', false)
    nlapiSetCurrentLineItemValue('item', 'price', '', false)
    nlapiSetCurrentLineItemValue('item', 'custcol_list_rate', '', false)
    nlapiSetCurrentLineItemValue('item', 'custcol_inline_discount', '', false)
    nlapiSetCurrentLineItemValue('item', 'quantity', '', false)
    nlapiSetCurrentLineItemValue('item', 'custcol_mtce_support_percent', '', false)
    nlapiSetCurrentLineItemValue('item', 'custcol_renewal_reset_data', '', false)
    nlapiSetCurrentLineItemValue('item', 'custcol_reset_renewal_data', '', false)
    nlapiSetCurrentLineItemValue('item', 'custcol_swe_contract_item_term_months', '', false)
    nlapiSetCurrentLineItemValue('item', 'custcol_swe_contract_start_date', '', false)
    nlapiSetCurrentLineItemValue('item', 'custcol_swe_contract_end_date', '', false)
    nlapiSetCurrentLineItemValue('item', 'revrecterminmonths', '', false)
    nlapiSetCurrentLineItemValue('item', 'revrecstartdate', '', false)
    nlapiSetCurrentLineItemValue('item', 'revrecenddate', '', false)
    nlapiSetCurrentLineItemValue('item', 'isclosed', '', false)
}

SWE.R01B.CS.TranLines.applyDefaultCustomerDiscount = function () {
    var bDfltCustDisc = true
    var flCurDiscount = nlapiGetCurrentLineItemValue('item', 'custcol_inline_discount')

    /* Do not defualt if there is already a discount provided */
    if (!SWE.Library.misc.isUndefinedNullOrEmpty(flCurDiscount)) {
        //bDfltCustDisc = false;
        return
    }

    /* Do not defualt if there is no Customer Discount set */
    var flCustDiscount = nlapiGetFieldValue('custbody_swe_customer_discount')
    if (!SWE.Library.misc.isUndefinedNullOrEmpty(flCustDiscount)) {
        flCustDiscount = flCustDiscount.replace('%', '')
        flCustDiscount = parseFloat(flCustDiscount)

        if (isNaN(flCustDiscount)) {
            return
        }
    } else {
        return
    }

    /* Default the discount rate */
    if (bDfltCustDisc) {
        nlapiSetCurrentLineItemValue('item', 'custcol_inline_discount', flCustDiscount)
    }
}

/**
 * Gets the term in months based on record type.
 * @return int The term in months
 * @author Carlo Abiog (mabiog)
 */
SWE.R01B.CS.TranLines.getTermInMonths = function () {
    //    var term;
    //    if(SWE.Renewals.Library.isRecordTypeRefund()){
    //        term = SWE.Library.dates.dateDiff(nlapiGetFieldValue('custbody_swe_rma_header_start_date'), nlapiGetFieldValue('custbody_swe_rma_header_end_date'));
    //    }
    //    else{
    term = nlapiGetFieldValue('custbody_tran_term_in_months')
    //    }

    return term
}

SWE.R01B.CS.TranLines.isValidTransactionDates = function (stStartDate, stEndDate) {
    var iResult = SWE.Library.dates.compare(stStartDate, stEndDate) //make sure it is not greater than transaction end date.
    if (iResult == 1) {
        alert(SWE.Library.messages.getErrorMessage('1'))
        return false
    }
    return true
}

/**
 * Updates contract item-related-date fields
 * @return void
 * @author Chris Camacho (ccamacho)
 */
SWE.R01B.CS.TranLines.updateContractItemDateFields = function (tranLine, start, end, term) {
    var globalVar = SWE.R01B.CS.TranLines.Variables
    var iTermContractItem = tranLine.getItemTermInMonths()
    var stContractStartDate = tranLine.getContractItemStartDate()
    var stContractEndDate = tranLine.getContractItemEndDate()
    var stContractID = nlapiGetFieldValue('custbody_contract_name')

    if (SWE.Renewals.Library.isRecordTypeCreditMemo()) {
        if (SWE.Library.misc.isUndefinedNullOrEmpty(stContractID)) {
            return
        } else {
            start = nlapiGetFieldValue('custbody_swe_contract_start_date')
            end = nlapiGetFieldValue('custbody_swe_contract_end_date')
        }
    }

    // Issue 358706 | mbautista - default dates to dates in contract header
    if (
        SWE.Library.misc.isUndefinedNullOrEmpty(iTermContractItem) &&
        SWE.Library.misc.isUndefinedNullOrEmpty(stContractStartDate) &&
        SWE.Library.misc.isUndefinedNullOrEmpty(stContractEndDate)
    ) {
        tranLine.setItemTermInMonths(term, false)
        tranLine.setContractItemStartDate(start, false)
        tranLine.setContractItemEndDate(end, false)
    } else {
        if (SWE.Library.misc.isUndefinedNullOrEmpty(iTermContractItem)) {
            iTermContractItem = SWE.Library.dates.dateDiff(
                SWE.Library.misc.isUndefinedNullOrEmpty(stContractStartDate) ? start : stContractStartDate,
                SWE.Library.misc.isUndefinedNullOrEmpty(stContractEndDate) ? end : stContractEndDate
            )
            //iTermContractItem = Math.round(iTermContractItem * 1000) / 1000;
            iTermContractItem = SWE.Library.misc.getRoundedDec(
                iTermContractItem,
                globalVar.NUMBER_OF_CONTRACT_TERM_DECIMAL
            )
            tranLine.setItemTermInMonths(iTermContractItem, false)
        }

        if (SWE.Library.misc.isUndefinedNullOrEmpty(stContractStartDate)) {
            tranLine.setContractItemStartDate(start)
        }

        if (SWE.Library.misc.isUndefinedNullOrEmpty(stContractEndDate)) {
            var dtNewDate = SWE.Library.dates.addMonths2(
                tranLine.getItemTermInMonths(),
                nlapiStringToDate(tranLine.getContractItemStartDate())
            )
            tranLine.setContractItemEndDate(nlapiDateToString(dtNewDate), false)
        }
    }
}

SWE.R01B.CS.TranLines.hasOriginalContract = function (orderType) {
    if (orderType == SWE.Renewals.Library.Constants.ORDER_TYPE_UPSELL) {
        return !SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetFieldValue('custbody_swe_previous_contract'))
    }

    return !SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetFieldValue('custbody_swe_from_contract'))
}

/**
 * Checks if line item's dates are valid (contract dates)
 * @return boolean, true if success
 * @author Chris Camacho (ccamacho)
 */
SWE.R01B.CS.TranLines.isValidContractItemDates = function (tranLine, startDate, endDate) {
    stContractStartDate = tranLine.getContractItemStartDate()
    stContractEndDate = tranLine.getContractItemEndDate()
    stContractTerm = tranLine.getItemTermInMonths()
    var stContractID = nlapiGetFieldValue('custbody_contract_name')
    var orderType = nlapiGetFieldValue('custbody_order_type')
    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables

    if (SWE.Renewals.Library.isRecordTypeCreditMemo()) {
        if (!SWE.Library.misc.isUndefinedNullOrEmpty(stContractID)) {
            startDate = nlapiGetFieldValue('custbody_swe_contract_start_date')
            endDate = nlapiGetFieldValue('custbody_swe_contract_end_date')
        } else {
            startDate = null
            endDate = null
        }
    }

    /*Check if term is greater than or equal to zero*/
    if (!SWE.Library.misc.isUndefinedNullOrEmpty(stContractTerm) && parseFloat(stContractTerm) <= 0) {
        alert(SWE.Library.constants.MSGS_CONSTANTS[64])
        return false
    }

    /* Check if line item contract start date is in range with the header's contract start and end date */
    if (
        !SWE.Library.misc.isUndefinedNullOrEmpty(stContractStartDate) &&
        !SWE.Library.misc.isUndefinedNullOrEmpty(startDate)
    ) {
        //Feature: Flexible Start Date
        var isForRenewalContract =
            orderType != constants.ORDER_TYPE_RENEWAL && !SWE.Library.misc.isUndefinedNullOrEmpty(stContractID)
                ? SWE.R01B.CS.TranLines.hasOriginalContract(orderType)
                : false
        var applyFlexibleStart =
            globalVar.ENABLE_FLEXIBLE_START == 'T' &&
            (orderType == constants.ORDER_TYPE_RENEWAL ||
                (orderType == constants.ORDER_TYPE_UPSELL && isForRenewalContract))
        var minStart =
            applyFlexibleStart && SWE.Library.dates.compare(startDate, globalVar.currentDate) > -1
                ? globalVar.currentDate
                : startDate

        if (SWE.Library.dates.inRange(stContractStartDate, minStart, endDate) != true) {
            if (SWE.Library.dates.compare(stContractStartDate, minStart) == -1) {
                alert(
                    SWE.Renewals.Library.isRecordTypeCreditMemo()
                        ? SWE.Library.constants.MSGS_CONSTANTS[47]
                        : applyFlexibleStart
                          ? SWE.Library.constants.MSGS_CONSTANTS[68]
                          : SWE.Library.constants.MSGS_CONSTANTS[2]
                )
            } else {
                alert(
                    SWE.Renewals.Library.isRecordTypeCreditMemo()
                        ? SWE.Library.constants.MSGS_CONSTANTS[48]
                        : SWE.Library.constants.MSGS_CONSTANTS[3]
                )
            }
            return false
        }
    }
    /* Check if line item contract end date is in range with the header's contract start and end date */
    if (
        !SWE.Library.misc.isUndefinedNullOrEmpty(stContractEndDate) &&
        !SWE.Library.misc.isUndefinedNullOrEmpty(endDate)
    ) {
        if (SWE.Library.dates.inRange(stContractEndDate, startDate, endDate) != true) {
            if (SWE.Library.dates.compare(stContractEndDate, startDate) == -1) {
                alert(
                    SWE.Renewals.Library.isRecordTypeCreditMemo()
                        ? SWE.Library.constants.MSGS_CONSTANTS[49]
                        : SWE.Library.constants.MSGS_CONSTANTS[5]
                )
            } else {
                alert(
                    SWE.Renewals.Library.isRecordTypeCreditMemo()
                        ? SWE.Library.constants.MSGS_CONSTANTS[50]
                        : SWE.Library.constants.MSGS_CONSTANTS[6]
                )
            }
            return false
        }
    }
    /* Check if contract item start date is not later than contract item end date */
    if (
        !SWE.Library.misc.isUndefinedNullOrEmpty(stContractStartDate) &&
        !SWE.Library.misc.isUndefinedNullOrEmpty(stContractEndDate)
    ) {
        if (SWE.Library.dates.compare(stContractStartDate, stContractEndDate) == 1) {
            alert(SWE.Library.constants.MSGS_CONSTANTS[7])
            return false
        }
    }

    return true
}

SWE.R01B.CS.TranLines.updateContractItemDatesForPerpItem = function (tranLine, stStartDate) {
    var stContractStartDate = tranLine.getContractItemStartDate()
    var stContractID = nlapiGetFieldValue('custbody_contract_name')

    if (SWE.Renewals.Library.isRecordTypeCreditMemo()) {
        if (SWE.Library.misc.isUndefinedNullOrEmpty(stContractID)) {
            return
        } else {
            stStartDate = nlapiGetFieldValue('custbody_swe_contract_start_date')
        }
    }

    if (SWE.Library.misc.isUndefinedNullOrEmpty(stContractStartDate)) {
        tranLine.setContractItemStartDate(stStartDate)
    }
    tranLine.setContractItemEndDate('', false)
    nlapiSetLineItemDisabled('item', 'custcol_swe_contract_end_date', true)
    tranLine.setItemTermInMonths('', false)
}

/**
 * Apply discount and round off to specified number of decimal places
 */
SWE.R01B.CS.TranLines.updateExtendedRate = function (tranLine) {
    var globalVar = SWE.R01B.CS.TranLines.Variables
    var flExtendedRate = tranLine.getExtendedRate()
    if (!SWE.Library.misc.isUndefinedNullOrEmpty(flExtendedRate) && flExtendedRate != 0) {
        flExtendedRate = parseFloat(flExtendedRate)

        if (globalVar.isR01DCSEnabled && globalVar.ALLOW_DISCOUNT) {
            //Apply discount
            var discountRate = tranLine.getDiscountRate()
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(discountRate)) {
                discountRate = discountRate.replace('%', '')
                discountRate = parseFloat(discountRate)
                discountRate = discountRate / 100

                if (discountRate != 0) {
                    // Apply the discount rate to the extended rate
                    flExtendedRate = flExtendedRate * (1 - discountRate)
                }
            }
        }

        //Round off to specified number of decimal places
        flExtendedRate = SWE.Library.misc.getRoundedDec(flExtendedRate, globalVar.DECIMAL_PLACES_RATE)

        //Issue 276233 removed condition so that it always updates when record type is invoice
        /*if ((globalVar.flOrigRate != flExtendedRate && SWE.Renewals.Library.isRecordTypeInvoice()) || !SWE.Renewals.Library.isRecordTypeInvoice()) {
        	tranLine.setExtendedRate(flExtendedRate, false, true);
        }*/

        tranLine.setExtendedRate(flExtendedRate, true, true)
    }
}

SWE.R01B.CS.TranLines.processResetData = function (stResetData) {
    var arrResetData = stResetData.split(';')
    for (var i = 0; i < arrResetData.length; i++) {
        var arrValuePair = arrResetData[i].split('=')

        nlapiSetCurrentLineItemValue('item', arrValuePair[0], arrValuePair[1], true, true)
    }
}

SWE.R01B.CS.TranLines.itemFieldChangeHandler = function (stListName, iLineIndex, tranLine) {
    if (stListName != 'item') {
        return
    }
    // Fix for Issue 215719
    if (nlapiGetCurrentLineItemValue('item', 'item') != '') {
        SWE.R01B.CS.TranLines.updateRateAndPrice(tranLine)
    }
}

SWE.R01B.CS.TranLines.quantityFieldChangeHandler = function (stListName, iLineIndex, tranLine) {}

SWE.R01B.CS.TranLines.priceFieldChangeHandler = function (stListName, iLineIndex, tranLine) {
    if (stListName != 'item') {
        return
    }

    SWE.R01B.CS.TranLines.updateRateAndPrice(tranLine)

    /* Enable/Disable Rate Fields based on Price Level. */
    //var stPriceLevel = tranLine.getPrice();
    //var stItemType = tranLine.getItemType();
    if (tranLine.isItemTypeProcessable()) {
        nlapiSetLineItemDisabled('item', 'rate', true)
        if (tranLine.getPrice() == -1 || tranLine.getPrice() == '') {
            nlapiSetLineItemDisabled('item', 'custcol_list_rate', false)
        } else {
            nlapiSetLineItemDisabled('item', 'custcol_list_rate', true)
        }
    }
}

SWE.R01B.CS.TranLines.listRateFieldChangeHandler = function (stListName, iLineIndex, tranLine) {
    var globalVar = SWE.R01B.CS.TranLines.Variables
    if (stListName != 'item') {
        return
    }

    var bIsAnnualRate = nlapiGetFieldValue('custbody_custom_price_is_annual_rate') == 'T'

    var flCurListRate = tranLine.getListRate()
    if (flCurListRate.indexOf('.') != -1) {
        /*var iDecIndex = flCurListRate.indexOf("."); //truncates (not rounds) to 4 decimal places!
        iDecIndex = flCurListRate.length - (iDecIndex + 1);
        flCurListRate = flCurListRate.substring( 0, (flCurListRate.indexOf(".") + 1 + (iDecIndex > 3 ? 4 : 3) ));*/
        flCurListRate = SWE.Library.misc.getRoundedDec(flCurListRate, globalVar.DECIMAL_PLACES_LISTRATE)
        tranLine.setListRate(flCurListRate, false, false)
    }

    if (bIsAnnualRate && tranLine.getPrice() == -1) {
        if (tranLine.isItemTypeProcessable()) {
            if (
                tranLine.isTermCategoryType() ||
                tranLine.isMaintenanceCategoryType() ||
                tranLine.isSupportCategoryType()
            ) {
                var flCurListRate = tranLine.getListRate()
                if (!SWE.Library.misc.isUndefinedNullOrEmpty(flCurListRate) && flCurListRate != 0) {
                    //tranLine.setListRate(Math.round(flCurListRate/12*10000)/10000, false, true);
                    tranLine.setListRate(
                        SWE.Library.misc.getRoundedDec(flCurListRate / 12, globalVar.DECIMAL_PLACES_LISTRATE),
                        false,
                        true
                    )
                }
            }
        }
    }
}

SWE.R01B.CS.TranLines.contractItemTermFieldChangeHandler = function (stListName, iLineIndex, tranLine) {
    var globalVar = SWE.R01B.CS.TranLines.Variables
    var iTerm = tranLine.getItemTermInMonths()
    //make sure the term is a valid number
    if (SWE.Library.misc.isUndefinedNullOrEmpty(iTerm) && !SWE.Library.misc.isNumeric(iTerm)) {
        return false
    }

    if (iTerm.indexOf('.') != -1) {
        var iDecIndex = iTerm.indexOf('.')
        iDecIndex = iTerm.length - (iDecIndex + 1)
        iTerm = iTerm.substring(0, iTerm.indexOf('.') + 1 + (iDecIndex > 2 ? 3 : 2))
        tranLine.setItemTermInMonths(iTerm, false)
    }

    var stContractStartDate = tranLine.getContractItemStartDate()

    if (!SWE.Library.misc.isUndefinedNullOrEmpty(stContractStartDate)) {
        var dtNewDate = SWE.Library.dates.addMonths2(iTerm, nlapiStringToDate(stContractStartDate))
        tranLine.setContractItemEndDate(nlapiDateToString(dtNewDate), false)
    } else {
        if (!SWE.Library.misc.isUndefinedNullOrEmpty(tranLine.getContractItemEndDate())) {
            var dtNewDate = SWE.Library.dates.addMonths2(
                tranLine.getItemTermInMonths() * -1,
                nlapiStringToDate(tranLine.getContractItemEndDate())
            )
            tranLine.setContractItemStartDate(nlapiDateToString(dtNewDate), false)

            var newTerm = SWE.Library.dates.dateDiff(dtNewDate, tranLine.getContractItemEndDate())
            newTerm = SWE.Library.misc.getRoundedDec(newTerm, globalVar.NUMBER_OF_CONTRACT_TERM_DECIMAL)
            tranLine.setItemTermInMonths(newTerm, false)
        }
    }
}

SWE.R01B.CS.TranLines.contractStartDateFieldChangeHandler = function (stListName, iLineIndex, tranLine) {
    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables
    var stContractStartDate = tranLine.getContractItemStartDate()

    //Update Contract Item Term
    if (
        tranLine.getCategory() != constants.ITEMCAT_TYPE_LICENSE_PERP &&
        tranLine.getCategory() != constants.ITEMCAT_TYPE_HARDWARE &&
        tranLine.getCategory() != constants.ITEMCAT_TYPE_SERVICES_PERP
    ) {
        var endDate = tranLine.getContractItemEndDate()
        var term = tranLine.getItemTermInMonths()

        if (!SWE.Library.misc.isUndefinedNullOrEmpty(endDate)) {
            term = SWE.Library.misc.getRoundedDec(
                SWE.Library.dates.dateDiff(stContractStartDate, endDate),
                globalVar.NUMBER_OF_CONTRACT_TERM_DECIMAL
            )
            tranLine.setItemTermInMonths(term, false)
        } else {
            var tranEnd = SWE.Renewals.Library.isRecordTypeRMA()
                ? nlapiGetFieldValue('custbody_swe_rma_header_end_date')
                : nlapiGetFieldValue('enddate')
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(term)) {
                tranEnd = nlapiDateToString(SWE.Library.dates.addMonths2(term, nlapiStringToDate(stContractStartDate)))
            } else {
                term = SWE.Library.dates.dateDiff(stContractStartDate, tranEnd)
                tranLine.setItemTermInMonths(
                    SWE.Library.misc.getRoundedDec(term, globalVar.NUMBER_OF_CONTRACT_TERM_DECIMAL),
                    false
                )
            }
            tranLine.setContractItemEndDate(tranEnd, false)
        }
    }
}

SWE.R01B.CS.TranLines.contractEndDateFieldChangeHandler = function (stListName, iLineIndex, tranLine) {
    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables
    var stContractEndDate = tranLine.getContractItemEndDate()

    // Issue 199100: SWV-CR > Remove validation of rev rec dates on line validate
    //if (globalVar.isRevRecOn) {
    //    tranLine.setRevRecEndDate(stContractEndDate, false);
    //}

    /* update contract term in months */
    if (
        tranLine.getCategory() != constants.ITEMCAT_TYPE_LICENSE_PERP &&
        tranLine.getCategory() != constants.ITEMCAT_TYPE_SERVICES_PERP
    ) {
        var stContractStartDate = nlapiGetCurrentLineItemValue('item', 'custcol_swe_contract_start_date')
        if (!SWE.Library.misc.isUndefinedNullOrEmpty(stContractStartDate)) {
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stContractEndDate)) {
                var iTerm = SWE.Library.dates.dateDiff(stContractStartDate, stContractEndDate)
                //iTerm = Math.round(iTerm * 1000)/1000;
                iTerm = SWE.Library.misc.getRoundedDec(iTerm, globalVar.NUMBER_OF_CONTRACT_TERM_DECIMAL)

                tranLine.setItemTermInMonths(iTerm, false)
                // Issue 199100: SWV-CR > Remove validation of rev rec dates on line validate
                //if (globalVar.isRevRecOn) {
                //    tranLine.setRevRecTermInMonths(iTerm, false);
                //}
            }
        } else {
            if (
                !SWE.Library.misc.isUndefinedNullOrEmpty(stContractEndDate) &&
                !SWE.Library.misc.isUndefinedNullOrEmpty(tranLine.getItemTermInMonths())
            ) {
                var dtNewDate = SWE.Library.dates.addMonths2(
                    tranLine.getItemTermInMonths() * -1,
                    nlapiStringToDate(tranLine.getContractItemEndDate())
                )
                tranLine.setContractItemStartDate(nlapiDateToString(dtNewDate), false)

                var newTerm = SWE.Library.dates.dateDiff(dtNewDate, tranLine.getContractItemEndDate())
                //newTerm = Math.round(newTerm * 1000) / 1000;
                newTerm = SWE.Library.misc.getRoundedDec(newTerm, globalVar.NUMBER_OF_CONTRACT_TERM_DECIMAL)

                tranLine.setItemTermInMonths(newTerm, false)

                // Issue 199100: SWV-CR > Remove validation of rev rec dates on line validate
                //if (globalVar.isRevRecOn) {
                //    tranLine.setRevRecStartDate(nlapiDateToString(dtNewDate), false);
                //}
            }
        }
    }
}

SWE.R01B.CS.TranLines.updateRateAndPrice = function (tranLine) {
    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables
    /* Clear the List Rate */
    //tranLine.setListRate('', false, true);
    nlapiSetCurrentLineItemValue('item', 'custcol_list_rate', '', false, true)

    /* Reset the List Price field. */
    var stPriceLevel = tranLine.getPrice()

    //exit if price level does not meet our criteria
    if (SWE.Library.misc.isUndefinedNullOrEmpty(stPriceLevel)) {
        return
    }
    if (stPriceLevel != -1) {
        return
    }

    var isCustomBlocked = nlapiGetFieldValue('custbody_block_custom_price_level') == constants.YES
    var isCustomMSAllowed = nlapiGetFieldValue('custbody_allow_custom_price_lvl_for_ms') == constants.YES

    // Check if the item category needs to be limited
    if (tranLine.isCustomLimitableCategoryType()) {
        if (isCustomBlocked) {
            if (!isCustomMSAllowed) {
                if (!globalVar.CUSTOM_PRICE_CHECK_DONE) {
                    // Mark the variables for the regression loop
                    globalVar.CUSTOM_PRICE_CHECK_DONE = true
                    // Issue 203019
                    //globalVar.CUSTOM_PRICE_CHECK_ITERATION++;
                    tranLine.setPrice(1, true, true)

                    // Reset the variable since the regression is finished
                    globalVar.CUSTOM_PRICE_CHECK_DONE = false
                    globalVar.CUSTOM_PRICE_CHECK_ITERATION = 0
                } else {
                    // Issue 203019
                    // If the regression is 10 levels deep or you've reached the Custom price already,
                    // stop trying and let the custom price level stick, else try other price levels
                    if (globalVar.CUSTOM_PRICE_CHECK_ITERATION <= 10 && tranLine.getPrice() != -1) {
                        globalVar.CUSTOM_PRICE_CHECK_ITERATION++
                        tranLine.setPrice(globalVar.CUSTOM_PRICE_CHECK_ITERATION, true, true)
                    } else {
                        return
                    }
                }
            } else {
                if (!tranLine.isMaintenanceCategoryType() && !tranLine.isSupportCategoryType()) {
                    if (tranLine.getPrice() == '-1') {
                        //(!globalVar.CUSTOM_PRICE_CHECK_DONE) {
                        globalVar.CUSTOM_PRICE_CHECK_DONE = true
                        var nonCustomPriceLevels = [1, 2, 3, 4]
                        var i = 0
                        var priceLevel
                        var hasNonCustomPriceLevel = false

                        while (!hasNonCustomPriceLevel && i < nonCustomPriceLevels.length) {
                            priceLevel = nonCustomPriceLevels[i]
                            tranLine.setPrice(priceLevel, false, true)

                            if (tranLine.getPrice() == priceLevel) {
                                hasNonCustomPriceLevel = true
                            }

                            i++
                        }

                        tranLine.setPrice(hasNonCustomPriceLevel ? priceLevel : -1, hasNonCustomPriceLevel, true)
                    } else {
                        // Reset the variable since this we have no choice.
                        globalVar.CUSTOM_PRICE_CHECK_DONE = false
                        tranLine.setPrice(-1, true, true)
                    }
                }
            }
        }
    }
}

SWE.R01B.CS.TranLines.enableFieldOnOrderStatus = function (stOrderStatus, tranLine) {
    var constants = SWE.Renewals.Library.Constants

    /* Enable/Disable contract fields based on Order Status and if new record is selected and if record type is invoice */
    var dtContractStartDate = tranLine.getContractItemStartDate()

    if (
        (SWE.Renewals.Library.isRecordTypeInvoice() ||
            (SWE.Renewals.Library.isRecordTypeSalesOrder() &&
                (stOrderStatus == constants.SO_STATUS_PENDING_FULFILLMENT ||
                    stOrderStatus == constants.SO_STATUS_BILLED))) &&
        dtContractStartDate != ''
    ) {
        nlapiSetLineItemDisabled('item', 'custcol_swe_contract_item_term_months', true)
        nlapiSetLineItemDisabled('item', 'custcol_swe_contract_start_date', true)
        nlapiSetLineItemDisabled('item', 'custcol_swe_contract_end_date', true)
    } else {
        nlapiSetLineItemDisabled('item', 'custcol_swe_contract_item_term_months', false)
        nlapiSetLineItemDisabled('item', 'custcol_swe_contract_start_date', false)
        nlapiSetLineItemDisabled('item', 'custcol_swe_contract_end_date', false)
    }

    //Disable fields for Perpetual item types
    if (tranLine.isPerpetualCategoryType()) {
        tranLine.setItemTermInMonths('', false)
        nlapiSetLineItemDisabled('item', 'custcol_swe_contract_item_term_months', true)
        tranLine.setContractItemEndDate('', false)
        nlapiSetLineItemDisabled('item', 'custcol_swe_contract_end_date', true)
    }
}

SWE.R01B.CS.TranLines.enableResetRenewalFieldOnResetData = function (tranLine) {
    /* Enable/Disable Line Reset based on renewal reset data availability */
    var stResetData = tranLine.getResetData()
    if (!SWE.Library.misc.isUndefinedNullOrEmpty(stResetData)) {
        nlapiSetLineItemDisabled('item', 'custcol_reset_renewal_data', false)
    } else {
        nlapiSetLineItemDisabled('item', 'custcol_reset_renewal_data', true)
    }
}

SWE.R01B.CS.TranLines.enableListRateFieldOnItemType = function (tranLine) {
    if (tranLine.isItemTypeProcessable()) {
        nlapiSetLineItemDisabled('item', 'rate', true)
        if (tranLine.getPrice() == -1) {
            nlapiSetLineItemDisabled('item', 'custcol_list_rate', false)
        } else {
            nlapiSetLineItemDisabled('item', 'custcol_list_rate', true)
        }
    }
}

SWE.R01B.CS.TranLines.getContractItemDiscount = function (stContractId, tranLine, stFieldName, stGroup) {
    var rmaUrlPrefix = ''
    try {
        var stItemId = tranLine.getItemId()
        var stParameters =
            '&ContractID=' +
            stContractId +
            '&ItemId=' +
            stItemId +
            '&FieldName=' +
            stFieldName +
            '&Group=' +
            stGroup +
            '&Type=getContractItemField'

        rmaUrlPrefix = SWE.Library.misc.getHiddenFieldValue('rmaUrlPrefix')
        rmaUrlPrefix = SWE.Library.misc.isUndefinedNullOrEmpty(rmaUrlPrefix) ? '' : rmaUrlPrefix
        nlapiLogExecution('DEBUG', 'getContractItemDiscount', 'RMA URL Prefix: ' + rmaUrlPrefix)

        var var_url_servlet = nlapiResolveURL(
            'SUITELET',
            'customscript_swe_optimize_suitelet2',
            'customdeploy_swe_optimize_suitelet2',
            true
        )
        nlapiLogExecution(
            'DEBUG',
            'var_url_servlet',
            'Value: ' + var_url_servlet + ' ---- stParameters: ' + stParameters
        )
        var requesturl = var_url_servlet + stParameters

        //ajax call details
        var a = { 'User-Agent-x': 'SuiteScript-Call' }
        /**
         * @Note As tested in dev acct, it doesn't work when you create the object inside nlapiRequestURL
         * e.g. var response = nlapiRequestURL(requesturl, null, {'User-Agent-x':'SuiteScript-Call'}, null);
         */
        var response = nlapiRequestURL(requesturl, null, a, null)
        var stResult = response.getBody()

        return stResult
    } catch (ex) {
        nlapiLogExecution(
            'DEBUG',
            'getContractItemDiscount - error occured',
            'Field Name: ' + stFieldName + ' | Link Prefix: ' + rmaUrlPrefix
        )
        if (ex.getDetails != undefined) {
            nlapiLogExecution('ERROR', ex.getCode() + ' - getContractItemDiscount', ex.getDetails())
        } else {
            nlapiLogExecution('ERROR', 'UNEXPECTED ERROR' + ' - getContractItemDiscount', ex.toString())
        }
    }
}

SWE.R01B.CS.TranLines.isValidRMAItem = function (tranLine, lineNo) {
    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables
    var rmaUrlPrefix = ''
    try {
        /***********************RMA Validations*********************/
        var contractID = nlapiGetFieldValue('custbody_contract_name')
        var stExceptionId = nlapiGetRecordId()
        var flListRate = tranLine.getListRate()
        var stItemId = tranLine.getItemId()
        var iQuantity = tranLine.getQuantity()

        //get M/S Pricing Option on Item Level if lineNo is not null
        var MSPricingOption = globalVar.MS_MODEL
        if (!SWE.Library.misc.isUndefinedNullOrEmpty(lineNo)) {
            var itemMSPricingOption = nlapiGetLineItemValue('item', 'custcol_swv_cr_ms_pricing_option', lineNo)
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(itemMSPricingOption)) {
                MSPricingOption = itemMSPricingOption
            }
        }

        var CHECK_RATE =
            (tranLine.isSupportCategoryType() || tranLine.isMaintenanceCategoryType()) &&
            (MSPricingOption == constants.MS_MODEL_PERCENTAGE || MSPricingOption == constants.MS_MODEL_PERCENTAGE_NET)
                ? 'F'
                : 'T'
        var iOtherQuantity = 0
        var iOtherQuantityTotal = 0
        var bRenewalsExclusion = false
        var itemTerms = tranLine.getItemTermInMonths()
        var itemCategory = tranLine.getCategory()

        if (lineNo == null) {
            bRenewalsExclusion = tranLine.getRenewalsExclusion() == 'T'
            iOtherQuantity = SWE.Renewals.Library.computeItemQuantity(
                stItemId,
                nlapiGetCurrentLineItemIndex('item'),
                flListRate,
                bRenewalsExclusion
            ) // Get Quantity of item in other line items
            iOtherQuantityTotal = SWE.Renewals.Library.computeItemQuantity(
                stItemId,
                nlapiGetCurrentLineItemIndex('item'),
                flListRate,
                true
            ) // disregard list rate
        } else {
            bRenewalsExclusion = nlapiGetLineItemValue('item', 'custcol_renewals_exclusion', lineNo) == 'T'
            iOtherQuantity = SWE.Renewals.Library.computeItemQuantity(stItemId, lineNo, flListRate, bRenewalsExclusion) // Get Quantity of item in other line items
            iOtherQuantityTotal = SWE.Renewals.Library.computeItemQuantity(stItemId, lineNo, flListRate, true) // disregard list rate
        }
        var stParameters =
            '&ContractID=' +
            contractID +
            '&ItemId=' +
            stItemId +
            '&Quantity=' +
            iQuantity +
            '&ListRate=' +
            flListRate +
            '&ExceptionId=' +
            stExceptionId +
            '&CheckRate=' +
            CHECK_RATE +
            '&Terms=' +
            itemTerms +
            '&Type=verifyRMAItem' +
            '&ItemCategory=' +
            itemCategory

        var stOthParameter =
            '&RenewalsExclusion=' +
            bRenewalsExclusion +
            '&OtherQuantity=' +
            parseFloat(iOtherQuantity) +
            '&OtherQuantityTotal=' +
            parseFloat(iOtherQuantityTotal)

        rmaUrlPrefix = SWE.Library.misc.getHiddenFieldValue('rmaUrlPrefix')
        rmaUrlPrefix = SWE.Library.misc.isUndefinedNullOrEmpty(rmaUrlPrefix) ? '' : rmaUrlPrefix
        nlapiLogExecution('DEBUG', 'isValidRMAItem', 'RMA URL Prefix: ' + rmaUrlPrefix)
        var var_url_servlet = nlapiResolveURL(
            'SUITELET',
            'customscript_swe_optimize_suitelet',
            'customdeploy_swe_optimize_suitelet'
        )
        var requesturl = rmaUrlPrefix + var_url_servlet + stParameters + stOthParameter

        //ajax call details
        var a = { 'User-Agent-x': 'SuiteScript-Call' }
        /**
         * @Note As tested in dev acct, it doesn't work when you create the object inside nlapiRequestURL
         * e.g. var response = nlapiRequestURL(requesturl, null, {'User-Agent-x':'SuiteScript-Call'}, null);
         */
        var response = nlapiRequestURL(requesturl, null, a, null)
        var stResult = response.getBody()

        if (!SWE.R01B.CS.TranLines.isValidRMAItemError(stResult, lineNo, bRenewalsExclusion)) {
            return false
        }

        return true
    } catch (ex) {
        nlapiLogExecution(
            'DEBUG',
            'isValidRMAItem - error occured',
            'Field Name: ' +
                '' + //stFieldName
                ' | Link Prefix: ' +
                rmaUrlPrefix
        )
        if (ex.getDetails != undefined) {
            nlapiLogExecution('ERROR', ex.getCode() + ' - isValidRMAItem', ex.getDetails())
        } else {
            nlapiLogExecution('ERROR', 'UNEXPECTED ERROR' + ' - isValidRMAItem', ex.toString())
        }
        return false
    }
}

SWE.R01B.CS.TranLines.isValidRMAItemError = function (stResult, lineNo, bRenewalsExclusion) {
    if (stResult in SWE.Library.constants.MSGS_CONSTANTS) {
        var errMsg = SWE.Library.constants.MSGS_CONSTANTS[stResult]
        alert(lineNo ? SWE.Library.messages.displayMessage(errMsg, lineNo) : errMsg)
        return false
    }

    if (stResult == 'F') {
        //item is not present
        alert(
            lineNo != null
                ? SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[35], lineNo)
                : SWE.Library.constants.MSGS_CONSTANTS[31]
        )
        return false
    }

    if (stResult == 'R' && bRenewalsExclusion == false) {
        //Do not validate rate of rma item if not included for renewal
        alert(
            lineNo != null
                ? SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[36], lineNo)
                : SWE.Library.constants.MSGS_CONSTANTS[32]
        )
        return false
    }

    if (stResult == 'Q') {
        //quantity error
        alert(
            lineNo != null
                ? SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[37], lineNo)
                : SWE.Library.constants.MSGS_CONSTANTS[33]
        )
        return false
    }

    if (stResult == 'M') {
        //terms error
        alert(
            lineNo != null
                ? SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[45], lineNo)
                : SWE.Library.constants.MSGS_CONSTANTS[46]
        )
        return false
    }

    return true
}

SWE.R01B.CS.TranLines.validateRMATranLines = function () {
    var logStatus = nlapiGetFieldValue('custbody_check_log_status')

    if (logStatus != SWE.Renewals.Library.Constants.CHECK_LOG_STATUS_PENDING) {
        //Skip Checking of Contract Items when status is not pending
        return true
    }

    for (var idx = 1; idx <= nlapiGetLineItemCount('item'); idx++) {
        var tranLine = new TranLine(idx)
        var stItemCat = tranLine.getCategory()
        if (SWE.Renewals.Library.itemCategoryRequiresContract(stItemCat)) {
            if (!SWE.R01B.CS.TranLines.isValidRMAItem(tranLine, idx)) {
                return false
            }
        }
    }
    return true
}

//Confirm if the user wants to proceed with saving even if rev rec dates don't match the transaction dates
SWE.R01B.CS.TranLines.confirmRevRecDatesNotTheSameAsContractDates = function (stTranStartDt, stTranEndDt) {
    for (var idx = 1; idx <= nlapiGetLineItemCount('item'); idx++) {
        var tranLine = new TranLine(idx)
        //var stItemCat = tranLine.getCategory();

        if (tranLine.isTermCategoryType() || tranLine.isMaintenanceCategoryType() || tranLine.isSupportCategoryType()) {
            var stTranType = nlapiGetFieldValue('type')
            if (stTranType != 'opprtnty' && stTranType != 'estimate') {
                if (!SWE.Library.misc.isUndefinedNullOrEmpty(stTranStartDt)) {
                    var stStartDt = tranLine.getRevRecStartDate()
                    if (stTranStartDt != stStartDt) {
                        if (confirm(SWE.Library.constants.MSGS_CONSTANTS[22])) {
                            break //Exit loop and continue to next validation
                        } else {
                            return false
                        }
                    }
                }
                if (!SWE.Library.misc.isUndefinedNullOrEmpty(stTranEndDt)) {
                    var stEndDt = tranLine.getRevRecEndDate()
                    if (stTranEndDt != stEndDt) {
                        if (confirm(SWE.Library.constants.MSGS_CONSTANTS[22])) {
                            break //Exit loop and continue to next validation
                        } else {
                            return false
                        }
                    }
                }
            }
        } //end if
    } //end for
    return true
}

SWE.R01B.CS.TranLines.setMSValueManually = function (idx, tranLine) {
    var globalVar = SWE.R01B.CS.TranLines.Variables
    // Since the M/S percent value doesn't get source through on item groups, get it manually
    if (tranLine.isMaintenanceCategoryType() || tranLine.isSupportCategoryType()) {
        var stMSPercent = nlapiGetLineItemValue('item', 'custcol_mtce_support_percent', idx)
        var stMSType = nlapiGetLineItemValue('item', 'custcol_mtce_support_type', idx)
        if (SWE.Library.misc.isUndefinedNullOrEmpty(stMSPercent)) {
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stMSType)) {
                // Retrieve M/S Types if not yet retrieved.
                if (globalVar.MS_TYPE_DATA == null) {
                    globalVar.MS_TYPE_DATA = SWE.Renewals.Library.retrieveMSTypes()
                }

                // Find a match for the M/S Type of the item line
                for (var iMTDidx = 0; iMTDidx < globalVar.MS_TYPE_DATA.length; iMTDidx++) {
                    if (globalVar.MS_TYPE_DATA[iMTDidx].id == stMSType) {
                        stMSPercent = globalVar.MS_TYPE_DATA[iMTDidx].percentage
                        break
                    }
                }
                if (!SWE.Library.misc.isUndefinedNullOrEmpty(stMSPercent)) {
                    nlapiSetLineItemValue('item', 'custcol_mtce_support_percent', idx, stMSPercent)
                }
            }
        }
    }
}

SWE.R01B.CS.TranLines.validateListRate = function (tranLine, idx) {
    var flListRate = tranLine.getListRate()
    if (SWE.Library.misc.isUndefinedNullOrEmpty(flListRate)) {
        alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[14], idx))
        return false
    }
    return true
}

SWE.R01B.CS.TranLines.validateItemDatesAgainstContractDates = function (tranLine, stTranStartDt, stTranEndDt, idx) {
    if (!SWE.Renewals.Library.isRecordTypeOpportunity()) {
        /* Validate Sales Order contract start date against tran line's start date */
        var stContractStartDt = tranLine.getContractItemStartDate()
        var orderType = nlapiGetFieldValue('custbody_order_type')
        var constants = SWE.Renewals.Library.Constants
        var globalVar = SWE.R01B.CS.TranLines.Variables
        var stContractID = nlapiGetFieldValue('custbody_contract_name')

        var isForRenewalContract = !SWE.Library.misc.isUndefinedNullOrEmpty(stContractID)
            ? SWE.R01B.CS.TranLines.hasOriginalContract(orderType)
            : false
        var applyFlexibleStart =
            globalVar.ENABLE_FLEXIBLE_START == 'T' &&
            (orderType == constants.ORDER_TYPE_RENEWAL ||
                (orderType == constants.ORDER_TYPE_UPSELL && isForRenewalContract))
        var minStart =
            applyFlexibleStart && SWE.Library.dates.compare(stTranStartDt, globalVar.currentDate) > -1
                ? globalVar.currentDate
                : stTranStartDt

        var iResult = SWE.Library.dates.compare(minStart, stContractStartDt) == 1
        if (iResult) {
            applyFlexibleStart
                ? alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[69], idx))
                : alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[15], idx))
            return false
        }

        /* Validate Sales Order contract end date against tran line's end date */
        var stContractEndDt = tranLine.getContractItemEndDate()
        var iResult = SWE.Library.dates.compare(stTranEndDt, stContractEndDt)
        if (iResult == -1) {
            alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[24], idx))
            return false
        }
    }
    return true
}

SWE.R01B.CS.TranLines.validateItemTermsAndDates = function (tranLine, idx) {
    if (tranLine.isTermCategoryType() || tranLine.isMaintenanceCategoryType() || tranLine.isSupportCategoryType()) {
        var iTermInMonths = tranLine.getItemTermInMonths()
        var stStartDt = tranLine.getContractItemStartDate()
        var stEndDt = tranLine.getContractItemEndDate()

        if (!SWE.Renewals.Library.isRecordTypeOpportunity() && SWE.Library.misc.isUndefinedNullOrEmpty(iTermInMonths)) {
            var stContractID = nlapiGetFieldValue('custbody_contract_name')
            if (
                SWE.Renewals.Library.isRecordTypeCreditMemo() &&
                SWE.Library.misc.isUndefinedNullOrEmpty(stContractID)
            ) {
                return true
            } else {
                alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[16], idx))
                return false
            }
        }
        var stTranType = nlapiGetFieldValue('type')
        if (stTranType != 'opprtnty' && stTranType != 'estimate') {
            if (SWE.Library.misc.isUndefinedNullOrEmpty(stStartDt)) {
                alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[17], idx))
                return false
            }
            if (SWE.Library.misc.isUndefinedNullOrEmpty(stEndDt)) {
                alert(SWE.Library.messages.displayMessage(SWE.Library.constants.MSGS_CONSTANTS[18], idx))
                return false
            }
        }
    }
    return true
}

/*
 * validates a renewal sales order and is a perpetual item
 */
SWE.R01B.CS.TranLines.validateRenewalSOAndPerpetualLicenses = function (tranLine, MSPricingOption) {
    var constants = SWE.Renewals.Library.Constants
    var globalVar = SWE.R01B.CS.TranLines.Variables

    if (SWE.Library.misc.isUndefinedNullOrEmpty(MSPricingOption)) {
        MSPricingOption = globalVar.MS_MODEL
    }

    if (
        nlapiGetFieldValue('custbody_order_type') == constants.ORDER_TYPE_RENEWAL &&
        tranLine.isPerpetualCategoryType() &&
        (MSPricingOption == constants.MS_MODEL_PERCENTAGE_NET || MSPricingOption == constants.MS_MODEL_PERCENTAGE)
    ) {
        //loop through and check if there's a maintenance item
        for (var i = 1; i <= nlapiGetLineItemCount('item'); i++) {
            var stCurItemCat = nlapiGetLineItemValue('item', 'custcol_item_category', i)
            if (SWE.Renewals.Library.searchInList(globalVar.arrMaintCat, stCurItemCat)) {
                return false
            }
        }
    }
    return true
}

/**
 * Confirm deletion of renewal items.
 * @note The alert only applies to renewal items generated after enhancement was installed.
 * @author Marco Balmeo
 * @date August 6, 2013
 * @partof Meltwater enhancement.
 *
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
SWE.R01B.CS.TranLines.validateDelete_TranLines = function (type) {
    var globalVar = SWE.R01B.CS.TranLines.Variables

    // Check if this is the item sublist
    if (type == 'item') {
        // Get Apply Upsell/Downsell Setting during R03 execution
        var isApplyUpsellDownsellEnabled = SWE.Parameters.getApplyUpsellDownsell() == 'T'

        // Check if this transaction was generated after enhancement was installed.
        var isGeneratedByCrEnhancement =
            SWE.Library.misc.getHiddenFieldValue(SWE.Parameters.IS_GENERATED_BY_CR_ENHANCEMENT) == 'T'

        if (isApplyUpsellDownsellEnabled && isGeneratedByCrEnhancement) {
            // Check if item has contract item id source.
            var stContractItemId = nlapiGetCurrentLineItemValue('item', 'custcol_from_ci_id')
            var itemCategory = nlapiGetCurrentLineItemValue('item', 'custcol_item_category')

            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stContractItemId)) {
                // Finally, confirm the delete action.
                if (confirm(SWE.Library.constants.MSGS_CONSTANTS[63])) {
                    /**********************************************************************************
                     * @modifiedBy Marco Balmeo
                     * @date Sep 12, 2013
                     * @issue 263031
                     * @reason Add contract item id of deleted item in hidden field. The value(s) will
                     * 			be used in R03 for validation of M/S items. Only deleted M/S items can
                     * 			appear with other M/S items(same product line of course).
                     * 			Applies only for M/S item.
                     */

                    if (
                        SWE.Renewals.Library.searchInList(globalVar.arrMaintCat, itemCategory) ||
                        SWE.Renewals.Library.searchInList(globalVar.arrSupportCat, itemCategory)
                    ) {
                        var itemsForDownsell = SWE.Library.misc.getHiddenFieldValue('itemsForDownsell')

                        itemsForDownsell += SWE.Library.misc.isUndefinedNullOrEmpty(itemsForDownsell)
                            ? stContractItemId
                            : ',' + stContractItemId

                        SWE.Library.misc.setToHiddenField('itemsForDownsell', itemsForDownsell)
                    }

                    /***********************************************************************************/

                    return true
                } else {
                    return false
                }
            }
        }
    }

    return true
}
