/**
 * @NApiVersion 2.1
 * @NScriptType Workflowactionscript
 */
define(['N/record', 'N/search', './BBE_LIB_GenericFunctionsSS2.js', 'N/transaction'], function (record, search, bbeLib, transaction) {

    
    function updateContractLink(contractID, estimateID){

        var isOkay = false;

        var contractRec = record.load({
            type: 'customrecord_contracts',
            id: contractID,
            isDynamic: false
        });

        contractRec.setValue({
            fieldId: 'custrecord_contract_renewal_tran',
            value: estimateID,
            ignoreFieldChange: true
        });

        contractRec.setValue({
            fieldId: 'custrecord_contract_status',
            value: 6,
            ignoreFieldChange: true
        });

        contractRec.save();

        isOkay = true;

        return isOkay;
    }
    
    function getOtherEstimate(contractTerm, contractID) {

        var estimateID = -1;

        var estimateSearchObj = search.create({
            type: "estimate",
            filters:
                [
                    ["type", "anyof", "Estimate"],
                    "AND",
                    ["custbody_swe_from_contract", "anyof", contractID],
                    "AND",
                    ["custbody_order_type", "anyof", "2"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["custbody_tran_term_in_months", "notequalto", contractTerm]
                ],
            columns:
                [
                    search.createColumn({name: "internalid", label: "Internal ID"}),
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "trandate", label: "Date" }),
                    search.createColumn({ name: "entity", label: "Name" }),
                    search.createColumn({ name: "custbody_tran_term_in_months", label: "Contract Term" }),
                    search.createColumn({ name: "custbody_swe_from_contract", label: "From Contract" })
                ]
        });
        estimateSearchObj.run().each(function (result) {
            estimateID = result.getValue({
                name: 'internalid'
            });
        });

        return estimateID;
    }

    function onAction(scriptContext) {

        try {

            var contract_term = scriptContext.newRecord.getValue('custbody_tran_term_in_months');
            var contractID = scriptContext.newRecord.getValue('custbody_swe_from_contract');
            var createdFrom = scriptContext.newRecord.getValue('createdfrom');
            var estimateID = scriptContext.newRecord.id;

            if(!bbeLib.isNullOrEmpty(createdFrom)){
                estimateID = createdFrom;
            }

            var estimateToBeVoided = -1;
            
            if (contract_term == 12 && (!bbeLib.isNullOrEmpty(contractID))) {
                
                estimateToBeVoided = getOtherEstimate(contract_term, contractID);

                log.debug({
                    title: 'Data',
                    details: 'Estimate ' + estimateToBeVoided + ' , Contract ID: ' + contractID
                });

                transaction.void({
                    type: transaction.Type.ESTIMATE,
                    id: estimateToBeVoided
                });

                log.debug({
                    title: 'Contract Info',
                    details: 'Estimate 3Yr('+ estimateToBeVoided +') voided and No contract update needed'
                });

            }

            if (contract_term == 36 && (!bbeLib.isNullOrEmpty(contractID))) {

                var isContractUpdate = updateContractLink(contractID, estimateID);
                
                if(isContractUpdate){

                    estimateToBeVoided = getOtherEstimate(contract_term, contractID);

                    log.debug({
                        title: 'Data',
                        details: 'Estimate ' + estimateToBeVoided + ' , Contract ID: ' + contractID
                    });

                    transaction.void({
                        type: transaction.Type.ESTIMATE,
                        id: estimateToBeVoided
                    });

                    log.debug({
                        title: 'Contract Info',
                        details: 'Estimate 1Yr voided and contract updated'
                    });

                }else{

                    log.debug({
                        title: 'Contract Info',
                        details: 'Contract was not updated'
                    });

                }

            }

            if(estimateToBeVoided != -1){

                var estimateToBeVoidedRec = record.load({
                    type: record.Type.ESTIMATE,
                    id: estimateToBeVoided
                });

                estimateToBeVoidedRec.setValue({
                    fieldId: 'entitystatus',
                    value: 14
                });

                estimateToBeVoidedRec.save();

            }

            return 1;
        }
        catch (e) {

            log.debug({ title: 'Fail to Delete Estimate: ', details: e });
            return 0;

        }


    }
    return {
        onAction: onAction
    };

});