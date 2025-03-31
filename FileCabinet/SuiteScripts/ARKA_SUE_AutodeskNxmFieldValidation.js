/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(// jshint ignore:line
['N/query', 'N/record', '/SuiteScripts/BBE_LIB_GenericFunctionsSS2.js', 'N/ui/message', 'N/search'], function (
    query,
    record,
    bbeLib,
    message,
    search
) {
    const VALUE = {
        AUTODESK_PRODLINE: 13,
    }

    const QUOTE_SCENARIO = {
        NEW: '1',
        RENEWAL: '2',
        COTERM_NEW: '3',
        EXTEND: '4',
        SWITCH: '5',
        SWITCHTERM: '8',
        PREMIUM_SUBS: '6',
        MULTIYEAR_ANNUAL: '7',
    }

    const QUOTE_SCENARIO_NAME = {
        1: 'NEW',
        2: 'RENEWAL',
        3: 'COTERM NEW',
        4: 'EXTEND',
        5: 'SWITCH PRODUCT',
        8: 'SWITCH TERM',
        6: 'PREMIUM SUBS/TRUE UP',
        7: 'MULTIYEAR ANNUAL',
    }

    /**
     *
     * Before Load, The script will check if there is any error message on the record.
     * If it is the case, a message will pop up in view mode with the error message.
     *
     * @governance 0 Units
     *
     * @param {ScriptContext} context
     */
    function beforeLoad(context) {
        if (context.type === context.UserEventType.VIEW) {
            var currentRecord = context.newRecord
            var error = currentRecord.getValue({
                fieldId: 'custbody_autodesknxm_missing_fields',
            })

            if (!bbeLib.isNullOrEmpty(error)) {
                context.form.addPageInitMessage({
                    type: message.Type.ERROR,
                    message: error,
                })
            }
        }
    }

    /**
     * Before Submit,
     * For new model autodesk opportunity and estimate,
     *  validates the mandatory fields for the order scenario
     *
     * @governance 32 Units
     *
     * @param {ScriptContext} context
     */
    function beforeSubmit(context) {
        let transRec = context.newRecord
        let subsidiary = transRec.getValue('subsidiary')
        let customer = transRec.getValue('entity')
        let contractMgr = transRec.getValue('custbody_contract_manager_contact')
        let errorMessageAll = []

        let itemLineDetails = getItemlineDetails(transRec)

        if (itemLineDetails.itemsArr.length) {
            let itemDetailsObj = getAutodeskItemDetails(itemLineDetails.itemsArr) // 10 units

            //if new model autodesk item then validate
            if (Object.keys(itemDetailsObj).length) {
                let itemLineAutodesk = itemLineDetails.itemDetailsArr.filter((lineObj) =>
                    Object.keys(itemDetailsObj).includes(lineObj.itemId)
                ) //filter only autodesk line from transaction line
                //.map(lineObjF =>  {return {...lineObjF, ...itemDetailsObj[lineObjF.itemId]}});// merge item details to the line

                let subsidiaryValidation = isAuthorisationConfigure(subsidiary) //1 units
                let customerValidation = customerDetails(customer) // 10 units
                let contractManagerValidation = contractMgrDetails(contractMgr) // 1 unit

                let missingFieldObj = { ...subsidiaryValidation, ...customerValidation, ...contractManagerValidation }

                let errorMessageHeader = validateHeaderFields(missingFieldObj)
                let errorMessageLineScenario = validateLineFields(itemLineAutodesk)
                let errorMessageItem = validateItems(Object.values(itemDetailsObj))

                errorMessageAll = [...errorMessageHeader, ...errorMessageLineScenario, ...errorMessageItem]
            }
        }

        transRec.setValue({
            fieldId: 'custbody_autodesknxm_missing_fields',
            value: errorMessageAll.join('</br>'),
        })
    }

    /**
     * Gets Items details by the list of IDs
     *
     * @governance 10 Units
     *
     * @param {String[]} - itemArr
     * @return {Search} - Search object
     */
    function getAutodeskItemDetails(itemArr) {
        let itemDetailsObj = {}

        let queryString = `
            SELECT
                i.id,
                i.custitem_autodesk_offering_id,
                i.custitem_autodesk_offering_name,
                i.custitem_autodesk_offering_code,
                i.custitem_autodesk_intentded_usage_code,
                i.custitem_autodesk_intended_usage_desc,
                i.custitem_autodesk_term_code,
                i.custitem_autodesk_term_desc,
                i.custitem_autodesk_service_plan_code,
                i.custitem_autodesk_service_plan_desc,
                i.custitem_autodesk_access_model_code,
                i.custitem_autodesk_access_model_desc,
                i.custitem_autodesk_connectivity_code,
                i.custitem_autodesk_connectivity_desc,
                i.itemid
            FROM
                item i 
            WHERE
                i.id IN (${itemArr.join(',')})
                AND i.custitem_product_line = ${VALUE.AUTODESK_PRODLINE}
                AND i.custitem_autodesk_offering_id IS NOT NULL
        `

        let resultSet = query.runSuiteQL({
            query: queryString,
        }).results //10 units

        resultSet.forEach((result) => {
            let itemId = result.values[0]

            //true - missing , false - contain value
            itemDetailsObj[itemId] = {
                offering_Id: result.values[1] ? false : true,
                offering_Name: result.values[2] ? false : true,
                offering_Code: result.values[3] ? false : true,
                usage_Code: result.values[4] ? false : true,
                usage_Description: result.values[5] ? false : true,
                term_Code: result.values[6] ? false : true,
                term_Description: result.values[7] ? false : true,
                service_Plan_Code: result.values[8] ? false : true,
                service_Plan_Description: result.values[9] ? false : true,
                access_Model_code: result.values[10] ? false : true,
                access_Model_Description: result.values[11] ? false : true,
                connectivity_Code: result.values[12] ? false : true,
                connectivity_Description: result.values[13] ? false : true,
                itemName: result.values[14],
            }
        })

        return itemDetailsObj
    }

    /**
     * Gets Items id of the transaction
     *
     * @governance 0 unit
     *
     * @param {Record} transObj
     * @return {String[]} itemsArr
     */
    function getItemlineDetails(transObj) {
        let itemObj = {
            itemsArr: [],
            itemDetailsArr: [],
        }

        let numItemLines = transObj.getLineCount({
            sublistId: 'item',
        })

        for (var i = 0; i < numItemLines; i++) {
            let item = transObj.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i,
            })

            let autodeskScenario = transObj.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_trans_autodeskquotescenario',
                line: i,
            })

            let startDate = transObj.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_swe_contract_start_date',
                line: i,
            })

            let endDate = transObj.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_swe_contract_end_date',
                line: i,
            })

            let renewalNumber = transObj.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_renewal_number',
                line: i,
            })

            let serialNumber = transObj.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_serial_number',
                line: i,
            })

            let refSerialNumber = transObj.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_autodesk_refserialnumber',
                line: i,
            })

            let object = {
                line: i + 1,
                itemId: item,
                startDate: startDate,
                endDate: endDate,
                renewalNumber: renewalNumber,
                serialNumber: serialNumber,
                refSerialNumber: refSerialNumber,
                autodeskScenario: autodeskScenario,
            }

            itemObj.itemsArr.push(item)
            itemObj.itemDetailsArr.push(object)
        }

        return itemObj
    }

    /**
     * Function to check subsidiary credentials
     *
     * @param {*} subsidiary
     * @governance 1 units
     */
    function isAuthorisationConfigure(subsidiary) {
        let authObj = {
            missingAuth: false,
            missingAgent: false,
        }

        let searchResult = search.lookupFields({
            type: search.Type.SUBSIDIARY,
            id: subsidiary,
            columns: [
                'custrecord_autodesk_csn',
                'custrecord_consumer_key',
                'custrecord_autodesk_consumer_secret',
                'custrecord_autodesk_callback_url',
                'custrecord_autodesk_agent_email',
            ],
        }) //1 units

        authObj.missingAuth =
            !searchResult.custrecord_autodesk_csn ||
            !searchResult.custrecord_consumer_key ||
            !searchResult.custrecord_autodesk_consumer_secret ||
            !searchResult.custrecord_autodesk_callback_url
        //authObj.missingAgent = !searchResult.custrecord_autodesk_agent_email;

        return authObj
    }

    /**
     * Function to check customer details
     *
     * @param {*} customer
     * @governance 10 units
     */
    function customerDetails(customer) {
        let custMissingField = {
            billAddress: true,
            billAddr1: true,
            billCity: true,
            billCountryCode: true,
            csn: true,
        }

        let custSearch = `
            SELECT
                cust.defaultbillingaddress,
                addr.addr1,
                addr.city,
                addr.country,
                cust.custentity_autodesk_csn
            FROM
                customer cust 
                LEFT JOIN entityaddress addr ON cust.defaultbillingaddress = addr.nkey
            WHERE
                cust.id = ${customer}
        `

        let resultSet = query.runSuiteQL({
            query: custSearch,
        }).results //10 units

        if (resultSet.length) {
            let billAddress = resultSet[0].values[0]
            let billAddr1 = resultSet[0].values[1]
            let billCity = resultSet[0].values[2]
            let billCountryCode = resultSet[0].values[3]
            let custCsn = resultSet[0].values[4]

            if (billAddress) custMissingField.billAddress = false
            if (billAddr1) custMissingField.billAddr1 = false
            if (billCity) custMissingField.billCity = false
            if (billCountryCode) custMissingField.billCountryCode = false
            if (custCsn) custMissingField.csn = false
        }

        return custMissingField
    }

    /**
     * Function to check contract manager details
     *
     * @param {*} contractMgr
     * @governance 1 units
     */
    function contractMgrDetails(contractMgr) {
        let contractMgrMissingField = {
            contractManager: true,
            email: true,
            firstname: true,
            lastname: true,
            phone: true,
        }

        if (contractMgr) {
            contractMgrMissingField.contractManager = false

            let searchResult = search.lookupFields({
                type: search.Type.CONTACT,
                id: contractMgr,
                columns: ['email', 'firstname', 'lastname', 'phone'],
            }) //1 units

            if (searchResult.email) contractMgrMissingField.email = false
            if (searchResult.firstname) contractMgrMissingField.firstname = false
            if (searchResult.lastname) contractMgrMissingField.lastname = false
            if (searchResult.phone) contractMgrMissingField.phone = false
        }
        return contractMgrMissingField
    }

    /**
     * Validate header fields
     *
     * @param {Object} hdMissingFieldObj
     */
    function validateHeaderFields(hdMissingFieldObj) {
        let errorMessage = []
        let message = errorMessages()

        if (hdMissingFieldObj.missingAuth == true) errorMessage.push(message.missingAuth)
        if (hdMissingFieldObj.missingAgent == true) errorMessage.push(message.missingAgent)
        if (hdMissingFieldObj.billAddress == true) errorMessage.push(message.billAddress)
        if (hdMissingFieldObj.contractManager == true) errorMessage.push(message.contractManager)

        if (hdMissingFieldObj.billAddress == false) {
            if (hdMissingFieldObj.billAddr1 == true) errorMessage.push(message.billAddr1)
            if (hdMissingFieldObj.billCity == true) errorMessage.push(message.billCity)
            if (hdMissingFieldObj.billCountryCode == true) errorMessage.push(message.billCountryCode)
        }
        if (hdMissingFieldObj.contractManager == false) {
            if (hdMissingFieldObj.email == true) errorMessage.push(message.email)
            if (hdMissingFieldObj.firstname == true) errorMessage.push(message.firstname)
            if (hdMissingFieldObj.lastname == true) errorMessage.push(message.lastname)
            if (hdMissingFieldObj.phone == true) errorMessage.push(message.phone)
        }

        return errorMessage
    }

    /**
     * Function to validate item line data
     *
     * @returns error messages
     */
    function validateLineFields(itemLines) {
        let errorMessage = []

        itemLines.forEach((lineData) => {
            let missingLineFields = []

            if (!lineData.autodeskScenario) {
                missingLineFields.push('Autodesk Quote Scenario')
            } else {
                if (
                    !lineData.startDate &&
                    [QUOTE_SCENARIO.NEW, QUOTE_SCENARIO.COTERM_NEW, QUOTE_SCENARIO.PREMIUM_SUBS].includes(
                        lineData.autodeskScenario
                    )
                ) {
                    missingLineFields.push('Item Start Date')
                }
                if (
                    !lineData.endDate &&
                    [QUOTE_SCENARIO.EXTEND, QUOTE_SCENARIO.PREMIUM_SUBS].includes(lineData.autodeskScenario)
                ) {
                    missingLineFields.push('Item End Date')
                }
                if (
                    !lineData.serialNumber &&
                    [QUOTE_SCENARIO.RENEWAL, QUOTE_SCENARIO.SWITCHTERM, QUOTE_SCENARIO.EXTEND].includes(
                        lineData.autodeskScenario
                    )
                ) {
                    missingLineFields.push('Serial Number')
                }
                if (
                    !lineData.refSerialNumber &&
                    [QUOTE_SCENARIO.COTERM_NEW, QUOTE_SCENARIO.SWITCH].includes(lineData.autodeskScenario)
                ) {
                    missingLineFields.push('Reference Serial Number')
                }
            }

            if (missingLineFields.length)
                errorMessage.push(
                    `Item Line ${lineData.line}: Missing fields: ${missingLineFields.join(', ')} ${lineData.autodeskScenario ? `for the quote scenario: ${QUOTE_SCENARIO_NAME[lineData.autodeskScenario]}` : ''}`
                )
        })

        return errorMessage
    }

    /**
     * Function to validate autodesk item missing fields
     *
     * @return errorMessage
     */
    function validateItems(itemDetails) {
        let errorMessage = []

        itemDetails.forEach((itemObj) => {
            let missingFields = []

            for (let itemFieldKey in itemObj) {
                if (itemObj[itemFieldKey] == true && itemFieldKey != 'itemName') missingFields.push(itemFieldKey)
            }

            if (missingFields.length)
                errorMessage.push(
                    `Please enter a value for fields ${missingFields.join(', ')} for the item ${itemObj.itemName}`
                )
        })

        return errorMessage
    }

    /**
     * Function to return possible autodesk missing error message
     *
     * @returns errorMessage
     */
    function errorMessages() {
        let object = {
            missingAuth: 'Please contact your administrator to set the authentication access to Autodesk',
            missingAgent: 'Please contact your administrator to set the Agent email on Subsidiaries',
            billAddress: 'Please enter a billing address on the customer',
            billAddr1: 'Please enter address 1 on the billing address of the customer',
            billCity: 'Please enter a city on the billing address of the customer',
            billCountryCode: 'Please enter a country code on the billing address of the customer',
            contractManager: 'Please enter a contract manager',
            email: 'Please enter an email for the contract manager',
            firstname: 'Please enter a first name for the contract manager',
            lastname: 'Please enter a last name for the contract manager',
            phone: 'Please enter a phone number for the contract manager',
        }

        return object
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
    }
})
