/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/ui/serverWidget', 'N/search'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{serverWidget} serverWidget
 * @param{search} search
 * 
 * The purpose of this script is manipulate the closed date field in such a way that:
 * - It's added to the UI by default, and it's pulled from the database
 * - It helps to update the set expected close date field on the estimate record when the status of the estimate is "Closed / won" or "Closed / lost"
 */
    (log, record, serverWidget, search) => {

        const LIST_OF_FINALIZED_STAGES = [{
            status: "Closed / won",
            correspondingID: 135
        }, {
            status: "Closed / lost",
            correspondingID: 136
        }]

        /**
         * The purpose of this function is to fetch the estimate data from the database
         * 
         * @param {number} estimateId
         * @returns {Object} estimateData
         * @governance 10 units
         */
        const fetchEstimateData = async (type, estimateId) => {
            // First of all, get the closed date value of the estimate
            // Spends 10 unit (Because of the getRange method)
            const estimateSearch = await search.create.promise({
                type: "transaction",
                filters:
                [
                    ["type","anyof", "Estimate" ], 
                    "AND", 
                    ["internalid","is", estimateId.toString()], 
                ],
                columns:
                    [
                    search.createColumn({name: "statusref", label: "Status"}), // Status of the estimate document : Processed, Pending, ...
                    search.createColumn({name: "closedate", label: "Date Closed"}), // Date when the estimate went from "Pending" to "Processed"
                    search.createColumn({name: "entitystatus", label: "Estimate Status"}) // stage of the estimate : Closed / won, Closed / lost, ...
                ]
            })
            const estimateData = await estimateSearch.run().getRange.promise(0, 1);
            return estimateData
        }

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         * 
         * The purpose of this function is to add the closed date field to the estimate record
         * @governance 10 units
         */
        const beforeLoad = async (scriptContext) => {
            const { form, newRecord } = scriptContext
            const { type } = newRecord

            try {

                if(newRecord.id){
                    // First of all, get the closed date value of the estimate
                    // @governance 10 units
                    const estimateData = await fetchEstimateData(type, newRecord.id)

                    // If the estimate is found
                    if(estimateData.length != 0){

                        // Then get the value of the closed date
                        const closedDate = estimateData[0].getValue("closedate")

                        // If the close date value is empty, hide him
                        if(closedDate !== "" && closedDate !== null){
                            // Create the field "Closed Date" on the estimate record
                            const closed_date_field = form.addField({
                                id: 'custpage_closed_date',
                                label: 'CLOSED DATE',
                                type: serverWidget.FieldType.DATE,
                                isDisabled: true,
                            })

                            // Set it as the value of the closed date
                            newRecord.setValue({
                                fieldId: 'custpage_closed_date',
                                value: closedDate,
                            })

                            // Making sure that this field appears on top of the field "validity date"
                            form.insertField({
                                field: closed_date_field,
                                nextfield: 'custbody_validity_date',
                            })
                        }
                    }  
                }
            } catch (e) {
                log.error({
                    title: "Error from file ARKA_SUE_SetExpectedCloseDateFieldOnEstimate",
                    details: {
                        error: e
                    }
                })
            }
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         * 
         * The purpose of this function is to set the expected close date field to the closed date field
         * if the status of the estimate is "Closed / won" or "Closed / lost"
         * We need to do this in the afterSubmit because, it's only after the netsuite processing of the selection of the stage
         * That the field "closedate" is available on the estimate record
         * So pay attention to the fact that the same record needs to be loaded separately, and updated also
         * As the newRecord Object is not editable
         * 
         * @governance 20 units
         */
        const afterSubmit = async (scriptContext) => {
            try {
                const { newRecord } = scriptContext
                const { type } = newRecord

                // Fetch the estimate data
                // @governance 10 units
                const estimateData = await fetchEstimateData(type, newRecord.id)

                // If the estimate is found
                if(estimateData.length != 0){

                    // Get the status of the estimate
                    const stage = estimateData[0].getValue("entitystatus")

                    // If the stage is among the list of finalized stages
                    const isFinalizedStage = LIST_OF_FINALIZED_STAGES.some(availableStage => availableStage.correspondingID === parseInt(stage))    
                    if(isFinalizedStage){
                        // Get the closed date
                        const closedDate = estimateData[0].getValue("closedate")

                        // Load & save the record at the same time, as
                        // the newRecord is not editable
                        // @governance 10 units
                        await record.submitFields.promise({
                            type: type,
                            id: newRecord.id,
                            values: {
                                expectedclosedate: closedDate // Set the value of the expected close date to the closed date
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields : true
                            }
                        })
                    }
                }
            } catch (e) {
                log.error({
                    title: "Error from file ARKA_SUE_SetExpectedCloseDateFieldOnEstimate",
                    details: {
                        error: e
                    }
                })
            }
    }

    return {beforeLoad, afterSubmit}
});
