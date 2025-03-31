/* jshint undef: true, unused: true */

/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 *
 * Name			: ARK-EST-SetContractFields
 * Version		: 1.0
 * Date			: 28-02-2024
 * Author		: Richard Brand (richard.brand@arkance-systems.com)
 *
 * Description
 * When a contract is selected, this script sets the value of additional fields based on the
 * selected contract.
 *
 */
define(['N/query', 'SuiteScripts/BBE_LIB_GenericFunctionsSS2.js', 'N/record', 'N/ui/message'], function ( //function (query, record, BBE_LIB_GenericFunctionsSS2, search) { // jshint ignore:line
    query,
    bbeLib,
    record,
    msg
) {
    /**
     *
     * @param {Object} scriptContext
     * @governance 10 units
     */

    /**
     * This function search for custbody_contract_manager_contact
     *
     * @governance 0 unit
     */
    function fieldChangedSetOptions(context) {
        var currentRec = context.currentRecord
        var fieldName = context.fieldId

        if (fieldName == 'custbody_contract_name') {
            // get contract id
            var contractId = currentRec.getValue({
                fieldId: 'custbody_contract_name',
            })

            //log.debug('info', 'Id of selected contract (' + contractId + ")");

            try {
                // retrieving the id of the contractmanager of the selected contract
                var contractsSearchQuery =
                    'SELECT custrecordcontrct_mngr_cont_dft FROM customrecord_contracts WHERE id = ' + contractId
                let resultSet = query.runSuiteQL({
                    query: contractsSearchQuery,
                }).results

                // nr of results should be 1, because there can be only one contract manager per contract
                if (resultSet.length == 1) {
                    var contractManagerContactId = resultSet[0].getValue(0)
                    if (!bbeLib.isNullOrEmpty(contractManagerContactId) && contractManagerContactId != 0) {
                        // get company id
                        var companyId = context.currentRecord.getValue({ fieldId: 'entity' })

                        // check if the contract manager is an actuve contact on the company, otherwise give a warning
                        if (!isActiveContact(context, companyId, contractManagerContactId)) {
                            showMsg(
                                msg,
                                msg.Type.WARNING,
                                'The contractmanager of the selected contract is inactive. Please select an active contact and also update the contract.'
                            )
                            //alert("\nWARNING:\nThe contractmanager of the selected contract is inactive. Please select an active contact.");
                            setContractManager(currentRec, null)
                            //log.debug("info", "Fields cleared while contract manager is inactive on current customer. ContractId(" + contractId + ") CompanyId(" + companyId + ") ContactId(" + contractManagerContactId + ")");
                        } else {
                            setContractManager(currentRec, contractManagerContactId)
                            //log.debug("info", "Contact is active. Fields set. ContractId(" + contractId + ") CompanyId(" + companyId + ") ContactId(" + contractManagerContactId + ")");
                        }
                    } else {
                        showMsg(
                            msg,
                            msg.Type.ERROR,
                            'The contractmanager field of the selected contract is empty. Please select an active contact and also update the contract.'
                        )
                        //alert("\nWARNING:\nThe contractmanager field of the selected contract is empty.");
                        setContractManager(currentRec, null)
                        //log.debug("ERROR", "ContactId of contract manager is null or empty.");
                    }
                } else {
                    setContractManager(currentRec, null)
                    log.error('ERROR', 'Contract with ID ' + contractId + ' has more then one contract manager.')
                }
            } catch (exception) {
                setContractManager(currentRec, null)
                log.error('ERROR', exception)
            }
        }
        return true
    }

    return {
        fieldChanged: fieldChangedSetOptions,
    }

    /**
     * Shows the message in the NetSuite UI. While this message is displayed
     * on top of the page, this will not always be noticed, so this method
     * also shows an alert with the message.
     */
    function showMsg(msg, msgType, msgText) {
        var msgTitle = 'INFO'
        var msgDuration = 20000
        switch (msgType) {
            case msg.Type.WARNING:
                msgTitle = 'WARNING'
                msgDuration = 20000
                break
            case msg.Type.ERROR:
                msgTitle = 'ERROR'
                msgDuration = 20000
                break
        }

        // create and show message in UI of NetSuite (on top of the page)
        let myMsg = msg.create({
            title: msgTitle,
            message: msgText,
            type: msgType,
            duration: msgDuration,
        })
        myMsg.show()

        // show also an alert
        alert(msgTitle + ':\n' + msgText)
    }

    /**
     * Sets the contract manager to the contract contact manager contact and the
     * contract contact manager fields
     */
    function setContractManager(currentRec, contractManagerContactId) {
        // set the contract contact manager field
        currentRec.setValue({
            fieldId: 'custbody_contract_manager_contact',
            value: contractManagerContactId,
        })

        // select the contract manager also in the contract contact manager dropdown
        if (contractManagerContactId != null) {
            currentRec.setValue({
                fieldId: 'custpage_contactmanager_selectfield',
                value: contractManagerContactId,
            })
        } else {
            currentRec.setText({
                fieldId: 'custpage_contactmanager_selectfield',
                text: '',
            })
        }
    }

    /**
     * Check if the contact with the given contactId is an active contact
     * at the customer with the given customerId.
     *
     */
    function isActiveContact(context, customerId, contactId) {
        //log.debug("info", "Checking if contact (" + contactId + ") is active on customer (" + customerId + ")");

        // select the contactlist from the customer and select only the contact id's of the active contacts
        var activeContactQuery =
            'WITH rws AS(' +
            '   SELECT customer.contactlist AS str FROM customer WHERE customer.id=' +
            customerId +
            ')' +
            "SELECT contact.id FROM contact WHERE contact.isinactive = 'F' AND contact.id IN(" +
            "	SELECT REGEXP_SUBSTR(str, '[^,]+', 1, level) FROM rws" +
            "   CONNECT BY REGEXP_SUBSTR(str, '[^,]+', 1, level) IS NOT NULL " +
            ')'

        let resultSet = query.runSuiteQL({
            query: activeContactQuery,
        }).results

        // loop through the found active contacts to look for the given contact id
        if (resultSet.length > 1) {
            for (var i = 0; i < resultSet.length; i++) {
                if (resultSet[i].getValue(0) == contactId) return true
            }
        }
        return false
    }
})
