/**
 * Copyright (c) 1998-2010 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 * © 2014 NetSuite Inc. User may not copy, modify, distribute, or re-bundle or otherwise make available this code.
 */

/**
 * This script is a compilation of all the R01 CS scripts used for validation and
 * automatic field population for the header/main part
 *
 * @author atipoe
 * @version 1.0
 */
var SWE = SWE || {}
SWE.R01A = SWE.R01A || {}
SWE.R01A.CS = SWE.R01A.CS || {}
SWE.R01A.CS.Header = SWE.R01A.CS.Header || {}

/**
 * GLOBAL VARIABLES
 */
var IS_EMPTY = SWE.Library.misc.isUndefinedNullOrEmpty

//Get Parameters
if (!SWE.R01A.CS.Header.Variables)
    SWE.R01A.CS.Header.Variables = {
        isR01ACSEnabled: false,
        isR01BCSEnabled: false,
        isR01ECSEnabled: false,
        AUTOSELECT_SINGLE_CONTRACT: false,
        overrideDefaultShipAddress: false,
        DEFAULT_RENEWAL_PERIOD: 0,
        arrItemCatsToProcess: [],
        stEvent: '',
        startDateWasEnteredManually: false,
        arrTranFormToDeployScript: [],
        deployCRScript: false,
    }

var objParams = SWE.Parameters

// Map needed preferences to targetObj members
var prefsObj = {}
prefsObj[objParams.ENABLE_R01A] = 'isR01ACSEnabled'
prefsObj[objParams.ENABLE_R01B] = 'isR01BCSEnabled'
prefsObj[objParams.ENABLE_R01E] = 'isR01ECSEnabled'
prefsObj[objParams.AUTOSELECT_SINGLE_CONTRACT] = 'AUTOSELECT_SINGLE_CONTRACT'
prefsObj[objParams.OVERRIDE_DFLT_SHIP_ADDR] = 'overrideDefaultShipAddress'
prefsObj[objParams.DEFAULT_RENEWAL_PERIOD] = 'DEFAULT_RENEWAL_PERIOD'
prefsObj[objParams.ITEM_CATS_TO_PROCESS] = 'arrItemCatsToProcess'
prefsObj[objParams.TRANFORM_TO_DEPLOYSCRIPT] = 'arrTranFormToDeployScript'

objParams.initializePreferenceToObj(prefsObj, SWE.R01A.CS.Header.Variables)

SWE.R01A.CS.Header.pageInit_Header = function (stEventType) {
    var constants = SWE.Renewals.Library.Constants
    var roleId = nlapiGetRole()
    nlapiLogExecution('DEBUG', 'SWE_01A_CS_Header', 'Role = ' + roleId)

    SWE.R01A.CS.Header.Variables.deployCRScript = SWE.R01A.CS.Header.deployScript('SWE.R01A.CS.Header.pageInit_Header')
    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    // Shopper role
    if (roleId == constants.ROLEID_SHOPPER || roleId == constants.ROLEID_SHOPPER_WSDK) {
        nlapiLogExecution('DEBUG', 'SWE_01A_CS_Header', 'Client script is disabled for shopper role.')
        SWE.R01A.CS.Header.Variables.deployCRScript = false
        return
    }

    var logger = new SWE.Renewals.Library.Logger(true)
    SWE.R01A.CS.Header.Variables.stEvent = stEventType

    /******************** SWE_R01A_CS_DefaultStartDates.js - pageInit_DefaultStartDate ********************/
    if (SWE.R01A.CS.Header.Variables.isR01ACSEnabled) {
        if (stEventType == 'create') {
            SWE.R01A.CS.Header.salesOrderDateInit(stEventType)

            // [ISSUE 203020] Opportunity > Create Quote > Create Sales Order > Renewal Terms field is blank
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(SWE.R01A.CS.Header.Variables.DEFAULT_RENEWAL_PERIOD)) {
                nlapiSetFieldValue('custbody_renewal_terms', SWE.R01A.CS.Header.Variables.DEFAULT_RENEWAL_PERIOD, false)
            } else {
                nlapiSetFieldValue('custbody_renewal_terms', nlapiGetFieldValue('custbody_tran_term_in_months'), false)
            }
        } else {
            if (stEventType == 'copy') {
                if (SWE.Renewals.Library.isRecordTypeRMA()) {
                    SWE.R01A.CS.Header.rmaDateInit()
                    nlapiSetFieldValue('custbody_check_log_status', constants.CHECK_LOG_STATUS_PENDING)
                }
            }

            //Issue 275710. on edit mode, don't call setShipToAddress if 'Ship To:' already has a value
            var shipAddress = nlapiGetFieldValue('shipaddress')
            if (!((stEventType == 'edit' || stEventType == 'copy') && !IS_EMPTY(shipAddress))) {
                SWE.R01A.CS.Header.setShipToAddress()
            }
        }

        /* Always disable order type and end date */
        nlapiSetFieldDisabled('custbody_order_type', true)
        if (SWE.Renewals.Library.isRecordTypeOpportunity()) {
            if (IS_EMPTY(nlapiGetFieldValue('custbody_swe_from_contract'))) {
                nlapiSetFieldValue('custbody_order_type', constants.ORDER_TYPE_NEW) // If no contract selected and Not For Renewal, Set to "Contract - New"
            }
        }
    }

    /******************** SWE_R01B_CS_BillToAutomation.js - pageInit_DisableEntity ********************/
    if (SWE.R01A.CS.Header.Variables.isR01BCSEnabled) {
        var MSG_TITLE = 'Bill To Fields Automation'
        nlapiSetFieldDisabled('entity', true)

        if (stEventType == 'create') {
            SWE.R01A.CS.Header.initBillTo()
        }
    }

    /******************** SWE_R01E_CS_ContractValidation.js - pageInit_SetContractFields ********************/
    if (SWE.R01A.CS.Header.Variables.isR01ECSEnabled) {
        var MSG_TITLE = 'Initialize sales order with existing contract.'
        //logger.enableDebug(); //comment this line to disable debug

        if (stEventType == 'edit' || stEventType == 'copy') {
            logger.debug(MSG_TITLE, '=====Start=====')

            var stContractID = nlapiGetFieldValue('custbody_contract_name')
            var stUnlinkedContractID = nlapiGetFieldValue('custpage_contract_id')

            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stContractID)) {
                logger.debug(MSG_TITLE, 'Disabling field.')
                nlapiSetFieldDisabled('custbody_tran_term_in_months', true)
                if (SWE.Renewals.Library.isRecordTypeRMA()) {
                    //Issue 215816
                    nlapiSetFieldDisabled('custbody_swe_rma_header_end_date', true)
                } else {
                    nlapiSetFieldDisabled('enddate', true)
                }
                nlapiSetFieldDisabled('custbody_end_user', true)
                nlapiSetFieldDisabled('custbody_reseller', true)
                nlapiSetFieldDisabled('custbody_distributor', true)
                nlapiSetFieldDisabled('custbody_bill_to_tier', true)
            } else if (stEventType == 'edit' && !SWE.Library.misc.isUndefinedNullOrEmpty(stUnlinkedContractID)) {
                nlapiSetFieldValue('custbody_contract_name', stUnlinkedContractID)
                nlapiSetFieldValue('custbody_check_log_status', constants.CHECK_LOG_STATUS_PENDING)
                nlapiSetFieldValue('custbody_check_log_error_info', '')
                SWE.R01A.CS.Header.setOrderType(constants.ORDER_TYPE_NEW)
            }

            logger.debug(MSG_TITLE, '======End======')
        }
        if (stEventType == 'create') {
            logger.debug(MSG_TITLE, '=====Start=====')
            var stSelectedContract = nlapiGetFieldValue('custbody_contract_name')
            if (
                !SWE.Library.misc.isUndefinedNullOrEmpty(stContractID) &&
                SWE.Library.misc.isUndefinedNullOrEmpty(stSelectedContract)
            ) {
                nlapiSetFieldValue('custbody_contract_name', stContractID, true)
            }
            logger.debug(MSG_TITLE, '======End======')
        }
    }

    //disable contract date controls if order status is Pending Fulfillment(id=B)
    var stCheckLogStatus = nlapiGetFieldValue('custbody_check_log_status')

    if (SWE.Renewals.Library.isRecordTypeRefund()) {
        SWE.R01A.CS.Header.setOrderType()
    }

    if (SWE.Renewals.Library.isRecordTypeInvoice()) {
        nlapiSetFieldDisabled('custbody_contract_name', true)
        nlapiSetFieldDisabled('custbody_swe_contract_start_date', true)
    } else if (SWE.Renewals.Library.isRecordTypeCreditMemo() && nlapiGetFieldValue('createdfrom') > 0) {
        nlapiSetFieldDisabled('custbody_contract_name', true)
    } else if (
        nlapiGetFieldValue('custbody_contract_name') !== '' &&
        stCheckLogStatus == constants.CHECK_LOG_STATUS_PROCESSED &&
        (SWE.Renewals.Library.isRecordTypeSalesOrder() ||
            (SWE.Renewals.Library.isRecordTypeRMA() && !SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetRecordId())))
    ) {
        nlapiSetFieldDisabled('custbody_contract_name', true)
    }

    nlapiSetFieldDisabled('custbody_manual_renewal', true)

    var inpwhence = nlapiGetFieldValue('whence') === null ? true : nlapiGetFieldValue('whence') === ''
    var inptransform =
        nlapiGetFieldValue('istransforming') === null ? false : nlapiGetFieldValue('istransforming') === 'T'

    if (
        SWE.Renewals.Library.isRecordTypeRMA() &&
        nlapiGetFieldValue('custbody_contract_name') !== null &&
        nlapiGetFieldValue('custbody_contract_name') !== '' &&
        (inpwhence || (inptransform && inpwhence))
    ) {
        var contractRecord = nlapiLoadRecord('customrecord_contracts', nlapiGetFieldValue('custbody_contract_name'))
        var contractStatus = contractRecord.getFieldValue('custrecord_contract_status')

        if (
            contractRecord.getFieldValue('custrecord_contract_date_renewed') !== null &&
            contractRecord.getFieldValue('custrecord_contract_date_renewed') !== '' &&
            contractRecord.getFieldValue('custrecord_contract_renewal_tran') !== null &&
            contractRecord.getFieldValue('custrecord_contract_renewal_tran') !== '' &&
            contractStatus !== constants.ContractStatus.RENEWAL_REJECTED
        ) {
            alert(SWE.Library.constants.MSGS_CONSTANTS[55])
        }
    }
}

SWE.R01A.CS.Header.validateField_Header = function (type, name) {
    var startDateFldName = SWE.Renewals.Library.isRecordTypeRMA() ? 'custbody_swe_rma_header_start_date' : 'startdate'
    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    if (
        name == 'custbody_tran_term_in_months' ||
        name == startDateFldName ||
        name == 'custbody_contract_name' ||
        name == 'custbody_renewal_terms'
    ) {
        var logger = new SWE.Renewals.Library.Logger(true)
        var MSG_TITLE = 'validateField_Header()'

        var endDateFldName = SWE.Renewals.Library.isRecordTypeRMA() ? 'custbody_swe_rma_header_end_date' : 'enddate'
        var startDate = nlapiGetFieldValue(startDateFldName)
        var endDate = nlapiGetFieldValue(endDateFldName)
        var contractId = nlapiGetFieldValue('custbody_contract_name')
        var contractStartDate = nlapiGetFieldValue('custbody_swe_contract_start_date')
        var contractEndDate = nlapiGetFieldValue('custbody_swe_contract_end_date')

        if (name == 'custbody_tran_term_in_months') {
            var iTerm = nlapiGetFieldValue('custbody_tran_term_in_months')
            if (parseFloat(iTerm) <= 0) {
                if (!SWE.Library.misc.isUndefinedNullOrEmpty(contractEndDate)) {
                    alert(SWE.Library.constants.MSGS_CONSTANTS[43])
                } else {
                    alert(SWE.Library.constants.MSGS_CONSTANTS[44])
                }
                return false
            }
        }

        if (name == 'custbody_renewal_terms') {
            var iTerm = nlapiGetFieldValue('custbody_renewal_terms')
            if (parseFloat(iTerm) <= 0) {
                alert(SWE.Library.constants.MSGS_CONSTANTS[58])
                return false
            }
        }

        if (name == startDateFldName) {
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(startDate)) {
                //Verify that the transaction start date is within the contract dates
                if (
                    !SWE.Library.misc.isUndefinedNullOrEmpty(contractId) &&
                    !SWE.Library.misc.isUndefinedNullOrEmpty(contractStartDate) &&
                    !SWE.Library.misc.isUndefinedNullOrEmpty(contractEndDate)
                ) {
                    var iResult = SWE.Library.dates.inRange(startDate, contractStartDate, contractEndDate)
                    if (iResult !== true) {
                        if (SWE.Library.dates.compare(startDate, contractStartDate) == -1) {
                            alert(SWE.Library.constants.MSGS_CONSTANTS[42])
                            return false
                        } else {
                            alert(SWE.Library.constants.MSGS_CONSTANTS[43])
                            return false
                        }
                    }
                }
            }
        }

        //This part checks if no contract is selected and there are item in tranlines that requires contract
        if (SWE.Renewals.Library.isRecordTypeRMA() && name == 'custbody_contract_name') {
            if (SWE.Library.misc.isUndefinedNullOrEmpty(contractId)) {
                for (var i = 1; i <= nlapiGetLineItemCount('item'); i++) {
                    //Check if item category requires contract
                    if (
                        SWE.Renewals.Library.itemCategoryRequiresContract(
                            nlapiGetLineItemValue('item', 'custcol_item_category', i)
                        )
                    ) {
                        // Issue: 199577 SWV-CR > allow for RMA that does not reference contract
                        // alert(SWE.Library.constants.MSGS_CONSTANTS[30]);
                        // return false;
                        alert(SWE.Library.constants.MSGS_CONSTANTS[52])
                        break
                    }
                }
            } else {
                //Save selected contract to hidden field
                SWE.Library.misc.setToHiddenField('contractid', contractId)
            }
        }
    }

    return true
}

SWE.R01A.CS.Header.fieldChanged_Header = function (stType, stName, iLineNum) {
    var constants = SWE.Renewals.Library.Constants
    var logger = new SWE.Renewals.Library.Logger(true)
    var sContractID = nlapiGetFieldValue('custbody_contract_name')

    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    //set the hidden contract field for automation of contract start and end dates
    if (stName == 'custbody_contract_name') {
        nlapiSetFieldValue('custbody_swe_contract_id_hidden', sContractID, false)

        /*
         * If in 'create' mode, set currency to the currency of the selected contract then
         * disable the currency field.
         *
         * When setting contract to blank, enable the currency field again.
         */
        if (SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetRecordId()) && SWE.Library.misc.isMultiCurrencyEnabled()) {
            //check if 'create' mode & multi-currency is enabled
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(sContractID)) {
                var sContractCurrency = nlapiLookupField(
                    'customrecord_contracts',
                    sContractID,
                    'custrecord_swe_contract_currency'
                )

                if (!SWE.Library.misc.isUndefinedNullOrEmpty(sContractCurrency)) {
                    nlapiSetFieldValue('currency', sContractCurrency)
                }

                if (nlapiGetContext().getExecutionContext() == 'userinterface') {
                    nlapiDisableField('currency', true)
                }
            } else {
                if (nlapiGetContext().getExecutionContext() == 'userinterface') {
                    nlapiDisableField('currency', false)
                }
            }
        }
    }

    /******************** SWE_R01A_CS_DefaultStartDates.js - fieldChanged_computeEndDate ********************/
    if (SWE.R01A.CS.Header.Variables.isR01ACSEnabled) {
        var MSG_TITLE = 'Compute End Dates'

        //logger.enableDebug(); //comment this line to disable debug

        /* Update End Date if Term in Months changed */
        if (
            stName == 'custbody_tran_term_in_months' &&
            (SWE.Renewals.Library.isRecordTypeQuote() ||
                SWE.Renewals.Library.isRecordTypeSalesOrder() ||
                SWE.Renewals.Library.isRecordTypeInvoice() ||
                SWE.Renewals.Library.isRecordTypeRMA())
        ) {
            var iTerm = nlapiGetFieldValue('custbody_tran_term_in_months')
            var stStartDateField =
                SWE.Renewals.Library.isRecordTypeRMA() === true ? 'custbody_swe_rma_header_start_date' : 'startdate'
            var stEndDateField =
                SWE.Renewals.Library.isRecordTypeRMA() === true ? 'custbody_swe_rma_header_end_date' : 'enddate'
            logger.debug(MSG_TITLE, 'Term:' + iTerm)

            var stStartDate = nlapiGetFieldValue(stStartDateField)
            if (
                !SWE.Library.misc.isUndefinedNullOrEmpty(iTerm) &&
                !SWE.Library.misc.isUndefinedNullOrEmpty(stStartDate)
            ) {
                var tempEndDate = nlapiDateToString(SWE.Library.dates.addMonths2(iTerm, stStartDate))
                var stOrderType = nlapiGetFieldValue('custbody_order_type')

                //Issue 355057
                if (
                    (stOrderType != constants.ORDER_TYPE_UPSELL && stOrderType != constants.ORDER_TYPE_DOWNSELL) ||
                    (SWE.Renewals.Library.isRecordTypeRMA() && SWE.Library.misc.isUndefinedNullOrEmpty(sContractID))
                ) {
                    nlapiSetFieldValue(stEndDateField, tempEndDate)
                }

                var newTerm = SWE.Library.dates.dateDiff(stStartDate, tempEndDate)
                newTerm = Math.round(newTerm * 1000) / 1000
                nlapiSetFieldValue('custbody_tran_term_in_months', newTerm, false)
            }
        }

        /* Update End Date if Start Date changed */
        if (stName == 'startdate' || stName == 'custbody_swe_rma_header_start_date') {
            var stStartDateField =
                SWE.Renewals.Library.isRecordTypeRMA() === true ? 'custbody_swe_rma_header_start_date' : 'startdate'
            var stEndDateField =
                SWE.Renewals.Library.isRecordTypeRMA() === true ? 'custbody_swe_rma_header_end_date' : 'enddate'
            var stStartDate = nlapiGetFieldValue(stStartDateField)
            var stEndDate = nlapiGetFieldValue(stEndDateField)
            logger.debug(MSG_TITLE, 'Start Date:' + stStartDate)
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stStartDate)) {
                var iTerm = nlapiGetFieldValue('custbody_tran_term_in_months')
                logger.debug(MSG_TITLE, 'Term:' + iTerm)

                if (stStartDate != SWE.Library.misc.getHiddenFieldValue('startdate')) {
                    SWE.R01A.CS.Header.Variables.startDateWasEnteredManually = true
                }

                if (
                    !SWE.Library.misc.isUndefinedNullOrEmpty(iTerm) &&
                    SWE.Library.misc.isUndefinedNullOrEmpty(sContractID)
                ) {
                    var tempEndDate = nlapiDateToString(SWE.Library.dates.addMonths2(iTerm, stStartDate))
                    var stOrderType = nlapiGetFieldValue('custbody_order_type')

                    //Issue 355057
                    if (
                        (stOrderType != constants.ORDER_TYPE_UPSELL && stOrderType != constants.ORDER_TYPE_DOWNSELL) ||
                        (SWE.Renewals.Library.isRecordTypeRMA() && SWE.Library.misc.isUndefinedNullOrEmpty(sContractID))
                    ) {
                        nlapiSetFieldValue(stEndDateField, tempEndDate)
                    }

                    var newTerm = SWE.Library.dates.dateDiff(stStartDate, tempEndDate)
                    newTerm = Math.round(newTerm * 1000) / 1000
                    nlapiSetFieldValue('custbody_tran_term_in_months', newTerm, false)
                }

                if (!SWE.Library.misc.isUndefinedNullOrEmpty(sContractID)) {
                    iTerm = SWE.Library.dates.dateDiff(stStartDate, stEndDate)
                    iTerm = Math.round(iTerm * 1000) / 1000
                    nlapiSetFieldValue('custbody_tran_term_in_months', iTerm, false)
                    logger.debug(MSG_TITLE, 'Term in Months : ' + iTerm)
                }
            }
        }

        // Update Term if End Date changed //Issue 215816
        if (
            stName == 'enddate' ||
            (stName == 'custbody_swe_rma_header_end_date' &&
                (SWE.Renewals.Library.isRecordTypeQuote() ||
                    SWE.Renewals.Library.isRecordTypeSalesOrder() ||
                    SWE.Renewals.Library.isRecordTypeInvoice() ||
                    SWE.Renewals.Library.isRecordTypeRMA()))
        ) {
            var stStartDateField =
                SWE.Renewals.Library.isRecordTypeRMA() === true ? 'custbody_swe_rma_header_start_date' : 'startdate'
            var stEndDateField =
                SWE.Renewals.Library.isRecordTypeRMA() === true ? 'custbody_swe_rma_header_end_date' : 'enddate'
            var stStartDate = nlapiGetFieldValue(stStartDateField)
            var stEndDate = nlapiGetFieldValue(stEndDateField)
            logger.debug(MSG_TITLE, 'Start Date:' + stStartDate)
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stStartDate)) {
                if (!SWE.Library.misc.isUndefinedNullOrEmpty(stEndDate)) {
                    var iTerm = SWE.Library.dates.dateDiff(stStartDate, stEndDate)
                    iTerm = Math.round(iTerm * 1000) / 1000
                    nlapiSetFieldValue('custbody_tran_term_in_months', iTerm, false)
                    logger.debug(MSG_TITLE, 'Term in Months : ' + iTerm)
                }
            }
        }

        if (stName == 'entity') {
            var stTranId = nlapiGetFieldValue('id')
            var stOrderType = nlapiGetFieldValue('custbody_order_type')
            if (
                (stOrderType == constants.ORDER_TYPE_RENEWAL || stOrderType == constants.ORDER_TYPE_RENEWAL_MANUAL) &&
                !SWE.Library.misc.isUndefinedNullOrEmpty(stTranId)
            ) {
                alert(SWE.Library.constants.MSGS_CONSTANTS[0])
            }
        }
    }

    /******************** SWE_R01B_CS_BillToAutomation.js - fieldChanged_BillToAutomation ********************/
    if (SWE.R01A.CS.Header.Variables.isR01BCSEnabled) {
        var MSG_TITLE = 'Bill To Fields Automation'
        var BILL_TO_TIER_END_USER = '1'
        var BILL_TO_TIER_RESELLER = '2'
        var BILL_TO_TIER_DISTRIBUTOR = '3'

        /* Retrieve fields necessary for both processing. */
        if (
            stName == 'custbody_distributor' ||
            stName == 'custbody_reseller' ||
            stName == 'custbody_end_user' ||
            stName == 'custbody_bill_to_tier'
        ) {
            var stDistributor = nlapiGetFieldValue('custbody_distributor')
            var stReseller = nlapiGetFieldValue('custbody_reseller')
            var stEndUser = nlapiGetFieldValue('custbody_end_user')
            var stBillToTier = nlapiGetFieldValue('custbody_bill_to_tier')

            /* Save end user value if Nexus tax is flagged.*/
            var sRecId = nlapiGetRecordId()
            if (
                !SWE.Library.misc.isUndefinedNullOrEmpty(stEndUser) &&
                stName == 'custbody_end_user' &&
                SWE.Library.misc.isUndefinedNullOrEmpty(sRecId)
            ) {
                //SWE.Library.misc.createCookie('vsEndUser', stEndUser, 0);
                SWE.Library.misc.setToHiddenField('vsEndUser', stEndUser)
            }

            logger.debug(MSG_TITLE, 'Bill to Tier =' + stBillToTier)
            logger.debug(MSG_TITLE, 'Distributor =' + stDistributor)
            logger.debug(MSG_TITLE, 'Reseller =' + stReseller)
            logger.debug(MSG_TITLE, 'End User =' + stEndUser)
        }

        /* Processing for Bill To Tier field */
        if (stName == 'custbody_distributor' || stName == 'custbody_reseller' || stName == 'custbody_end_user') {
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stDistributor)) {
                logger.debug(MSG_TITLE, 'Set Distributor')
                nlapiSetFieldValue('custbody_bill_to_tier', BILL_TO_TIER_DISTRIBUTOR, true)
            } else {
                if (!SWE.Library.misc.isUndefinedNullOrEmpty(stReseller)) {
                    logger.debug(MSG_TITLE, 'Set Reseller')
                    nlapiSetFieldValue('custbody_bill_to_tier', BILL_TO_TIER_RESELLER, true)
                } else {
                    if (!SWE.Library.misc.isUndefinedNullOrEmpty(stEndUser)) {
                        logger.debug(MSG_TITLE, 'Set End User')
                        nlapiSetFieldValue('custbody_bill_to_tier', BILL_TO_TIER_END_USER, true)
                    } else {
                        logger.debug(MSG_TITLE, 'Set to empty')
                        nlapiSetFieldValue('custbody_bill_to_tier', '', true)
                    }
                }
            }
        }

        /* Processing for Bill To Customer field */
        if (stName == 'custbody_bill_to_tier') {
            var stBillToTier = nlapiGetFieldValue('custbody_bill_to_tier')
            var stEntity = nlapiGetFieldValue('entity')
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(stBillToTier)) {
                switch (stBillToTier) {
                    case BILL_TO_TIER_END_USER:
                        if (!SWE.Library.misc.isUndefinedNullOrEmpty(stEndUser) && stEntity != stEndUser) {
                            logger.debug(MSG_TITLE, 'Set End User')
                            nlapiSetFieldValue('entity', stEndUser)
                        }
                        break
                    case BILL_TO_TIER_DISTRIBUTOR:
                        if (!SWE.Library.misc.isUndefinedNullOrEmpty(stDistributor) && stEntity != stDistributor) {
                            logger.debug(MSG_TITLE, 'Set Distributor')
                            nlapiSetFieldValue('entity', stDistributor)
                        }
                        break
                    case BILL_TO_TIER_RESELLER:
                        if (!SWE.Library.misc.isUndefinedNullOrEmpty(stReseller) && stEntity != stReseller) {
                            logger.debug(MSG_TITLE, 'Set Reseller')
                            nlapiSetFieldValue('entity', stReseller)
                        }
                        break
                }

                // Don't adjust the Ship To Tier if there's already a contract specified
                //var contractId = nlapiGetFieldValue('custbody_contract_name');
                if (SWE.Library.misc.isUndefinedNullOrEmpty(sContractID)) {
                    //also set parallel change in Ship To Tier to reflect change in Bill To Tier
                    nlapiSetFieldValue('custbody_ship_to_tier', stBillToTier, false)
                }
            } else {
                nlapiSetFieldValue('entity', '')
            }
        }
    }

    /******************** SWE_R01E_CS_ContractValidation.js - fieldChanged_ContractValidation ********************/
    if (SWE.R01A.CS.Header.Variables.isR01ECSEnabled) {
        var constants = SWE.Renewals.Library.Constants
        var MSG_TITLE = 'Contract Validation'
        //logger.enableDebug(); //comment this line to disable debug

        try {
            if (stName == 'custbody_contract_name') {
                logger.debug(MSG_TITLE, '=====Start=====')
                logger.debug(MSG_TITLE, 'Get value of previous contract.')
                var contract_id = sContractID //nlapiGetFieldValue('custbody_contract_name');
                logger.debug(MSG_TITLE, 'Contract ID:' + contract_id)

                if (SWE.Library.misc.isUndefinedNullOrEmpty(contract_id)) {
                    logger.debug(MSG_TITLE, 'Enabling fields.')
                    //nlapiSetFieldValue('custbody_order_type', 1); // If no contract selected and Not Renewal, Set to "Contract - New"
                    if (nlapiGetFieldValue('custbody_order_type') != constants.ORDER_TYPE_RENEWAL) {
                        SWE.R01A.CS.Header.setOrderType(constants.ORDER_TYPE_NEW)
                    }

                    nlapiSetFieldDisabled('custbody_tran_term_in_months', false)
                    if (SWE.Renewals.Library.isRecordTypeRMA()) {
                        //Issue 215816
                        nlapiSetFieldDisabled('custbody_swe_rma_header_end_date', false)
                    } else {
                        nlapiSetFieldDisabled('enddate', false)
                    }
                    nlapiSetFieldDisabled('custbody_end_user', false)
                    nlapiSetFieldDisabled('custbody_reseller', false)
                    nlapiSetFieldDisabled('custbody_distributor', false)
                    nlapiSetFieldDisabled('custbody_bill_to_tier', false)
                    nlapiSetFieldDisabled('custbody_renewal_terms', false)
                    return
                }

                logger.debug(MSG_TITLE, 'Load contract details to sales order.')
                //Set New Values from the selected contract
                SWE.R01A.CS.Header.setOrderType(
                    SWE.Renewals.Library.isRecordTypeRMA() === false
                        ? constants.ORDER_TYPE_UPSELL
                        : constants.ORDER_TYPE_DOWNSELL
                )
                if (SWE.R01A.CS.Header.Variables.stEvent == 'edit') {
                    var stInternalID = nlapiGetRecordId()
                    var tran_fields = ['custbody_order_type', 'custbody_contract_name']
                    var tran_columns = nlapiLookupField('salesorder', stInternalID, tran_fields)
                    if (!SWE.Library.misc.isUndefinedNullOrEmpty(tran_columns)) {
                        if (tran_columns.custbody_contract_name == contract_id) {
                            SWE.R01A.CS.Header.setOrderType(tran_columns.custbody_order_type)
                        }
                    }
                }

                var fields = [
                    'custrecord_contract_distributor',
                    'custrecord_contract_reseller',
                    'custrecord_contract_bill_to_tier',
                    'custrecord_contract_ship_to_tier',
                    'custrecord_contract_renewal_terms',
                    'custrecord_contract_date_renewed',
                    'custrecord_contract_status',
                ] //Issue 204399
                var columns = nlapiLookupField('customrecord_contracts', contract_id, fields)
                nlapiSetFieldValue('custbody_distributor', columns.custrecord_contract_distributor, false)
                nlapiSetFieldValue('custbody_reseller', columns.custrecord_contract_reseller, false)
                nlapiSetFieldValue('custbody_bill_to_tier', columns.custrecord_contract_bill_to_tier, false)
                //trigger change field to set ship to tier
                nlapiSetFieldValue('custbody_ship_to_tier', columns.custrecord_contract_ship_to_tier)
                nlapiSetFieldValue('custbody_renewal_terms', columns.custrecord_contract_renewal_terms, false)

                //Issue 204399 - Display warning message
                if (
                    !SWE.Library.misc.isUndefinedNullOrEmpty(columns.custrecord_contract_date_renewed) &&
                    columns.custrecord_contract_status !== constants.ContractStatus.RENEWAL_REJECTED
                ) {
                    alert(SWE.Library.constants.MSGS_CONSTANTS[55])
                }
                logger.debug(MSG_TITLE, 'Disabling field.')
                nlapiSetFieldDisabled('custbody_tran_term_in_months', true)
                if (SWE.Renewals.Library.isRecordTypeRMA()) {
                    //Issue 215816
                    nlapiSetFieldDisabled('custbody_swe_rma_header_end_date', true)
                } else {
                    nlapiSetFieldDisabled('enddate', true)
                }
                nlapiSetFieldDisabled('custbody_end_user', true)
                nlapiSetFieldDisabled('custbody_reseller', true)
                nlapiSetFieldDisabled('custbody_distributor', true)
                nlapiSetFieldDisabled('custbody_bill_to_tier', true)
                nlapiSetFieldDisabled('custbody_renewal_terms', true)
                //logger.debug(MSG_TITLE, 'Set value of selected contract to the hidden field.');
                //nlapiSetFieldValue('custbody_hidden_field', contract_id);
                logger.debug(MSG_TITLE, '======End======')
            }
            //return true;
        } catch (ex) {
            logger.debug(MSG_TITLE, 'Error Occurred.')
            if (ex.getDetails !== undefined) {
                nlapiLogExecution('ERROR', ex.getCode(), ex.getDetails())
            } else {
                nlapiLogExecution('ERROR', 'UNEXPECTED ERROR', ex.toString())
            }
        }
    }

    //Handle change in Ship To Tier
    if (stName == 'custbody_ship_to_tier') {
        SWE.R01A.CS.Header.setShipToAddress()
        logger.debug(MSG_TITLE, 'Set Ship To Address')
    }

    return true
}

SWE.R01A.CS.Header.postSourcing_Header = function (type, name) {
    var constants = SWE.Renewals.Library.Constants
    if (!(name == 'entity' || name == 'custbody_swe_contract_id_hidden' || name == 'shipaddresslist')) return

    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    if (SWE.R01A.CS.Header.Variables.AUTOSELECT_SINGLE_CONTRACT) {
        //Issue 199147
        //Issue 190598: Special Handling for *Single* Contract on Subsequent Upsell Transactions
        if (
            name == 'entity' &&
            !SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetFieldValue('custbody_end_user')) &&
            !SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetFieldValue('entity'))
        ) {
            var filters = []
            filters.push(
                new nlobjSearchFilter(
                    'custrecord_contracts_end_user',
                    null,
                    'is',
                    nlapiGetFieldValue('custbody_end_user')
                )
            )
            //filters.push(new nlobjSearchFilter('custrecord_contract_date_renewed', null, 'isempty')); //Issue 204399
            filters.push(
                new nlobjSearchFilter('custrecord_contracts_bill_to_customer', null, 'is', nlapiGetFieldValue('entity'))
            )
            if (SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetFieldValue('custbody_distributor'))) {
                filters.push(new nlobjSearchFilter('custrecord_contract_distributor', null, 'is', '@NONE@'))
            } else {
                filters.push(
                    new nlobjSearchFilter(
                        'custrecord_contract_distributor',
                        null,
                        'is',
                        nlapiGetFieldValue('custbody_distributor')
                    )
                )
            }
            if (SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetFieldValue('custbody_reseller'))) {
                filters.push(new nlobjSearchFilter('custrecord_contract_reseller', null, 'is', '@NONE@'))
            } else {
                filters.push(
                    new nlobjSearchFilter(
                        'custrecord_contract_reseller',
                        null,
                        'is',
                        nlapiGetFieldValue('custbody_reseller')
                    )
                )
            }

            // Define search columns
            var columns = [
                new nlobjSearchColumn('id'),
                new nlobjSearchColumn('custrecord_contract_ship_to_tier'),
                // Issue 203826 : SWV-CR | Sales Order > Auto-select Single Contract preference enabled >
                // Contract Term and Renewal Terms are not disabled
                // Warning: This has a problem with IE7 db96
                // columns[2] = new nlobjSearchColumn('custrecord_contract_renewal_terms');
                new nlobjSearchColumn('custrecord_contract_date_renewed'),
                new nlobjSearchColumn('custrecord_contract_status'),
            ]

            var searchResults = nlapiSearchRecord('customrecord_contracts', null, filters, columns)
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(searchResults) && searchResults.length == 1) {
                nlapiSetFieldValue('custbody_contract_name', searchResults[0].getId())
                nlapiSetFieldValue('custbody_swe_contract_id_hidden', searchResults[0].getId())
                var contractStatus = searchResults[0].getValue('custrecord_contract_status')

                //Issue 204399 - Display warning message
                if (
                    !SWE.Library.misc.isUndefinedNullOrEmpty(
                        searchResults[0].getValue('custrecord_contract_date_renewed')
                    ) &&
                    contractStatus !== constants.ContractStatus.RENEWAL_REJECTED
                ) {
                    alert(SWE.Library.constants.MSGS_CONSTANTS[55])
                }
                // Issue 203016
                // Override the default setting from bill to tier with the actual ship to tier of the contract
                nlapiSetFieldValue(
                    'custbody_ship_to_tier',
                    searchResults[0].getValue('custrecord_contract_ship_to_tier'),
                    false
                )
                // Issue 203826
                // This lookup is done as a work-around for an unknown error which occurs in IE7
                var contractTerms = nlapiLookupField(
                    'customrecord_contracts',
                    searchResults[0].getId(),
                    'custrecord_contract_renewal_terms'
                )
                nlapiSetFieldValue('custbody_renewal_terms', contractTerms, false)

                //set shipping address based on ship to tier
                SWE.R01A.CS.Header.setShipToAddress()
            } else {
                // fix to issue 212456
                if (
                    nlapiGetFieldValue('custbody_renewal_terms') === '' ||
                    nlapiGetFieldValue('custbody_renewal_terms') == null
                ) {
                    nlapiSetFieldValue(
                        'custbody_renewal_terms',
                        SWE.R01A.CS.Header.Variables.DEFAULT_RENEWAL_PERIOD,
                        false
                    )
                }
            }

            // Issue 203016 : SWV-CR | Sales Order > Auto-select Single Contract preference enabled >
            // Order Type is not updated to Contract-Upsell, Channel fields are not disabled
            if (SWE.R01A.CS.Header.Variables.isR01ECSEnabled) {
                var contractName = nlapiGetFieldValue('custbody_contract_name')
                var orderType = nlapiGetFieldValue('custbody_order_type')
                var isContractDefined = !SWE.Library.misc.isUndefinedNullOrEmpty(contractName)

                if (!isContractDefined && orderType != constants.ORDER_TYPE_RENEWAL) {
                    SWE.R01A.CS.Header.setOrderType(constants.ORDER_TYPE_NEW)
                } else {
                    SWE.R01A.CS.Header.setOrderType(
                        SWE.Renewals.Library.isRecordTypeRMA() === false
                            ? constants.ORDER_TYPE_UPSELL
                            : constants.ORDER_TYPE_DOWNSELL
                    )
                }

                nlapiSetFieldDisabled('custbody_reseller', isContractDefined)
                nlapiSetFieldDisabled('custbody_distributor', isContractDefined)
                nlapiSetFieldDisabled('custbody_bill_to_tier', isContractDefined)

                // Issue 203826
                nlapiSetFieldDisabled('custbody_tran_term_in_months', isContractDefined)
                nlapiSetFieldDisabled('custbody_renewal_terms', isContractDefined)
            }
        }
    }

    //Set Transaction Dates - do this here because the tran dates will be validated against the contract dates which are sourced from the Contract
    if (
        name == 'custbody_swe_contract_id_hidden' &&
        !SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetFieldValue('custbody_swe_contract_id_hidden'))
    ) {
        var contractStartDate = nlapiGetFieldValue('custbody_swe_contract_start_date')
        var contractEndDate = nlapiGetFieldValue('custbody_swe_contract_end_date')
        var stStartDateField =
            SWE.Renewals.Library.isRecordTypeRMA() === true ? 'custbody_swe_rma_header_start_date' : 'startdate'
        var stEndDateField =
            SWE.Renewals.Library.isRecordTypeRMA() === true ? 'custbody_swe_rma_header_end_date' : 'enddate'
        var startDate = nlapiGetFieldValue(stStartDateField)

        //Set Start Date
        if (!SWE.R01A.CS.Header.Variables.startDateWasEnteredManually) {
            /**
             * Added undefined-null-empty validation.
             * @modifiedBy Marco Balmeo
             * @date Aug 16, 2013
             * @issue 250859
             */
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(contractStartDate)) {
                nlapiSetFieldValue(stStartDateField, contractStartDate, false) //Do not fire fieldChanged event
            }
        }

        /**
         * Added undefined-null-empty validation.
         * @modifiedBy Marco Balmeo
         * @date Aug 16, 2013
         * @issue 250859
         */
        if (!SWE.Library.misc.isUndefinedNullOrEmpty(contractEndDate)) {
            //Set End Date
            nlapiSetFieldValue(stEndDateField, contractEndDate, false)
            //Set Term in Months
            nlapiSetFieldValue(
                'custbody_tran_term_in_months',
                SWE.Library.dates.dateDiff(nlapiGetFieldValue(stStartDateField), contractEndDate),
                false
            )
        }
    }

    /*Set Ship To based on Ship To Tier - can only do this here because the Ship To is set automatically
      by Entity which is sourced from Bill To Customer*/

    //Check if Override Ship To Parameter is Set to True and item being post-sourced is shipaddresslist
    if (name == 'shipaddresslist' && nlapiGetFieldValue('shipaddresslist') === '') {
        SWE.R01A.CS.Header.setShipToAddress()
    }
}

SWE.R01A.CS.Header.saveRecord_Header = function () {
    var logger = new SWE.Renewals.Library.Logger(true)

    if (!SWE.R01A.CS.Header.Variables.deployCRScript) {
        return true
    }

    /******************** SWE_R01A_CS_DefaultStartDates.js - validateLine_defaultRevRecStartDate ********************/
    if (SWE.R01A.CS.Header.Variables.isR01ACSEnabled) {
        var arrTranDates = SWE.Renewals.Library.getTranDates()
        var tranStartDate = arrTranDates[0]
        var tranEndDate = arrTranDates[1]
        var contractId = nlapiGetFieldValue('custbody_contract_name')
        var contractStartDate = nlapiGetFieldValue('custbody_swe_contract_start_date')
        var contractEndDate = nlapiGetFieldValue('custbody_swe_contract_end_date')

        if (SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetFieldValue('custbody_tran_term_in_months'))) {
            // Issue 204001 : SWV-CR | Transactions > Error encountered on Save: "You may only enter numbers into this field"
            if (!SWE.Library.misc.isUndefinedNullOrEmpty(tranStartDate)) {
                var termInMonths = SWE.Library.dates.dateDiff(tranStartDate, tranEndDate)
                nlapiSetFieldValue('custbody_tran_term_in_months', termInMonths, false)
            }
        }

        //Verify that the transaction start date is within the contract dates
        if (
            !SWE.Library.misc.isUndefinedNullOrEmpty(contractId) &&
            !SWE.Library.misc.isUndefinedNullOrEmpty(contractStartDate) &&
            !SWE.Library.misc.isUndefinedNullOrEmpty(contractEndDate) &&
            !SWE.Renewals.Library.isRecordTypeCreditMemo()
        ) {
            var iResult = SWE.Library.dates.inRange(tranStartDate, contractStartDate, contractEndDate)
            if (iResult !== true) {
                if (SWE.Library.dates.compare(tranStartDate, contractStartDate) == -1) {
                    alert(SWE.Library.constants.MSGS_CONSTANTS[42])
                    return false
                } else {
                    alert(SWE.Library.constants.MSGS_CONSTANTS[43])
                    return false
                }
            }
        }
    }

    /******************** SWE_R01B_CS_BillToAutomation.js - saveRecord_CheckBillToFields ********************/
    if (SWE.R01A.CS.Header.Variables.isR01BCSEnabled) {
        var MSG_TITLE = 'Bill To Fields Automation'
        var stDistributor = nlapiGetFieldValue('custbody_distributor')
        var stReseller = nlapiGetFieldValue('custbody_reseller')
        var stEndUser = nlapiGetFieldValue('custbody_end_user')
        logger.debug(MSG_TITLE, 'Distributor =' + stDistributor)
        logger.debug(MSG_TITLE, 'Reseller =' + stReseller)
        logger.debug(MSG_TITLE, 'End User =' + stEndUser)
        /* Check if at least 1 of the three fields are populated. */
        if (
            SWE.Library.misc.isUndefinedNullOrEmpty(stDistributor) &&
            SWE.Library.misc.isUndefinedNullOrEmpty(stReseller) &&
            SWE.Library.misc.isUndefinedNullOrEmpty(stEndUser)
        ) {
            //alert('Please make sure to select a Distributor, Reseller, or End User.');
            alert(SWE.Library.messages.getErrorMessage('ERR_HEADER_CUSTOMER_MISSING'))
            return false
        }

        /* Check if the End User is Valid */
        /*if (!SWE.Library.misc.isUndefinedNullOrEmpty(stEndUser)){
            // var customer = nlapiLoadRecord('customer', stEndUser);
            // var channelTier = customer.getFieldValue('custentity_customer_channel_tier');
            var channelTier = nlapiLookupField('customer', stEndUser, 'custentity_customer_channel_tier');
            if (channelTier != 1) {
                  alert(SWE.Library.messages.getErrorMessage('ERR_HEADER_INVALID_END_USER'));
                  return false;
            }
        }*/
    }

    // Validate 'Renewal Terms'
    if (SWE.Renewals.Library.isRecordTypeSalesOrder()) {
        // Check if Sales Order contains at least 1 tran line w/ recurring billing (i.e. a need to renew)
        var hasRenewableItem = false
        for (var i = 1; i <= nlapiGetLineItemCount('item'); i++) {
            var stItemCat = nlapiGetLineItemValue('item', 'custcol_item_category', i)
            if (SWE.Renewals.Library.searchInList(SWE.R01A.CS.Header.Variables.arrItemCatsToProcess, stItemCat)) {
                hasRenewableItem = true
                break
            }
        }
        if (hasRenewableItem && SWE.Library.misc.isUndefinedNullOrEmpty(nlapiGetFieldValue('custbody_renewal_terms'))) {
            alert(SWE.Library.constants.MSGS_CONSTANTS[53])
            return false
        }
    }

    return true
}

/**
 * Sets the value of the dropdown control Order Type
 * @param {Object} value The value of the Order type to be set
 * @author mabiog
 * @type void
 */
SWE.R01A.CS.Header.setOrderType = function (value) {
    var constants = SWE.Renewals.Library.Constants
    if (SWE.Renewals.Library.isRecordTypeRefund()) {
        //always set to downsell if RMA
        nlapiSetFieldValue('custbody_order_type', constants.ORDER_TYPE_DOWNSELL)
    } else {
        nlapiSetFieldValue('custbody_order_type', value)
    }
}

SWE.R01A.CS.Header.salesOrderDateInit = function (eventType) {
    var constants = SWE.Renewals.Library.Constants
    var MSG_TITLE = 'Default Start Dates'
    var logger = new SWE.Renewals.Library.Logger(true)
    //logger.enableDebug(); //comment this line to disable debug
    logger.debug(MSG_TITLE, '=====Start=====')

    var stStartDateField =
        SWE.Renewals.Library.isRecordTypeRMA() === true ? 'custbody_swe_rma_header_start_date' : 'startdate'
    var stTermField = 'custbody_tran_term_in_months'
    var stTranDate = nlapiGetFieldValue('trandate')
    var tranTermInMonths = constants.TRAN_TERM_MONTHS

    if (SWE.Library.misc.isUndefinedNullOrEmpty(stTranDate)) {
        stTranDate = nlapiDateToString(new Date())
        //nlapiSetFieldValue(stStartDateField, stTranDate); //Already done below
    }

    var dtStartDate = nlapiGetFieldValue(stStartDateField)

    if (SWE.Library.misc.isUndefinedNullOrEmpty(dtStartDate)) {
        dtStartDate = nlapiStringToDate(stTranDate)
        nlapiSetFieldValue(stStartDateField, stTranDate)
    }

    logger.debug(MSG_TITLE, 'Start Date =' + dtStartDate)

    nlapiSetFieldValue(stTermField, tranTermInMonths)

    var contractId = nlapiGetFieldValue('custbody_contract_name')

    if (eventType == 'create' && !SWE.Library.misc.isUndefinedNullOrEmpty(contractId)) {
        nlapiSetFieldValue('custbody_order_type', constants.ORDER_TYPE_UPSELL)
    } else {
        nlapiSetFieldValue(
            'custbody_order_type',
            SWE.Renewals.Library.isRecordTypeRMA() === true ? constants.ORDER_TYPE_DOWNSELL : constants.ORDER_TYPE_NEW
        )
    }

    SWE.Library.misc.setToHiddenField('startdate', nlapiGetFieldValue(stStartDateField))
    SWE.R01A.CS.Header.Variables.startDateWasEnteredManually = false

    logger.debug(MSG_TITLE, '======End======')
}

SWE.R01A.CS.Header.rmaDateInit = function () {
    //Issue 196597
    var filters = new SWE.Renewals.Library.SearchFilters()
    filters.addFilter('internalid', null, 'is', nlapiGetFieldValue('createdfrom'))

    var joinId = null

    var tranformFrom = nlapiGetFieldValue('transform')

    var columns = new SWE.Renewals.Library.SearchColumns()
    columns.addColumn('internalid', '', 'group')

    if (tranformFrom == 'custinvc' || tranformFrom == 'cashsale') {
        joinId = 'createdfrom'
        columns.addColumn('internalid', joinId, 'group')
    }

    columns.addColumn('startdate', joinId, 'group')
    columns.addColumn('enddate', joinId, 'group')

    var arrResults = {}
    if (tranformFrom == 'custinvc') {
        arrResults = SWE.Renewals.Library.searchInvoice(filters, columns)
    } else if (tranformFrom == 'salesord') {
        arrResults = SWE.Renewals.Library.searchSalesOrder(filters, columns)
    } else if (tranformFrom == 'cashsale') {
        arrResults = SWE.Renewals.Library.searchCashSale(filters, columns)
    }

    if (arrResults) {
        var startDate = arrResults[0].getValue('startdate', joinId, 'group')
        var endDate = arrResults[0].getValue('enddate', joinId, 'group')

        nlapiSetFieldValue('custbody_swe_rma_header_start_date', startDate, false)
        nlapiSetFieldValue('custbody_swe_rma_header_end_date', endDate, false)
    }
}

SWE.R01A.CS.Header.initBillTo = function () {
    var constants = SWE.Renewals.Library.Constants
    var stBillTo = nlapiGetFieldValue('entity')

    if (!SWE.Library.misc.isUndefinedNullOrEmpty(stBillTo)) {
        var stCustChannelTier = null
        stCustChannelTier = nlapiLookupField('entity', stBillTo, 'custentity_customer_channel_tier')

        switch (stCustChannelTier) {
            case constants.BILL_TO_TIER_END_USER:
                var endUser = nlapiGetFieldValue('custbody_end_user')

                if (SWE.Library.misc.isUndefinedNullOrEmpty(endUser)) {
                    nlapiSetFieldValue('custbody_end_user', stBillTo)
                }

                break
            case constants.BILL_TO_TIER_RESELLER:
                nlapiSetFieldValue('custbody_reseller', stBillTo)
                break
            case constants.BILL_TO_TIER_DISTRIBUTOR:
                nlapiSetFieldValue('custbody_distributor', stBillTo)
                break
        }

        /* Added to load value of end user that was selected in a different form.*/
        var stEndUser = SWE.Library.misc.getHiddenFieldValue('vsEndUser')
        if (!SWE.Library.misc.isUndefinedNullOrEmpty(stEndUser)) {
            nlapiSetFieldValue('custbody_end_user', stEndUser, false)
        }
    }
    SWE.Library.misc.removeHiddenFieldValue('vsEndUser')
}

SWE.R01A.CS.Header.setShipToAddress = function () {
    function getShipToTierCustomerId() {
        var SHIP_TO_TIER_END_USER = '1',
            SHIP_TO_TIER_RESELLER = '2',
            SHIP_TO_TIER_DISTRIBUTOR = '3',
            custId = '',
            shipToCustId = nlapiGetFieldValue('custbody_ship_to_tier')

        switch (shipToCustId) {
            case SHIP_TO_TIER_END_USER:
                custId = nlapiGetFieldValue('custbody_end_user')
                break
            case SHIP_TO_TIER_RESELLER:
                custId = nlapiGetFieldValue('custbody_reseller')
                break
            case SHIP_TO_TIER_DISTRIBUTOR:
                custId = nlapiGetFieldValue('custbody_distributor')
                break
        }
        return custId
    }

    // lng - 06/09/11
    if (!SWE.R01A.CS.Header.Variables.overrideDefaultShipAddress) {
        return
    }

    var shipToTierCustomerId = getShipToTierCustomerId()

    if (!shipToTierCustomerId) {
        return
    }

    SWE.R01A.CS.Header.setDefaultShipAddressToRec(shipToTierCustomerId)
}

SWE.R01A.CS.Header.setDefaultShipAddressToRec = function (stCustId) {
    var stFields = [
        'shipattention',
        'shipaddressee',
        'shipphone',
        'shipaddress1',
        'shipaddress2',
        'shipcity',
        'shipstate',
        'shipzip',
        'shipcountry',
        'shipaddress',
    ]

    var stCols = nlapiLookupField('customer', stCustId, stFields)
    var stShipToUserAddress = stCols.shipaddress ? stCols.shipaddress.trim() : ''
    var CUSTOM_ADDR = '-2'

    /*
     * Issue 351833
     * Note: nlapiSetFieldValue('previous_shipaddresslist', -2) is not exposed and may not work in the future.
     */
    if (stCustId != nlapiGetFieldValue('entity')) {
        nlapiSetFieldValue('previous_shipaddresslist', CUSTOM_ADDR)
        nlapiSetFieldValue('shipaddresslist', CUSTOM_ADDR, false)
    }

    // set custom address fields
    nlapiSetFieldValue('shipattention', stCols.shipattention, false)
    nlapiSetFieldValue('shipaddressee', stCols.shipaddressee, false)
    nlapiSetFieldValue('shipphone', stCols.shipphone, false)
    nlapiSetFieldValue('shipaddr1', stCols.shipaddress1, false)
    nlapiSetFieldValue('shipaddr2', stCols.shipaddress2, false)
    nlapiSetFieldValue('shipcity', stCols.shipcity, false)
    nlapiSetFieldValue('shipstate', stCols.shipstate, false)
    nlapiSetFieldValue('shipzip', stCols.shipzip, false)
    nlapiSetFieldValue('shipcountry', stCols.shipcountry, false)
    // nlapiSetFieldValue('shipoverride', 'T', false);

    // set ship to address text area
    if (stShipToUserAddress) {
        nlapiSetFieldValue('shipaddress', stShipToUserAddress, false)
    } else {
        alert(SWE.Library.constants.MSGS_CONSTANTS[56])
    }
}

SWE.R01A.CS.Header.deployScript = function (event) {
    var formId = nlapiGetFieldValue('customform')
    var forms = SWE.R01A.CS.Header.Variables.arrTranFormToDeployScript
    var deployTransactionScript = false
    if (!SWE.Library.misc.isUndefinedNullOrEmpty(forms)) {
        if (SWE.Library.misc.searchInList(forms, formId)) {
            deployTransactionScript = true
        }
    } else {
        deployTransactionScript = true
    }

    if (!deployTransactionScript) {
        nlapiLogExecution(
            'DEBUG',
            'SWE_R01A_CS_Header - ' + event,
            'Form Id: ' + formId + '  |  Deploy Script: ' + deployTransactionScript
        )
    }

    return deployTransactionScript
}
