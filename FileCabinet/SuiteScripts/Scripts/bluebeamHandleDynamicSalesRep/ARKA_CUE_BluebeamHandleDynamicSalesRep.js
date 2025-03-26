/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/log',  
    'N/ui/message', 
    'N/runtime',
],
/**
 * @param{log} log
 * @param{ui/message} message
 * @param{runtime} runtime
 * 
 * The purpose of this script is to handle selection of the right sales rep for a customer when a new
 * opportunity, estimate or sales order is created.
 * 
 * The script will get all the sales reps associated to the customer, and then:
 * - If there's no "sales rep - bluebeam" associated to the customer, the script will attribute that current user connected to be the default sales rep
 *   and consider him as primary
 * - If there's a "sales rep - bluebeam" associated to the customer but it's not selected as primary, the script will switch the sales rep for him 
 *   and consider him as primary
 * 
 */
function(log, message, runtime) {

    let SALES_REP_COLUMNS_IN_OPPORTUNITY = {
        "employee": -100,
        "salesrole": -100,
        "isprimary": true, // Default is primary
        "contribution": 100 // Default contribution set to 100%
    }
    const BLUEBEAM_SALES_ROLE_SANDBOX = String(11)
    const BLUEBEAM_SALES_ROLE_PRODUCTION = String(11)

    // Function to set the isPrimary and contribution fields for a sales rep depending on the field we prioritized
    
    // @governance none
    const setIsPrimaryAndContributionSalesRep = (salesRepData, currentRecord, salesRepColumns, primaryLine = -1) => {
        // Process:
        // If the primaryLine is -1, it means that we need to delete all the sales rep lines
        // Else:
        // Isolate (Filter) the salesRepData array to get only the sales rep line that we need to set as primary
        // Then delete everything
        // Then add the new primary line
        // The reason why we need to do this is because when we delete lines by default, the line number changes dynamically
        // So we "loose track" of which line was the primary one
        
        // Delete all the sales rep lines (whatever the case)
        // Note that doing this operation doesn't have any impact on the salesRepData array
        for(let i = salesRepData.length - 1; i >= 0; i--) {
            currentRecord.removeLine({
                sublistId: "salesteam",
                line: i
            })
        }

        // If the primaryLine is not -1, it means that we need to set the new primary line
        if(primaryLine !== -1) {
            // Isolate (Filter) the salesRepData array to get only the sales rep line that we need to set as primary
            const salesRepLineToSetAsPrimary = salesRepData.find(salesRepLine => salesRepLine["line"] === primaryLine)

            // add the new primary line
            currentRecord.selectNewLine({
                sublistId: "salesteam"
            })
            // Note that we already "prepared" the sales rep data in SALES_REP_COLUMNS_IN_OPPORTUNITY
            // So we just needed to populate these values in order to add him in the sublist as the default sales rep
            for(const column of salesRepColumns) {
                currentRecord.setCurrentSublistValue({
                    sublistId: "salesteam",
                    fieldId: column,
                    // Force as well the isprimary and contribution fields to be true and 100 respectively
                    value: column === "isprimary" ? true : column === "contribution" ? 100 : salesRepLineToSetAsPrimary[column],
                    forceSyncSourcing: true
                })
            }
            currentRecord.commitLine({
                sublistId: "salesteam"
            })
        }
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     * 
     */
    const postSourcing = async (scriptContext) => {
        const { currentRecord, fieldId } = scriptContext
        const { ERROR } = message.Type
        const { SANDBOX } = runtime.EnvType
        const employeeId = runtime.getCurrentUser().id

        // Load the SO total amounts saved in the current session
        const currentSession = runtime.getCurrentSession()
        const isBlueBeamSalesConnected = currentSession.get({
            name: "isBluebeamSalesRep"
        })
        const errorWhenFetchingEmployeeClass = currentSession.get({
            name: "errorWhenFetchingEmployeeClass"
        })

        //  New requirement: 
        //  - If a bluebeam user is connected, remove automatically the "Non bluebeam" sales rep associated with the transaction
        //  - If a non bluebeam user is connected, remove automatically the "bluebeam" sales rep associated with the transaction
        //  - This script needs to be deployed in estimates, sales order as well

        // Only go further if the current user connected has a "bluebeam" sales role
        // Else, return a custom message redirecting to a potential error in the ARKA_SUE_BluebeamHandleDynamicSalesRep script
        if(isBlueBeamSalesConnected === 'Y' || isBlueBeamSalesConnected === 'N') {

            // Select the right bluebeam sales role based on the environment
            let bluebeamSalesRole;
            if(runtime.envType === SANDBOX) {
                bluebeamSalesRole = BLUEBEAM_SALES_ROLE_SANDBOX
            }
            else {  
                bluebeamSalesRole = BLUEBEAM_SALES_ROLE_PRODUCTION
            }
        
            // Populate the sales rep sublist with the sales rep already connected and with the right sales role
            SALES_REP_COLUMNS_IN_OPPORTUNITY["salesrole"] = bluebeamSalesRole
            SALES_REP_COLUMNS_IN_OPPORTUNITY["employee"] = employeeId

            // Aggregate the columns list we want to pull data from
            const salesRepColumns = Object.keys(SALES_REP_COLUMNS_IN_OPPORTUNITY)

            try {
                // If the field changed is "Bill to customer" or "Company", it means that we're in the opportunity form
                if(fieldId === "entity") {
                    // Get the list of all sales reps associated to the customer
                    const listAllSublists = currentRecord.getLineCount({
                        sublistId: "salesteam"
                    })
                    const salesRepEmployees = []
                    // Just append all data related to sales rep loaded from a customer
                    for(let i = 0; i < listAllSublists; i++) {
                        const salesRepData = {}
                        for(const column of salesRepColumns) {
                            salesRepData[column] = currentRecord.getSublistValue({
                                sublistId: "salesteam",
                                fieldId: column,
                                line: i
                            })
                            salesRepData["line"] = i
                        }
                        salesRepEmployees.push(salesRepData)
                    }

                    // Check if there's a bluebeam sales rep associated to the transaction
                    const hasSalesRepBluebeam = salesRepEmployees.some(indivSalesRep => indivSalesRep["salesrole"] === bluebeamSalesRole)

                    // Depending on which user class is connected, make the neccessary actions related to the sales rep
                    if(isBlueBeamSalesConnected === 'Y') {

                        // If a bluebeam user is connected, remove automatically the "Non bluebeam" sales rep associated with the transaction (if any)
                        if(!hasSalesRepBluebeam) {
                            // Delete first all other sales reps
                            setIsPrimaryAndContributionSalesRep(
                                salesRepEmployees, 
                                currentRecord, 
                                salesRepColumns,
                                -1 // To delete all other sales reps as per the new requirements above
                            )

                            // Add a new line for the current user
                            currentRecord.selectNewLine({
                                sublistId: "salesteam"
                            })
                            // Note that we already "prepared" the sales rep data in SALES_REP_COLUMNS_IN_OPPORTUNITY
                            // So we just needed to populate these values in order to add him in the sublist as the default sales rep
                            for(const column of salesRepColumns) {
                                currentRecord.setCurrentSublistValue({
                                    sublistId: "salesteam",
                                    fieldId: column,
                                    value: SALES_REP_COLUMNS_IN_OPPORTUNITY[column],
                                    forceSyncSourcing: true
                                })
                            }
                            currentRecord.commitLine({
                                sublistId: "salesteam"
                            })
                        }
                        else { // make sure to set up the "first" detected bluebeam sales rep as primary with 100% contribution
                            const selectedBlueBeamSalesRep = salesRepEmployees
                                .filter(rep => rep.salesrole === bluebeamSalesRole) // To get only bluebeam sales roles
                                .sort((a, b) => b.contribution - a.contribution)[0]; // To sort by the highest contribution and only extract the first one

                            // Select the bluebeam sales rep line of the sales rep
                            const bluebeamSalesRepLine = selectedBlueBeamSalesRep["line"]
    
                            // Set the isPrimary and contribution fields for the bluebeam sales rep
                            // While removing all other sales reps
                            setIsPrimaryAndContributionSalesRep(
                                salesRepEmployees, 
                                currentRecord, 
                                salesRepColumns,
                                bluebeamSalesRepLine
                            )
                        }
                    }
                    // If a non bluebeam sales rep is connected, remove automatically the "bluebeam" sales rep associated with the transaction
                    else if(isBlueBeamSalesConnected === 'N') {
                        if(hasSalesRepBluebeam) {
                            for(const salesRepEmployee of salesRepEmployees) {
                                if(salesRepEmployee["salesrole"] === bluebeamSalesRole) {
                                    // Delete the bluebeam sales rep
                                    currentRecord.removeLine({
                                        sublistId: "salesteam",
                                        line: salesRepEmployee["line"]
                                    })
                                }
                            }
                        }
                    }
                }
            } catch(error) {
                const msg = message.create({
                    type: ERROR,
                    title: "Error",
                    message: error
                })
                msg.show({
                    duration: 50000 // 50 seconds
                })
            }
        }
        else if(errorWhenFetchingEmployeeClass) { // If there were any error that happened in the ARKA_SUE_BluebeamHandleDynamicSalesRep script, shows it
            const msg = message.create({
                type: ERROR,
                title: "Error",
                message: JSON.parse(errorWhenFetchingEmployeeClass)
            })
            msg.show({
                duration: 50000 // 50 seconds
            })
        }
    }

    return {
        postSourcing: postSourcing
    };
    
});
