
            /**
             * @NApiVersion 2.1
             * @NScriptType UserEventScript
             * @NModuleScope SameAccount
             * 
             * This file has been autogenerated in a CI environment
             * @governance 411 Units
             */
            define([
                "../../../../../ARKA_SUE_AddSyncQuoteButton.js","../../../../../ARKA_SUE_AutodeskNxmFieldValidation.js","../../../../../ARKA_SUE_BluebeamHandleDynamicSalesRep.js","../../../../../ARKA_SUE_CalculateExtendedCostAndPoRate.js","../../../../../ARKA_SUE_CheckOutsideItemGroup.js","../../../../../ARKA_SUE_CreateContactManagerField.js","../../../../../ARKA_SUE_DatechFieldValidation.js","../../../../../ARKA_SUE_DisplayWarningEstMessage.js","../../../../../ARKA_SUE_DuplicateEstimate.js","../../../../../ARKA_SUE_LimitTransactionStatus.js","../../../../../ARKA_SUE_NBEPersonas.js","../../../../../ARKA_SUE_SetExpectedCloseDateFieldOnEstimate.js","../../../../../ARKA_CUE_WarningOnTransaction.js"
            ],

            (
                ARKA_SUE_AddSyncQuoteButton,ARKA_SUE_AutodeskNxmFieldValidation,ARKA_SUE_BluebeamHandleDynamicSalesRep,ARKA_SUE_CalculateExtendedCostAndPoRate,ARKA_SUE_CheckOutsideItemGroup,ARKA_SUE_CreateContactManagerField,ARKA_SUE_DatechFieldValidation,ARKA_SUE_DisplayWarningEstMessage,ARKA_SUE_DuplicateEstimate,ARKA_SUE_LimitTransactionStatus,ARKA_SUE_NBEPersonas,ARKA_SUE_SetExpectedCloseDateFieldOnEstimate,ARKA_CUE_WarningOnTransaction
            ) => {
                
                // Display simply entry points detected as functions
                
                    const beforeLoad = async (scriptContext) => {
                        try {
                            log.debug({
                                title: 'UserEventScript',
                                details: {
                                    title: 'Running the beforeLoad entrypoint from the dispatcher file ./FileCabinet/SuiteScripts/Codes/Scripts/Records/Estimate/User Event Scripts/ARKA_SUE_Est_dispatcher2',
                                    scriptsLoaded: ["ARKA_SUE_AddSyncQuoteButton", "ARKA_SUE_AutodeskNxmFieldValidation", "ARKA_SUE_BluebeamHandleDynamicSalesRep", "ARKA_SUE_CalculateExtendedCostAndPoRate", "ARKA_SUE_CheckOutsideItemGroup", "ARKA_SUE_CreateContactManagerField", "ARKA_SUE_DatechFieldValidation", "ARKA_SUE_DisplayWarningEstMessage", "ARKA_SUE_DuplicateEstimate", "ARKA_SUE_LimitTransactionStatus", "ARKA_SUE_NBEPersonas", "ARKA_SUE_SetExpectedCloseDateFieldOnEstimate", "ARKA_CUE_WarningOnTransaction"],
                                    },
                            })
                            
                            
                                        if (typeof ARKA_SUE_AddSyncQuoteButton.beforeLoad === 'function') {
                                            await ARKA_SUE_AddSyncQuoteButton.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_AutodeskNxmFieldValidation.beforeLoad === 'function') {
                                            await ARKA_SUE_AutodeskNxmFieldValidation.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_BluebeamHandleDynamicSalesRep.beforeLoad === 'function') {
                                            await ARKA_SUE_BluebeamHandleDynamicSalesRep.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_CalculateExtendedCostAndPoRate.beforeLoad === 'function') {
                                            await ARKA_SUE_CalculateExtendedCostAndPoRate.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_CheckOutsideItemGroup.beforeLoad === 'function') {
                                            await ARKA_SUE_CheckOutsideItemGroup.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_CreateContactManagerField.beforeLoad === 'function') {
                                            await ARKA_SUE_CreateContactManagerField.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_DatechFieldValidation.beforeLoad === 'function') {
                                            await ARKA_SUE_DatechFieldValidation.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_DisplayWarningEstMessage.beforeLoad === 'function') {
                                            await ARKA_SUE_DisplayWarningEstMessage.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_DuplicateEstimate.beforeLoad === 'function') {
                                            await ARKA_SUE_DuplicateEstimate.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_LimitTransactionStatus.beforeLoad === 'function') {
                                            await ARKA_SUE_LimitTransactionStatus.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_NBEPersonas.beforeLoad === 'function') {
                                            await ARKA_SUE_NBEPersonas.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_SetExpectedCloseDateFieldOnEstimate.beforeLoad === 'function') {
                                            await ARKA_SUE_SetExpectedCloseDateFieldOnEstimate.beforeLoad(scriptContext);
                                        }
                                        if (typeof ARKA_CUE_WarningOnTransaction.beforeLoad === 'function') {
                                            await ARKA_CUE_WarningOnTransaction.beforeLoad(scriptContext);
                                        }
                            
                        } catch (err) {
                            // On error catch, send message to all developpers
                            log.error({
                                title: 'UserEventScript',
                                details: {
                                    title: 'Error running the beforeLoad entrypoint from the dispatcher file ./FileCabinet/SuiteScripts/Codes/Scripts/Records/Estimate/User Event Scripts/ARKA_SUE_Est_dispatcher2',
                                    error: err,
                                },
                            });
                        }
                    };

                    const beforeSubmit = async (scriptContext) => {
                        try {
                            log.debug({
                                title: 'UserEventScript',
                                details: {
                                    title: 'Running the beforeSubmit entrypoint from the dispatcher file ./FileCabinet/SuiteScripts/Codes/Scripts/Records/Estimate/User Event Scripts/ARKA_SUE_Est_dispatcher2',
                                    scriptsLoaded: ["ARKA_SUE_AddSyncQuoteButton", "ARKA_SUE_AutodeskNxmFieldValidation", "ARKA_SUE_BluebeamHandleDynamicSalesRep", "ARKA_SUE_CalculateExtendedCostAndPoRate", "ARKA_SUE_CheckOutsideItemGroup", "ARKA_SUE_CreateContactManagerField", "ARKA_SUE_DatechFieldValidation", "ARKA_SUE_DisplayWarningEstMessage", "ARKA_SUE_DuplicateEstimate", "ARKA_SUE_LimitTransactionStatus", "ARKA_SUE_NBEPersonas", "ARKA_SUE_SetExpectedCloseDateFieldOnEstimate", "ARKA_CUE_WarningOnTransaction"],
                                    },
                            })
                            
                            
                                        if (typeof ARKA_SUE_AddSyncQuoteButton.beforeSubmit === 'function') {
                                            await ARKA_SUE_AddSyncQuoteButton.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_AutodeskNxmFieldValidation.beforeSubmit === 'function') {
                                            await ARKA_SUE_AutodeskNxmFieldValidation.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_BluebeamHandleDynamicSalesRep.beforeSubmit === 'function') {
                                            await ARKA_SUE_BluebeamHandleDynamicSalesRep.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_CalculateExtendedCostAndPoRate.beforeSubmit === 'function') {
                                            await ARKA_SUE_CalculateExtendedCostAndPoRate.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_CheckOutsideItemGroup.beforeSubmit === 'function') {
                                            await ARKA_SUE_CheckOutsideItemGroup.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_CreateContactManagerField.beforeSubmit === 'function') {
                                            await ARKA_SUE_CreateContactManagerField.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_DatechFieldValidation.beforeSubmit === 'function') {
                                            await ARKA_SUE_DatechFieldValidation.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_DisplayWarningEstMessage.beforeSubmit === 'function') {
                                            await ARKA_SUE_DisplayWarningEstMessage.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_DuplicateEstimate.beforeSubmit === 'function') {
                                            await ARKA_SUE_DuplicateEstimate.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_LimitTransactionStatus.beforeSubmit === 'function') {
                                            await ARKA_SUE_LimitTransactionStatus.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_NBEPersonas.beforeSubmit === 'function') {
                                            await ARKA_SUE_NBEPersonas.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_SetExpectedCloseDateFieldOnEstimate.beforeSubmit === 'function') {
                                            await ARKA_SUE_SetExpectedCloseDateFieldOnEstimate.beforeSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_CUE_WarningOnTransaction.beforeSubmit === 'function') {
                                            await ARKA_CUE_WarningOnTransaction.beforeSubmit(scriptContext);
                                        }
                            
                        } catch (err) {
                            // On error catch, send message to all developpers
                            log.error({
                                title: 'UserEventScript',
                                details: {
                                    title: 'Error running the beforeSubmit entrypoint from the dispatcher file ./FileCabinet/SuiteScripts/Codes/Scripts/Records/Estimate/User Event Scripts/ARKA_SUE_Est_dispatcher2',
                                    error: err,
                                },
                            });
                        }
                    };

                    const afterSubmit = async (scriptContext) => {
                        try {
                            log.debug({
                                title: 'UserEventScript',
                                details: {
                                    title: 'Running the afterSubmit entrypoint from the dispatcher file ./FileCabinet/SuiteScripts/Codes/Scripts/Records/Estimate/User Event Scripts/ARKA_SUE_Est_dispatcher2',
                                    scriptsLoaded: ["ARKA_SUE_AddSyncQuoteButton", "ARKA_SUE_AutodeskNxmFieldValidation", "ARKA_SUE_BluebeamHandleDynamicSalesRep", "ARKA_SUE_CalculateExtendedCostAndPoRate", "ARKA_SUE_CheckOutsideItemGroup", "ARKA_SUE_CreateContactManagerField", "ARKA_SUE_DatechFieldValidation", "ARKA_SUE_DisplayWarningEstMessage", "ARKA_SUE_DuplicateEstimate", "ARKA_SUE_LimitTransactionStatus", "ARKA_SUE_NBEPersonas", "ARKA_SUE_SetExpectedCloseDateFieldOnEstimate", "ARKA_CUE_WarningOnTransaction"],
                                    },
                            })
                            
                            
                                        if (typeof ARKA_SUE_AddSyncQuoteButton.afterSubmit === 'function') {
                                            await ARKA_SUE_AddSyncQuoteButton.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_AutodeskNxmFieldValidation.afterSubmit === 'function') {
                                            await ARKA_SUE_AutodeskNxmFieldValidation.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_BluebeamHandleDynamicSalesRep.afterSubmit === 'function') {
                                            await ARKA_SUE_BluebeamHandleDynamicSalesRep.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_CalculateExtendedCostAndPoRate.afterSubmit === 'function') {
                                            await ARKA_SUE_CalculateExtendedCostAndPoRate.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_CheckOutsideItemGroup.afterSubmit === 'function') {
                                            await ARKA_SUE_CheckOutsideItemGroup.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_CreateContactManagerField.afterSubmit === 'function') {
                                            await ARKA_SUE_CreateContactManagerField.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_DatechFieldValidation.afterSubmit === 'function') {
                                            await ARKA_SUE_DatechFieldValidation.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_DisplayWarningEstMessage.afterSubmit === 'function') {
                                            await ARKA_SUE_DisplayWarningEstMessage.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_DuplicateEstimate.afterSubmit === 'function') {
                                            await ARKA_SUE_DuplicateEstimate.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_LimitTransactionStatus.afterSubmit === 'function') {
                                            await ARKA_SUE_LimitTransactionStatus.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_NBEPersonas.afterSubmit === 'function') {
                                            await ARKA_SUE_NBEPersonas.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_SUE_SetExpectedCloseDateFieldOnEstimate.afterSubmit === 'function') {
                                            await ARKA_SUE_SetExpectedCloseDateFieldOnEstimate.afterSubmit(scriptContext);
                                        }
                                        if (typeof ARKA_CUE_WarningOnTransaction.afterSubmit === 'function') {
                                            await ARKA_CUE_WarningOnTransaction.afterSubmit(scriptContext);
                                        }
                            
                        } catch (err) {
                            // On error catch, send message to all developpers
                            log.error({
                                title: 'UserEventScript',
                                details: {
                                    title: 'Error running the afterSubmit entrypoint from the dispatcher file ./FileCabinet/SuiteScripts/Codes/Scripts/Records/Estimate/User Event Scripts/ARKA_SUE_Est_dispatcher2',
                                    error: err,
                                },
                            });
                        }
                    };

                return {
                    beforeLoad: beforeLoad,
                    beforeSubmit: beforeSubmit,
                    afterSubmit: afterSubmit
                }
            });
        