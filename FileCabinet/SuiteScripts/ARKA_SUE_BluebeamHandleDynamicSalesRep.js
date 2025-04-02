/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
    'N/log',
    'N/record',
    'N/runtime',
    './Scripts/bluebeamHandleDynamicSalesRep/Helpers/ARKA_CSTM_CheckEmployeeConnected',
] /**
 * @param{log} log
 * @param{record} record
 * @param{runtime} runtime
 * @param{ARKA_CSTM_CheckEmployeeConnected} ARKA_CSTM_CheckEmployeeConnected
 *
 * The purpose of this script is just to preload whether the current user connected
 * as a "BLUEBEAM" sales rep class or not and to load the result in a session
 *
 * And also on BeforeSubmit, to check whether or not we need to update the customer record
 * once the opportunity is created
 */, (log, record, runtime, ARKA_CSTM_CheckEmployeeConnected) => {
    let SALES_REP_COLUMNS_IN_OPPORTUNITY = {
        employee: -100,
        salesrole: -100,
        isprimary: false, // Default is primary
        contribution: 0, // Default contribution set to 0% (Because it will only be used to update the sales rep in the customer record (if necessary))
    }
    const BLUEBEAM_CLASSES_SANDBOX = [
        String(26), // Bluebeam
        String(28), // Bluebeam licenses
        String(29), // Bluebeam services
    ]

    const BLUEBEAM_CLASSES_PRODUCTION = [
        String(27), // Bluebeam
    ]

    const BLUEBEAM_SALES_ROLE_CRM_SANDBOX = String(11)
    const BLUEBEAM_SALES_ROLE_CRM_PRODUCTION = String(11)

    /**
     * Defines the function definition that is executed before record is loaded.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @param {Form} scriptContext.form - Current form
     * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
     * @since 2015.2
     *
     * @governance 5 units
     *
     * The purpose of this script is just to check whether the current user connected is a bluebeam sales rep
     * and to load the result in a session variable.
     *
     * It uses the custom module ARKA_CSTM_CheckEmployeeConnected to do this operation
     */
    const beforeLoad = () => {
        const { getEmployeeConnected } = ARKA_CSTM_CheckEmployeeConnected
        const currentUserId = runtime.getCurrentUser().id
        getEmployeeConnected(BLUEBEAM_CLASSES_SANDBOX, BLUEBEAM_CLASSES_PRODUCTION, currentUserId)
    }

    // New requirement:
    // On beforeSubmit, check whether the current transaction created is of class "bluebeam"
    // If so, check whether the customer has an existing bluebeam sales rep
    // If not, add the current sales rep bluebeam to his profile
    // In order to facilitate the contract renewal process (when we'll have to populate the "right" sales rep in the newly created opportunity)
    // From the customer

    /**
     * Defines the function definition that is executed before record is submitted.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @since 2015.2
     *
     * @governance 15 units
     */
    const beforeSubmit = async (scriptContext) => {
        const { newRecord } = scriptContext
        const { SANDBOX } = runtime.EnvType

        // Load the information about the current user connected ("It's class")
        const currentSession = runtime.getCurrentSession()
        const isBlueBeamSalesConnected = currentSession.get({
            name: 'isBluebeamSalesRep',
        })

        let bluebeamSalesRoleCrm

        // Select the right bluebeam sales role based on the environment
        if (runtime.envType === SANDBOX) {
            bluebeamSalesRoleCrm = BLUEBEAM_SALES_ROLE_CRM_SANDBOX
        } else {
            bluebeamSalesRoleCrm = BLUEBEAM_SALES_ROLE_CRM_PRODUCTION
        }

        try {
            // If the current user connected is a bluebeam sales rep
            if (isBlueBeamSalesConnected === 'Y') {
                const selectedCustomer = newRecord.getValue({
                    fieldId: 'custbody_end_user',
                })

                // By default, according to the developments made in the file ARKA_CUE_BluebeamHandleDynamicSalesRep.js,
                // the sales rep sublist is populated with the right sales rep
                const bluebeamSalesRepCount = newRecord.getLineCount({
                    sublistId: 'salesteam',
                })

                // Only if there's at least one bluebeam sales rep in the sublist, we can proceed
                if (bluebeamSalesRepCount > 0) {
                    // Add the current user as a bluebeam sales rep
                    const selectedBluebeamSalesRep = newRecord.getSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'employee',
                        line: 0,
                    })

                    // Check whether the customer has an existing bluebeam sales rep
                    // @governance 5 units
                    const customerRecord = await record.load.promise({
                        type: 'customer',
                        id: selectedCustomer,
                        isDynamic: true,
                    })

                    const salesRepCountInCustomer = customerRecord.getLineCount({
                        sublistId: 'salesteam',
                    })

                    // Aggregate the columns list we want to pull data from
                    const salesRepColumns = Object.keys(SALES_REP_COLUMNS_IN_OPPORTUNITY)

                    let hasSalesRepBluebeam = false

                    // Just append all data related to sales rep loaded from a customer
                    for (let i = 0; i < salesRepCountInCustomer; i++) {
                        const salesRoleId = customerRecord.getSublistValue({
                            sublistId: 'salesteam',
                            fieldId: 'salesrole',
                            line: i,
                        })
                        if (salesRoleId === bluebeamSalesRoleCrm) {
                            hasSalesRepBluebeam = true
                            break
                        }
                    }

                    // If there's no bluebeam sales rep associated to the customer, add the current user as a bluebeam sales rep
                    if (!hasSalesRepBluebeam) {
                        SALES_REP_COLUMNS_IN_OPPORTUNITY['salesrole'] = bluebeamSalesRoleCrm
                        SALES_REP_COLUMNS_IN_OPPORTUNITY['employee'] = selectedBluebeamSalesRep

                        // Add a new line for the current user
                        customerRecord.selectNewLine({
                            sublistId: 'salesteam',
                        })
                        // Note that we already "prepared" the sales rep data in SALES_REP_COLUMNS_IN_OPPORTUNITY
                        // So we just needed to populate these values in order to add him in the sublist as the default sales rep
                        for (const column of salesRepColumns) {
                            customerRecord.setCurrentSublistValue({
                                sublistId: 'salesteam',
                                fieldId: column,
                                value: SALES_REP_COLUMNS_IN_OPPORTUNITY[column],
                                forceSyncSourcing: true,
                            })
                        }
                        customerRecord.commitLine({
                            sublistId: 'salesteam',
                        })

                        // Force save the record item so that it takes into account potential mandatory fields
                        // @governance 10 units
                        await customerRecord.save.promise({
                            ignoreMandatoryFields: true,
                        })
                    }
                }
            }
        } catch (e) {
            log.debug({
                title: 'Error',
                details: {
                    error: e,
                },
            })
        }
    }

    return { beforeLoad, beforeSubmit }
})
