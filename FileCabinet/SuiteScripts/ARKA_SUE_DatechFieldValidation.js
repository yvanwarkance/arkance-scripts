/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(// jshint ignore:line
    [
        'N/search',
        'N/record',
        '/SuiteScripts/BBE_LIB_TransactionStatusesSS2.js',
        '/SuiteScripts/BBE_LIB_GenericFunctionsSS2.js',
        'N/ui/message'
    ], function (search, record, bbeTransacStatus, bbeLib, message) {
        var AUTODESK_CONTRACT_NUMBER = 'AutodeskContractNumber';
        var RENEWAL_NUMBER = 'RenewalNumber';
        var SERIAL_NUMBER_TO_UPDATE = 'SerialNumberTobeUpdated';
        var UPGRADE_FROM_SERIAL = 'UpgradeFromSerialNumber';
        var COMMENTS = 'Comments';
        var SWITCH_ITEM = 'Switch';
        var DOUBLE_SCENARIO = 'DoubleScenario';
        var SWITCH_COLLECTION_CATEGORY = 'SWITCH_COLLECTION_CATEGORY';
        var PO_PENDING_APPROVAL = '1';
        var PO_APPROVED = '2';
        var SO_PENDING_APPROVAL = bbeTransacStatus.getFieldValueStatusId('salesorder', 'Pending Approval');
        var SO_PENDING_FULFILLMENT = bbeTransacStatus.getFieldValueStatusId('salesorder', 'Pending Fulfillment');
        var SO_PENDING_BILLING = bbeTransacStatus.getFieldValueStatusId('salesorder', 'Pending Billing');
        var CONTRACT_NEW = '1';
        var CONTRACT_RENEW = '2';
        var CONTRACT_UPSELL = '3';
        var NEW_SUBSCRIPTION_FOR_NEW_CUSTOMER = 1;
        var NEW_SUBSCRIPTION_FOR_EXISTING_CUSTOMER = 2;
        var NEW_SUBSCRIPTION_TO_ADD_TO_EXISTING_CONTRACT = 3;
        var ADD_SEAT_TO_CONTRACT = 7;
        var MAINTENANCE_TO_SUBSCRIPTION_SWITCH_OR_MULTI_USER_TRADE_IN = 5;
        var SUBSCRIPTION_RENEWAL_OR_MAINTENANCE_PLAN_RENEWAL = 6;
        var RENEWAL_AND_NEW_TO_EXISTING_CONTRACT = 100;
        var CO_TERMING_EXTENSTIONS = 8;
        var SWITCH_TO_COLLECTION_UPGRADE = 9;
        var g_isSalesOrder = false;
        var NEW_BUSINESS = '1';
        var RENEW_BUSINESS = '2';
        var g_custObj = null;
        var g_contractManagerObj = null;
        var subsidiaries = ['3', '12', '13', '23', '24','16', '42', '45','41','47','17'];
        var SUBSCRIPTION_SWITCH_FROM_CATEGORY_1 = '11';
        var SUBSCRIPTION_SWITCH_FROM_CATEGORY_2 = '12';
        var AUTODESK_PRODUCT_LINE = '13';
        var AUTODESK_FLEX_SOFTPROD = '588';
        var FLEX_SOFTPROD = '1711';
    
        //New NL Changes
        var validateZipCodes = false;
    
        /**
         *
         * Before Load, The script will check if there is any error message on the record.
         * If it is the case, a message will pop up in view mode with the error message.
         *
         * @governance 0 Units
         *
         * @param {ScriptContext} context
         */
        function beforeLoad_showMissingMandatoryFields(context) {
            if (context.type === context.UserEventType.VIEW) {
                var currentRecord = context.newRecord;
                var error = currentRecord.getValue({
                    fieldId: 'custbody_datech_missing_fields'
                });
    
                if (!bbeLib.isNullOrEmpty(error)) {
                    context.form.addPageInitMessage({
                        type: message.Type.ERROR,
                        message: error
                    });
                }
            }
        }
    
        /**
         * This function will find the datech custom record based on the subsidiary on the transaction
         *
         * @governance 0 Units
         *
         * @param {Object} Record
         * @returns {String} String of datech vendors separated by a ','
         *
         */
        function getDatechDetails(subsidiary) {
            var datechVendors = '';
            var datechDetailsSearchObj = search.create({
                type: 'customrecord_authorization_code',
                filters: [['custrecord_auth_subsidiary', 'anyof', subsidiary]],
                columns: [
                    search.createColumn({
                        name: 'id',
                        sort: search.Sort.ASC,
                        label: 'ID'
                    }),
                    search.createColumn({
                        name: 'custrecord_auth_vendor_ids',
                        label: 'Datech Vendor IDs'
                    }),
                    search.createColumn({ name: "custrecord_auth_zip_code", label: "Zip Code Mandatory" }),
                    search.createColumn({name: "custrecord_3y_vendor", label: "3Y Vendor"})
                ]
            });
            //custrecord_auth_zip_code
    
            var datechDetailsResultObj = bbeLib.getAllSearchResults({
                search: datechDetailsSearchObj
            });
    
            if (datechDetailsResultObj.length > 0) {
                datechVendors = datechDetailsResultObj[0].getValue('custrecord_auth_vendor_ids');
                validateZipCodes = datechDetailsResultObj[0].getValue('custrecord_auth_zip_code');
                /* No Validation for Autodesk for now */
                if(datechDetailsResultObj[0].getValue('custrecord_3y_vendor'))
                {
                    datechVendors += ',' + datechDetailsResultObj[0].getValue('custrecord_3y_vendor');
                }
    
                //log.error('Data zip code', datechDetailsResultObj[0].getValue('custrecord_auth_zip_code'));
            }
           // log.error('datechVendors', datechVendors);
            return datechVendors.toString();
        }
    
        /**
         * This function will check if the vendor passed is a Datech vendor
         *
         * @governance 0 Units
         *
         * @param {Object} Record
         * @returns {String} String of datech vendors separated by a ','
         *
         */
        function isDatechVendor(datechVendorIds, vendor) {
            var isDatechOrder = false;
    
            if (datechVendorIds.indexOf(',') != -1) {
                var datechVendorArray = datechVendorIds.split(',');
                isDatechOrder = datechVendorArray.indexOf(vendor) > -1;
            } else {
                isDatechOrder = vendor == datechVendorIds;
            }
    
            //log.error('vendor',vendor);
            return isDatechOrder;
        }
    
        /**
         *
         * Before Submit, The script validates if the sales order check if the order is a Datech Order.
         * If the order is not a Datech Order, no validation is done
         * If the order is a Datech Order, The script assigns the correct order scenario to the sales order
         * and validates the mandatory fields for the order scenario
         *
         * @governance 32 Units
         *
         * @param {ScriptContext} context
         */
        function beforeSubmit_validateDatechFields(context) {
            var needDatechValidation = false;
            var transObj = context.newRecord;
            g_isSalesOrder = transObj.type === record.Type.SALES_ORDER || transObj.type === record.Type.ESTIMATE;
           // log.error('Logical exp', transObj.type + '--' + record.Type.SALES_ORDER + '--' + record.Type.ESTIMATE);
            var checkDatechFields = transObj.getValue('custbody_validate_datech_dield');
            var subsidiary = transObj.getValue('subsidiary');
            //log.error('B4 Submit', 'B4 Submit');
            if (!subsidiary) {
                //Updates from Celigo
    
                //var searchType = g_isSalesOrder ? search.Type.SALES_ORDER : search.Type.PURCHASE_ORDER;
                var searchType = transObj.type === record.Type.SALES_ORDER ? search.Type.SALES_ORDER :
                    (transObj.type === record.Type.ESTIMATE ? search.Type.ESTIMATE : search.Type.PURCHASE_ORDER);
                var tranId = transObj.getValue('id');
    
                var transLov = search.lookupFields({
                    //1 Unit
                    type: searchType,
                    id: tranId,
                    columns: ['subsidiary']
                });
    
                if (transLov) {
                    subsidiary = transLov.subsidiary[0].value;
                }
            }
           // log.error('subsidiary', subsidiary);
            
            if (subsidiaries.indexOf(subsidiary) == -1) {
            //if ([SUB_FRANCE, SUB_BV, SUB_SARL, SUB_NL, SUB_SP, SUB_POR].indexOf(subsidiary) == -1) {
                //log.error('Returned', [SUB_FRANCE, SUB_BV, SUB_SARL, SUB_NL, SUB_SP, SUB_POR].indexOf(subsidiary));
                return;
            }

            var subsMandatory = ['23','24','41'];//CZ-SK-FIN 20240909
            if(subsMandatory.indexOf(subsidiary) != -1)
            {
                checkDatechFields = true;
            }
    
            var datechVendorIds = getDatechDetails(subsidiary);
          //  log.error('datechVendorIds', datechVendorIds);
            if (subsidiaries.indexOf(subsidiary) > -1 && !datechVendorIds) {
                //Sub : BV,SARL,FR => Need to have the Authorisation record.
                if (subsidiary == subsidiaries[0]) {
                    setErrorMessage(transObj, ["Erreur: Authorisation n'est pas configuré correctement. Veuillez contacter l'administrateur."]);
                } else {
                    setErrorMessage(transObj, ['Error: Authorisation record not configure properly. Please contact the administrator.']);
                }
                return;
            }
          //  log.error('Subs Clear', 'Going');
            if (g_isSalesOrder) {
                var approval = transObj.getValue('orderstatus');
               // log.error('approval', approval);
                var soApproved = approval == SO_PENDING_FULFILLMENT || approval == SO_PENDING_BILLING; //pending fulfillment or pending Billing
                var netSuiteApproval = context.type === context.UserEventType.APPROVE;
    
                //ADD CHECKS FOR ESTIMATES
                var estimateApproval = transObj.getValue('custbody_quote_approval_status');
                var estimateProceed = (estimateApproval == '2');//checkDatechFields && 
              //  log.error('estimateApproval', estimateApproval + ' -- ' + checkDatechFields + ' -- ' + estimateProceed);
    
                if (netSuiteApproval || soApproved || checkDatechFields || estimateProceed) {
                   // log.error('Approved SO', 'Approved SO');
                    //Loops into items to check if atleast 1 item has vendor Datech
                    var itemsArr = getItemsIds(transObj);
                   // log.error('itemsArr', itemsArr);
    
    
                    if (!bbeLib.isNullOrEmpty(itemsArr)) {
                        var searchResult = fetchItemsByIds(itemsArr, true); //10 Units
                        if (searchResult) {
                          //  log.error('searchResult for item', JSON.stringify(searchResult));
                            for (var i = 0; i < searchResult.length; i++) {
                                var itemType = searchResult[i].getValue({
                                    name: 'type',
                                    label: 'Type'
                                });
    
                                if (itemType != 'NonInvtPart') {
                                    continue;
                                }
    
                                var vendorId = searchResult[i].getValue({
                                    name: 'internalid',
                                    join: 'vendor',
                                    label: 'VendorID'
                                });
    
                                if (isDatechVendor(datechVendorIds, vendorId)) {
                                    needDatechValidation = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            } else {
                //for purchase orders
                var approvalStatus = transObj.getValue('approvalstatus');
                if (approvalStatus === PO_APPROVED || checkDatechFields) {
                    //log.error('Approved PO', 'Approved PO');
                    var poVendorId = transObj.getValue('entity');
                    var isSynced = transObj.getValue('custbody_successfully_synced');
                    var isVendorDatech = isDatechVendor(datechVendorIds, poVendorId);
                    needDatechValidation = !isSynced && isVendorDatech;
                }
            }
    
           // log.error('needDatechValidation', needDatechValidation);
            if (needDatechValidation) {
                var msgArr = null;
                //Validating mandatory fields common for all order scenarios
                msgArr = validateDatechFields(transObj);
                if (msgArr.length > 0) {
                    setErrorMessage(transObj, msgArr);
                    return;
                }
    
                //Load common object (Customer and Contact)
                var fieldEndUser = g_isSalesOrder ? 'custbody_end_user' : 'custbody_po_end_user';
               // log.error('fieldEndUser', fieldEndUser);
                var customerId = transObj.getValue(fieldEndUser);
                var contractManagerId = transObj.getValue('custbody_contract_manager_contact');
    
                g_custObj = search.lookupFields({
                    //1 Unit
                    type: search.Type.CUSTOMER,
                    id: customerId,
                    columns: ['custentity_autodesk_csn', 'companyname', 'shipcity']
                });
    
                g_contractManagerObj = search.lookupFields({
                    //1 Unit
                    type: search.Type.CONTACT,
                    id: contractManagerId,
                    columns: ['firstname', 'lastname', 'email']
                });
    
               try {
                    msgArr = validateDatechFieldsPerLine(transObj);
    
                    if (msgArr.length > 0) {
                        setErrorMessage(transObj, msgArr);
                        return;
                    }
               } catch (error) {
                 // log.error('Error',JSON.stringify(error)); 
               }
               
                //No errors
                transObj.setValue({
                    fieldId: 'custbody_datech_missing_fields',
                    value: ''
                });
    
            } //To empty errors if any. It is blocking uses to approve a transaction.
            else {
                var error = transObj.getValue({
                    fieldId: 'custbody_datech_missing_fields'
                });
    
                if (!bbeLib.isNullOrEmpty(error)) {
                    transObj.setValue({
                        fieldId: 'custbody_datech_missing_fields',
                        value: ''
                    });
                }
            }
        }
    
        /**
         * Gets Items id of the transaction
         *
         * @governance 0 unit
         *
         * @param {Record} transObj
         * @return {String[]} msgArr
         */
        function getItemsIds(transObj) {
            var itemsArr = [];
    
            var numItemLines = transObj.getLineCount({
                sublistId: 'item'
            });
    
            for (var i = 0; i < numItemLines; i++) {
                var item = transObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
    
                itemsArr.push(item);
            }
    
            return itemsArr;
        }
    
        /**
         * Gets Items details by the list of IDs
         *
         * @governance 10 Units
         *
         * @param {String[]} - itemIdArr
         * @param {Boolean} fetchVendor
         * @return {Search} - Search object
         */
        function fetchItemsByIds(itemIdArr, fetchVendor) {
            var columnsArr = [
                search.createColumn({
                    name: 'itemid',
                    label: 'Name'
                }),
                search.createColumn({
                    name: 'type',
                    label: 'Type'
                }),
                search.createColumn({
                    name: 'custitem_autodesk_order_type',
                    label: 'custitem_autodesk_order_type'//Autodesk Item Type
                }),
                search.createColumn({
                    name: 'custitem_business_type',
                    label: 'custitem_business_type'//Business Type
                }),
                search.createColumn({
                    name: 'custitem_switch',
                    label: 'custitem_switch'//Switch
                }),
                search.createColumn({
                    name: 'internalid',
                    label: 'internalid'//Internal ID
                }),
                search.createColumn({
                    name: 'custitem_license_type',
                    label: 'custitem_license_type'//License Type
                })
            ];
    
            if (fetchVendor) {
                columnsArr.push(
                    search.createColumn({
                        name: 'internalid',
                        join: 'vendor',
                        label: 'VendorID'
                    })
                );
            }
    
            var filterItemIds = ['internalid', 'anyof'].concat(itemIdArr);
    
            var searchObj = search.create({
                type: record.Type.NON_INVENTORY_ITEM,
                filters: [['type', 'anyof', 'NonInvtPart'], 'AND',
                ['custitem_product_line', 'anyof', AUTODESK_PRODUCT_LINE], 'AND',
                ['custitem_software_product', 'noneof', AUTODESK_FLEX_SOFTPROD, FLEX_SOFTPROD], 'AND',
                ['custitem_autodesk_offering_id','isempty',''], 'AND',
                    filterItemIds],
                columns: columnsArr
            });
    
            var searchResult = bbeLib.getAllSearchResults({
                //10 Units per batch of 1000 records
                search: searchObj
            });
    
            return searchResult;
        }
    
        /**
         * Builds the Object to easily call search result by item id
         *
         * @governance 0 Unit
         *
         * @param {Search} searchResult
         * @return {Object} finalResult
         */
        function buildSearchResultByItem(searchResult) {
            var finalResult = {};
            if (searchResult) {
                for (var i = 0; i < searchResult.length; i++) {
                    var itemName = searchResult[i].getValue({
                        name: 'internalid',
                        label: 'internalid'
                    });
    
                    finalResult[itemName] = searchResult[i];
                }
            }
    
            return finalResult;
        }
    
        /**
         * Sets the transaction into pending approval and add the error messages.
         *
         * @governance 0 units
         *
         * @param {Record} transObj
         * @param {String[]} msgArr
         */
        function setErrorMessage(transObj, msgArr) {
            var pendingApproval = g_isSalesOrder ? SO_PENDING_APPROVAL : PO_PENDING_APPROVAL;
            var targetFieldId = g_isSalesOrder ? 'orderstatus' : 'approvalstatus';
    
            //log.debug('ErrMsg', msgArr.join('.<br>'));
            transObj.setValue({
                fieldId: 'custbody_datech_missing_fields',
                value: msgArr.join('.<br>')
            });
    
           /* Commented by Ilyaad as BV was getting an error 
           transObj.setValue({
                fieldId: targetFieldId,
                value: pendingApproval
            });
            */
        }
    
        /**
         * Validate mandatory fields irrespective of order scenario. i.e. fields which is mandatory for all scenarios
         *
         * @governance 0 units
         *
         * @param {Record} transObj
         * @return {String[]} msgArr
         */
        function validateDatechFields(transObj) {
            var subsidiary = transObj.getValue('subsidiary');
            var msgArr = [];
            var contractManager = transObj.getValue('custbody_contract_manager_contact');
    
            if (!contractManager) {
                //log.debug('Contract Manager', contractManager);
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push("Le champ Contract Manager Contact est obligatoire pour l'intégration avec Datech");
                } else {
                    msgArr.push('The Contract Manager Contact field is mandatory for integration with Datech');
                }
            }
    
            if (!g_isSalesOrder) {
                /* var orderScenario = transObj.getValue('custbody_datech_order_scenario');
    
               if (!orderScenario) {
                    if (subsidiary == subsidiaries[0]) {
                        msgArr.push('Le champ Autodesk Order Scenario est obligatoire.');
                    } else {
                        msgArr.push('Autodesk Order Scenario field is required.');
                    }
                }*///CR MultiScenario
    
                var endUser = transObj.getValue('custbody_po_end_user');
    
                if (!endUser) {
                    if (subsidiary == subsidiaries[0]) {
                        msgArr.push("Le champ Po End User est obligatoire pour l'intégration avec Datech");
                    } else {
                        msgArr.push('The Po End User field is mandatory for integration with Datech');
                    }
                }
            }
    
            //body field validation
            var currency = transObj.getValue('currency');
            if (!currency) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push("Le champ Currency est obligatoire pour l'intégration avec Datech");
                } else {
                    msgArr.push('The Currency field is mandatory for integration with Datech');
                }
            }
    
            //field validation for Deliver to Address - XML section of datech
    
            var shippingAddress = transObj.getSubrecord({
                fieldId: 'shippingaddress'
            });
    
            if (!shippingAddress) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push("Le champ livraison destinataire est obligatoire pour l'intégration avec Datech");
                    return msgArr;
                } else {
                    msgArr.push('The recipient delivery field is mandatory for integration with Datech');
                    return msgArr;
                }
            }
    
            var shipCountry = shippingAddress.getValue('country');
            if (!shipCountry) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push("Le champ Shipping Country est obligatoire pour l'intégration avec Datech");
                } else {
                    msgArr.push('The Shipping Country field is mandatory for integration with Datech');
                }
            }
    
            var shipAddressee = shippingAddress.getValue({
                fieldId: 'addressee'
            });
    
            if (!shipAddressee) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push("Le champ Shipping Company Name est obligatoire pour l'intégration avec Datech");
                } else {
                    msgArr.push('The Shipping Company Name field is required for integration with Datech');
                }
            }
    
            var shipAddress1 = shippingAddress.getValue('addr1');
            var shipAddress2 = shippingAddress.getValue('addr2');
            var finalAddress = !shipAddress1 ? shipAddress2 : shipAddress1; // Not concatenating the values as we only need to check if one of them has values.
            if (!finalAddress) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push("Le champ Shipping Address line 1 ou 2 sont obligatoires pour l'intégration avec Datech");
                } else {
                    msgArr.push('The Shipping Address line 1 or 2 field are required for integration with Datech');
                }
            }
    
            var shipCity = shippingAddress.getValue('city');
            if (!shipCity) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push("Le champ Shipping City est obligatoire pour l'intégration avec Datech");
                } else {
                    msgArr.push('The Shipping City field is mandatory for integration with Datech');
                }
            }
    
            var shipZip = shippingAddress.getValue('zip');
            //log.error('shipZip', shipZip);
            if (validateZipCodes && !shipZip) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push("Le champ Shipping Zip est obligatoire pour l'intégration avec Datech");
                } else {
                    msgArr.push('The Shipping Zip field is mandatory for integration with Datech');
                }
            }
    
    
            if (shipZip && shipZip.length > 10) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push("Le champ Shipping Zip doit avoir moins de 11 caractères pour l'intégration avec Datech");
                } else {
                    msgArr.push('The Shipping Zip field must have less than 11 characters for integration with Datech');
                }
            }
    
            return msgArr;
        }
    
        /**
         * Validate Contract Manager Contact Fields.
         * If there is any missing mandatory fields, It is added to the error array.
         *
         * @governance 0 units
         *
         * @param {String[]} msgArr
         */
        function checkContractManagerFields(msgArr,subsidiary) {
            var firstName = g_contractManagerObj.firstname;
    
            
    
            if (!firstName) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push('Le Contract Manager Contact doit avoir un prénom');
                } else {
                    msgArr.push('The Contract Manager needs to have a first name');
                }
            }
    
            var lastName = g_contractManagerObj.lastname;
            if (!lastName) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push('Le Contract Manager Contact doit avoir un nom de famille');
                } else {
                    msgArr.push('The Contract Manager needs to have a last name');
                }
            }
    
            var email = g_contractManagerObj.email;
            if (!email) {
                if (subsidiary == subsidiaries[0]) {
                    msgArr.push('Le Contract Manager Contact doit avoir un email');
                } else {
                    msgArr.push('The Contract Manager needs an email address');
                }
            }
        }
    
        /**
         * Validate Item's integration field
         *
         * @governance 10 units
         *
         * @param {Record} transObj
         * @param {String} autodeskType
         * @param {String[]} msgArr
         * @param {String[]} additionalFieldsTocheck
         */
        function checkItemType(transObj, autodeskType, msgArr, additionalFieldsTocheck) {
            var isSwtich = false;
            var isNewBusiness = false;
            var itemName = '';
            var checkSwitchItem = false;
            var itemsArr = getItemsIds(transObj);
            var searchResult = fetchItemsByIds(itemsArr, false); //10 Units
            var searchResultByItem = buildSearchResultByItem(searchResult);
            var numItemLines = transObj.getLineCount({
                sublistId: 'item'
            });
            var subsidiary = transObj.getValue('subsidiary');
            
            if (subsidiary != subsidiaries[3] || subsidiary != subsidiaries[4]) {
                for (var i = 0; i < numItemLines; i++) {
                    var checkContractNumber = additionalFieldsTocheck && additionalFieldsTocheck.indexOf(AUTODESK_CONTRACT_NUMBER) >= 0;
                    var checkRenewalNumber = additionalFieldsTocheck && additionalFieldsTocheck.indexOf(RENEWAL_NUMBER) >= 0;
                    var checkSerialNumberToUpdate = additionalFieldsTocheck && additionalFieldsTocheck.indexOf(SERIAL_NUMBER_TO_UPDATE) >= 0;
                    var checkUpgradeFromSerial = additionalFieldsTocheck && additionalFieldsTocheck.indexOf(UPGRADE_FROM_SERIAL) >= 0;
                    checkSwitchItem = additionalFieldsTocheck && additionalFieldsTocheck.indexOf(SWITCH_ITEM) >= 0;
                    var checkAutoDeskTypeByLine = additionalFieldsTocheck && additionalFieldsTocheck.indexOf(DOUBLE_SCENARIO) >= 0;
                    var checkComments = additionalFieldsTocheck && additionalFieldsTocheck.indexOf(COMMENTS) >= 0;
                    var checkSwitchCategory = additionalFieldsTocheck && additionalFieldsTocheck.indexOf(SWITCH_COLLECTION_CATEGORY) >= 0;
    
                    var itemId = transObj.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });
    
                    if (!searchResultByItem[itemId]) {
                        continue;
                    }
    
                    //Also need to by pass the lines not associated with Datech!!!!
    
                    itemName = searchResultByItem[itemId].getValue({
                        name: 'itemid',
                        label: 'Name'
                    });
                    var itemType = searchResultByItem[itemId].getText({
                        name: 'custitem_autodesk_order_type',
                        label: 'Autodesk Item Type'
                    });
    
                    if (checkAutoDeskTypeByLine) {
                        //Check type by line
                        var itemBusinessType = searchResultByItem[itemId].getValue({
                            name: 'custitem_business_type',
                            label: 'Business Type'
                        });
    
                        isNewBusiness = itemBusinessType && itemBusinessType === NEW_BUSINESS;
                        var lineAutodeskType = isNewBusiness ? 'ADSA' : 'ADSR';
    
                        if (itemType !== lineAutodeskType) {
                            msgArr.push('Article : ' + itemName + ' doit être de type Autodesk ' + lineAutodeskType);
                        }
                    } // All line should have same autodesk item type
                    else {
                        if (itemType !== autodeskType) {
                            if (subsidiary == subsidiaries[0]) {
                                msgArr.push('Article : ' + itemName + ' doit être de type Autodesk ' + autodeskType);
                            } else {
                                msgArr.push('Item: ' + itemName + ' must be of type Autodesk ' + autodeskType);
                            }
                        }
                    }
    
                    if (!isSwtich && checkSwitchItem) {
                        isSwtich = searchResultByItem[itemId].getValue({
                            name: 'custitem_switch',
                            label: 'Switch'
                        });
                    }
    
                    if (checkAutoDeskTypeByLine) {
                        //Additional checks based per line
                        if (isNewBusiness) {
                            checkContractNumber = true;
                        } else {
                            checkContractNumber = true;
                            checkRenewalNumber = true;
                            checkSerialNumberToUpdate = true;
                        }
                    }
    
                    if (checkContractNumber) {
                        var autodeskContractNumber = transObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_autodesk_contract_number',
                            line: i
                        });
    
                        if (!autodeskContractNumber) {
                            if (subsidiary == subsidiaries[0]) {
                                msgArr.push('Article : ' + itemName + ' doit avoir le champ (Autodesk Contract Number) rempli');
                            } else {
                                msgArr.push('Item: ' + itemName + ' must have the (Autodesk Contract Number) field filled in');
                            }
                        }
                    }
    
                    if (checkRenewalNumber) {
                        var renewalNumber = transObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_renewal_number',
                            line: i
                        });
    
                        if (!renewalNumber) {
                            if (subsidiary == subsidiaries[0]) {
                                msgArr.push('Article : ' + itemName + ' doit avoir le champ (Renewal Number) rempli');
                            } else {
                                msgArr.push('Item: ' + itemName + ' must have the (Renewal Number) field filled in');
                            }
                        }
                    }
    
                    if (checkSerialNumberToUpdate) {
                        var serialNumberToUpdate = transObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_serial_number_to_be_updated',
                            line: i
                        });
    
                        if (!serialNumberToUpdate) {
                            if (subsidiary == subsidiaries[0]) {
                                msgArr.push('Article : ' + itemName + ' doit avoir le champ (Serial Number To Be Updated) rempli');
                            } else {
                                msgArr.push('Item: ' + itemName + ' must have the (Serial Number To Be Updated) field filled in');
                            }
                        }
                    }
    
                    if (checkUpgradeFromSerial) {
                        var upgradeFromSerial = transObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_upgrade_from_serial_number',
                            line: i
                        });
    
                        if (!upgradeFromSerial) {
                            if (subsidiary == subsidiaries[0]) {
                                msgArr.push('Article : ' + itemName + ' doit avoir le champ (Upgrade From Serial Number) rempli');
                            } else {
                                msgArr.push('Item: ' + itemName + ' must have the field (Upgrade From Serial Number) filled in');
                            }
                        }
                    }
    
                    if (!checkSwitchItem) {
                        //Not switch scenario, thus items must not be switch as it will be identified as switch on Datech's end
                        var isItemSwtich = searchResultByItem[itemId].getValue({
                            name: 'custitem_switch',
                            label: 'Switch'
                        });
    
                        if (isItemSwtich) {
                            if (subsidiary == subsidiaries[0]) {
                                msgArr.push('Article : ' + itemName + ' ne doit pas être un article (Swtich <M2S>)');
                            } else {
                                msgArr.push('Item : ' + itemName + ' should not be of type switch.');
                            }
                        }
                    }
    
                    if (checkComments) {
                        var comments = transObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_autodesk_comments',
                            line: i
                        });
    
                        if (!comments) {
                            if (subsidiary == subsidiaries[0]) {
                                msgArr.push('Article : ' + itemName + ' doit avoir le champ (Commentaires) rempli');
                            } else {
                                msgArr.push('Item : ' + itemName + ' must have the field (Comments) filled in.');
                            }
                        }
                    }
    
                    if (checkSwitchCategory) {
                        var itemLicenseType = searchResult[i].getValue({
                            name: 'custitem_license_type',
                            label: 'License Type'
                        });
    
                        if (
                            !itemLicenseType &&
                            itemLicenseType != SUBSCRIPTION_SWITCH_FROM_CATEGORY_1 &&
                            itemLicenseType != SUBSCRIPTION_SWITCH_FROM_CATEGORY_2
                        ) {
                            if (subsidiary == subsidiaries[0]) {
                                msgArr.push('Article : ' + itemName + ' doit avoir un license du type switch to collection.');
                            } else {
                                msgArr.push('Item: ' + itemName + ' must have a license type for type switch to collection.');
                            }
                        }
                    }
                }
    
                if (checkSwitchItem && !isSwtich) {
                    if (subsidiary == subsidiaries[0]) {
                        msgArr.push('Au moins un article doit être de type (Switch <M2S>)');
                    } else {
                        msgArr.push('At least one article must be of type (Switch <M2S>)');
                    }
                }
            }
        }
    
         /**
         * Validate Datech Fields per line
         * If there is any missing mandatory fields, It is added to the error array.
         *
         * @governance 0 units
         *
         * @param {String[]} msgArr
         */
          function validateDatechFieldsPerLine(transObj) {
           // log.error('validateDatechFieldsPerLine');
            var msgArr = [];
            var itemsArr = getItemsIds(transObj);
            var searchResult = fetchItemsByIds(itemsArr, false); //10 Units
            var searchResultByItem = buildSearchResultByItem(searchResult);
            var subsidiary = transObj.getValue('subsidiary');
            var orderType = null;
            
            var numItemLines = transObj.getLineCount({
                sublistId: 'item'
            });
            //TODO check if CZ errors are launched
            for (var i = 0; i < numItemLines; i++) {
                
                var itemId = transObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
               // log.error('item', i + ' -- '+itemId);
    
                if (!searchResultByItem[itemId]) {//Non Autodesk Item
                    continue;
                }
                var itemName = searchResultByItem[itemId].getValue({
                    name: 'itemid',
                    label: 'itemid'
                });
                var lineOrder = transObj.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_datech_order_scenario',
                    line: i
                });
    
                if(!g_isSalesOrder && orderType == null)
                {
                    orderType = lineOrder;
                  //  log.error('PO Order Value' + i, lineOrder);
                }
    
               // log.error('item Order' + i, lineOrder);
    
                if(!lineOrder)
                {
                    if (subsidiary == subsidiaries[0]) {
                        msgArr.push('Article : ' + itemName + ' doit être associé à un scénario de commande Datech sur la ligne');
                    } else {
                        msgArr.push('Item: ' + itemName + ' must be associated with a Datech order scenario on the line');
                    }
                    continue;
                }
    
                if(orderType && orderType != lineOrder)
                {
                    msgArr = [];//to avoid first line being validated and error message showing
                    if (subsidiary == subsidiaries[0]) {
                        msgArr.push('Tous les articles Autodesk doivent avoir le même scénario de commande Datech');
                    } else {
                        msgArr.push('All the Autodesk items should have the same Datech order scenario');
                    }
                    continue;
                }
    
                msgArr = validateDatechFieldsPerLineScenario(transObj,i,lineOrder,searchResultByItem,msgArr);
    
            }
    
            return msgArr;
    
          }
    
          /**
         * Validate Datech Fields per line
         * If there is any missing mandatory fields, It is added to the error array.
         *
         * @governance 0 units
         *
         * @param {String[]} msgArr
         */
           function validateDatechFieldsPerLineScenario(transObj,lineId,orderScenario,searchResultByItem,msgArr) {
            
            var subsidiary = transObj.getValue('subsidiary');
            var ADSA = 1;
            var ADSR = 5;
    
            var itemsArr = getItemsIds(transObj);
            var searchResult = fetchItemsByIds(itemsArr, false); //10 Units
            var searchResultByItem = buildSearchResultByItem(searchResult); 
             
    
            var itemId = transObj.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: lineId
            });
    
            //log.error('searchResultByItem[itemId] 1',JSON.stringify(searchResultByItem[itemId]));
    
            var itemName = searchResultByItem[itemId].getValue({
                name: 'itemid',
                label: 'itemid'
            });
    
            /*var itemVal = 'itemid';
            var item2 = searchResultByItem[itemId].getValue({
                name: itemVal,
                label: itemVal
            });*/
    
           // log.error('itemName', itemName);
            //log.error('itemName', item2);
    
    
            /**
             * Set the order scenario based on user inputs.
             * Order Scenarios :
             * 1 - NEW SUBSCRIPTION FOR NEW CUSTOMER
             * 2 - NEW SUBSCRIPTION FOR EXISTING CUSTOMER
             * 3 - NEW SUBSCRIPTION TO ADD TO EXISTING CONTRACT
             * 4 - ADD SEAT TO CONTRACT
             * 5 - MAINTENANCE TO SUBSCRIPTION SWITCH (M2S)
             * 6 - SUBSCRIPTION RENEWAL OR MAINTENANCE PLAN RENEWAL
             * 7 - Adding a New item to a Renewal order [SUBSCRIPTION RENEWAL OR MAINTENANCE PLAN RENEWAL and NEW SUBSCRIPTION TO ADD TO EXISTING CONTRACT]
             * 8 - CO-TERMING - EXTENSIONS
             * 9 - SWITCH TO COLLECTION (UPGRADE)
             * 10 - MULTI-USER TRADE-IN
             */
           // log.error('lineId - orderScenario',lineId + ' -- '+ orderScenario);
             var datechError =  {'body':{'shipaddress': ["L'utilisateur final (End User) doit avoir un adresse d'expédition",'End User must have a shipping address'],
                                            'shipzip': ["L'utilisateur final (End User) doit avoir un postal code associé à l'adresse",'The End User must have a postal code associated with the address'],
                                            'shipcountry': ["L'utilisateur final (End User) doit avoir un pays associé à l'adresse",'The End User must have a country associated with the address']},
                                'customer':{'custentity_autodesk_csn_false':["L'utilisateur final (End User) ne doit pas disposer d'Autodesk CSN","End User must not have Autodesk CSN"],
                                            'custentity_autodesk_csn_true':["L'utilisateur final (End User) doit disposer d'Autodesk CSN","End User must have an Autodesk CSN"],
                                            'companyname': ["L'utilisateur final (End User) doit avoir un dénomination sociale",'The End User must have a company name'],
                                            'shipcity': ["L'utilisateur final (End User) doit avoir une ville associé à l'adresse",'The End User must have a city associated with the address']},
                                'item':{'custitem_autodesk_order_type_1':['Article : itemName? doit être de type Autodesk lineAutodeskType?','Item : itemName? should be of type lineAutodeskType?'],
                                        'custitem_autodesk_order_type_5':['Article : itemName? doit être de type Autodesk lineAutodeskType?','Item : itemName? should be of type lineAutodeskType?'],
                                        'custitem_license_type':['Article : itemName? doit avoir un license du type switch to collection.','Item: itemName? must have a license type for type switch to collection.'],
                                        'custitem_switch_true':['Au moins un article doit être de type (Switch <M2S>)','At least one article must be of type (Switch <M2S>)']},
                                'line':{'custcol_autodesk_contract_number':['Article : itemName? doit avoir le champ (Autodesk Contract Number) rempli','Item: itemName? must have the (Autodesk Contract Number) field filled in'],
                                        'custcol_serial_number':['Article : itemName? doit avoir le champ (Serial Number) rempli','Item: itemName? must have the (Serial Number) field filled in'],
                                        'custcol_renewal_number':['Article : itemName? doit avoir le champ (Renewal Number) rempli','Item: itemName? must have the (Renewal Number) field filled in'],
                                        'custcol_autodesk_comments':['Article : itemName? doit avoir le champ (Commentaires) rempli','Item : itemName? must have the field (Comments) filled in.']
                                    }};
            //var errMsg = datechError[fields[i]][errorField];
            // {'body':[],'customer':[],'item':[],'contractManager':true}
            var datechFieldValidation = {
                1 : {'body':['shipaddress','shipzip','shipcountry'],
                                'line':[],
                                'customer':[{'custentity_autodesk_csn':false},'companyname','shipcity'],
                                'item':[{'custitem_autodesk_order_type':ADSA}], 
                                'contractManager':true},//NEW SUBSCRIPTION FOR NEW CUSTOMER
                 2 : {'body':[],
                 'line':[],
                 'customer':[{'custentity_autodesk_csn':true}],
                 'item':[{'custitem_business_type':ADSA}], 
                 'contractManager':true},//NEW SUBSCRIPTION FOR EXISTING CUSTOMER
                 3 : {'body':[],
                 'line':['custcol_autodesk_contract_number'],
                 'customer':[{'custentity_autodesk_csn':true}],
                 'item':[{'custitem_autodesk_order_type':ADSA}], 
                 'contractManager':true},// NEW SUBSCRIPTION TO ADD TO EXISTING CONTRACT
                 7 : {'body':[],
                 'line':['custcol_autodesk_contract_number','custcol_serial_number'],//CR Harmonize serial to upd (SerialNumberToBeUpdated)
                 'customer':[{'custentity_autodesk_csn':true}],
                 'item':[{'custitem_autodesk_order_type':ADSA}]},// ADD SEAT TO CONTRACT
                 5 : {'body':[],
                 'line':['custcol_autodesk_contract_number','custcol_renewal_number','custcol_serial_number'],//CR Harmonize Upgrade (UpgradeFromSerialNumber)
                 'customer':[{'custentity_autodesk_csn':true}],
                 'item':[{'custitem_autodesk_order_type':ADSA},{'custitem_switch':true}], 
                 'contractManager':true},// SWITCH OR MULTI-USER TRADE IN
                 6 : {'body':[],
                 'line':['custcol_autodesk_contract_number','custcol_renewal_number','custcol_serial_number'],//CR Harmonize serial to upd (SerialNumberToBeUpdated)
                 'customer':[{'custentity_autodesk_csn':true},'companyname'],
                 'item':[{'custitem_autodesk_order_type':ADSR}]},// Renewal
                 8 : {'body':[],
                 'line':['custcol_autodesk_contract_number','custcol_serial_number','custcol_autodesk_comments'],//CR Harmonize serial to upd (SerialNumberToBeUpdated)
                 'customer':[{'custentity_autodesk_csn':true}],
                 'item':[{'custitem_autodesk_order_type':ADSR}]},//CO-TERMING
                 9 : {'body':[],
                 'line':['custcol_autodesk_contract_number','custcol_serial_number'],//CR Harmonize upgrade from
                 'customer':[{'custentity_autodesk_csn':true}],
                 'item':[{'custitem_autodesk_order_type':ADSA},{'custitem_license_type':[SUBSCRIPTION_SWITCH_FROM_CATEGORY_1,SUBSCRIPTION_SWITCH_FROM_CATEGORY_2]}]},
                 //SWITCH TO COLLECTION UPGRADE (UpgradeFromSerialNumber)
    
                 //CASE WHEN  {custbody_datech_order_scenario} = 'Co-terming/Extensions' THEN TO_CHAR({custcol_swe_contract_end_date},'YYYYMMDD') ELSE '' END
                 //SerialNumberToBeUpdated
                 //UpgradeFromSerialNumber
           }; 
    
            var orderValidationObj = datechFieldValidation[orderScenario];
          //  log.error('orderValidationObj',JSON.stringify(orderValidationObj));
    
                var fields = Object.keys(orderValidationObj);
               // log.error('Fields >>', JSON.stringify(fields));
                for(var i=0;i<fields.length;i++) 
                {
                    //log.error('Starting Validations >>',fields[i]);
                    var level = orderValidationObj[fields[i]];
                    if(typeof level == 'object' && level.length > 0)
                    {
                        for(var j=0;j<level.length;j++)
                        {
                            var fieldName = null;
                            if(typeof level[j] == 'object')//specific values
                            {
                                var subFields = Object.keys(level[j]);
                                for(var k=0;k<subFields.length;k++) 
                                {
                                    var tmpValue = null;
                                    var autodeskType = null;
                                    var intendedValue = level[j][subFields[k]];
                                  //  log.error('Specific fields ',fields[i] + '--'+ subFields + '--' + level[j][subFields[k]]);
                                 
                                    if(fields[i] == 'customer')
                                    {
                                        tmpValue = g_custObj[subFields];
                                    }
                                    else if (fields[i] = 'item')
                                    {
                                        //log.error('itemId',itemId +'--'+subFields+'--'+subFields[k]);
    
                                        tmpValue = searchResultByItem[itemId].getValue({
                                            name: subFields[k],
                                            label : subFields[k]
                                        });
    
                                       // log.error('tmpValue',JSON.stringify(tmpValue));
                                    }
    
                                    if(typeof intendedValue != 'object')
                                    {
                                      //  log.error('Simple Value',tmpValue +  '--'+ intendedValue);
                                        var isError = false;
                                        //Checking if value is set or not
                                        if(intendedValue == true)
                                        {
                                           // log.error('Need Value',subFields);
                                            
                                            if(!tmpValue)
                                            {
                                                isError = true;
                                            }
    
                                        }
                                        else if(intendedValue == false)
                                        {
                                           // log.error('Does not need Value',subFields);
    
                                            if(tmpValue)
                                            {
                                                isError = true;
                                            }
                                        }
                                        else{
                                            if( tmpValue != intendedValue)
                                            {
                                                isError = true;
                                                autodeskType = intendedValue;
                                            }
                                        }
    
                                        if(isError)
                                        {
                                            var errorField = subFields+'_'+ intendedValue;
                                           // log.error('Error Field : ',fields[i] +'--'+errorField);
                                            var errMsg = datechError[fields[i]][errorField];
                                            errMsg =  (subsidiary == subsidiaries[0]) ? errMsg[0]: errMsg[1];
                                            if(errMsg.indexOf('itemName?') > 0 || errMsg.indexOf('lineAutodeskType?'))
                                            {
                                                errMsg = errMsg.replace('itemName?',itemName);
                                                errMsg = errMsg.replace('lineAutodeskType?',autodeskType);
                                            }
                                            msgArr.push(errMsg);
    
                                          //  log.error('Error',errorField + ' -- ' + errMsg);
                                        }
                                       
                                    }
                                    else //array of values
                                    {
                                       // log.error('Array of values',tmpValue +  '--'+ JSON.stringify(intendedValue));
                                        if( intendedValue.indexOf(tmpValue) < -1)
                                        {
                                            var errorField = subFields+'_'+ intendedValue;
                                            var errMsg = datechError[fields[i]][errorField];
                                            errMsg =  (subsidiary == subsidiaries[0]) ? errMsg[0]: errMsg[1];
                                            if(errMsg.indexOf('itemName?') > 0 || errMsg.indexOf('lineAutodeskType?'))
                                            {
                                                errMsg = errMsg.replace('itemName?',itemName);
                                                errMsg = errMsg.replace('lineAutodeskType?',autodeskType);
                                            }
                                            msgArr.push(errMsg);
    
                                           // log.error('Error',errorField + ' -- ' + errMsg);
                                        }
                                    }
                                }
                            }
                            else{//mandatory fields
                               
                                var tmpValue = null;
    
                                if(fields[i] == 'customer')
                                {
                                // g_custObj.custentity_autodesk_csn; g_custObj.shipcity; g_custObj.companyname;
                                    tmpValue = g_custObj[level[j]];
                                }
                                else if(fields[i] == 'body')
                                {
                                    tmpValue = transObj.getValue(level[j]);
                                }
                                else if (fields[i] == 'line')
                                {
                                    tmpValue = transObj.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: level[j],
                                        line: lineId
                                    });
                                }
                               // log.error('Mandatory Fields',fields[i] + '--' + level[j] + '--' + tmpValue );
                                if(!tmpValue)
                                {
                                    var errMsg = datechError[fields[i]][level[j]];
                                    errMsg =  (subsidiary == subsidiaries[0]) ? errMsg[0]: errMsg[1];
                                    if(errMsg.indexOf('itemName?') > 0 || errMsg.indexOf('lineAutodeskType?'))
                                    {
                                        errMsg = errMsg.replace('itemName?',itemName);
                                        errMsg = errMsg.replace('lineAutodeskType?',autodeskType);
                                    }
                                    msgArr.push(errMsg);
                                    //log.error('Error',errorField + ' -- ' + errMsg);
                                }
                            }
                        }
                    }
                    else {
                      //  log.error('ELSE ', fields[i]);
                        if(fields[i] == 'contractManager')
                        {
                         //   log.error('Validating Contract Manager');
                            checkContractManagerFields(msgArr,subsidiary);
                        }
                    }
                }
    
               // log.error('msgArr',JSON.stringify(msgArr));
                return msgArr;
            }
    
    
        return {
            beforeLoad: beforeLoad_showMissingMandatoryFields,
            beforeSubmit: beforeSubmit_validateDatechFields
        };
    });