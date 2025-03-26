/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([
  'N/log',
  'N/record',
  './BBE_LIB_GenericFunctionsSS2',
  'N/search',
], function (log, record, bbeLib, search) {
  var ARKA_LOGGING_EMAIL = 'logging.ns+arka@bigbang360.com';
  var CONTRACT_RECORD = 'customrecord_contracts';
  var PENDING_BILLING = 'Pending Billing';
  var PENDING_APPROVAL = 'Pending Approval';
  var ORDER_TYPE_RENEWAL = '2';

  /**
   * Function that triggers before record is saved.
   *
   * @governance 20 units
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type
   */
  function beforeSubmit(scriptContext) {
    if (
      scriptContext.type == scriptContext.UserEventType.EDIT ||
      scriptContext.type == scriptContext.UserEventType.CREATE
    ) {
      try {
        setAutodeskContratNumber(scriptContext); // 0 units
      } catch (e) {
        bbeLib.logError({
          err: e,
          title: 'Could Not Update Autodesk Contract Number',
          loggingEmail: ARKA_LOGGING_EMAIL,
        }); // 20 units
      }
    }
  }
  /**
   * Function that triggers after record is saved.
   *
   * @governance 20 units
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.newRecord - New record
   * @param {Record} scriptContext.oldRecord - Old record
   * @param {string} scriptContext.type - Trigger type
   */
  function afterSubmit(scriptContext) {
    try {
      if (
        scriptContext.newRecord.type == record.Type.PURCHASE_ORDER &&
        scriptContext.type == scriptContext.UserEventType.DROPSHIP
      ) {
        setMemoonPurchaseOrder(scriptContext);
      }
      // 0 units
    } catch (e) {
      bbeLib.logError({
        err: e,
        title: 'Could Not Update Autodesk Contract Number',
        loggingEmail: ARKA_LOGGING_EMAIL,
      }); // 20 units
    }
  }

  /**
   * Function to set a autodesk contract number, terms and contract Mangager.
   * @governance 0 unit
   * @param {Object} scriptContext
   */
  function setMemoonPurchaseOrder(scriptContext) {
    var newRecord = record.load({
      type: record.Type.PURCHASE_ORDER,
      id: scriptContext.newRecord.id,
    });
    var salesOrderLookUp = search.lookupFields({
      type: search.Type.SALES_ORDER,
      id: newRecord.getValue('createdfrom'),
      columns: ['memo', 'custbody_ordernumbereshop'],
    });
    if (salesOrderLookUp.custbody_ordernumbereshop) {
      newRecord.setValue({
        fieldId: 'memo',
        value: salesOrderLookUp.memo,
      });
      newRecord.save();
    }
  }
  /**
   * Function to set a autodesk contract number, terms and contract Mangager.
   * @governance 0 unit
   * @param {Object} scriptContext
   */
  function setAutodeskContratNumber(scriptContext) {
    var newRecord = scriptContext.newRecord;
    if (
      newRecord.type == record.Type.SALES_ORDER ||
      newRecord.type == record.Type.PURCHASE_ORDER ||
      record.Type.ESTIMATE
    ) {
      var lineCount = newRecord.getLineCount({
        sublistId: 'item',
      });
      var orderNumber = newRecord.getValue({
        fieldId: 'custbody_ordernumbereshop',
      });
      if (newRecord.type == record.Type.SALES_ORDER) {
        var status = newRecord.getValue({
          fieldId: 'status',
        });
        if (orderNumber) {
          if (
            scriptContext.type == scriptContext.UserEventType.CREATE &&
            status == PENDING_BILLING
          ) {
            newRecord.setValue({
              fieldId: 'custbody_eshop_orderstatuschanged',
              value: true,
            });
          }
          var contactId = newRecord.getValue({
            fieldId: 'custbody_contactmanagerid',
          });
          /*var contactManager = newRecord.getValue({
                        fieldId: 'custbody_contract_manager_contact'
                    });*/

          if (contactId) {
            newRecord.setValue({
              fieldId: 'custbody_contract_manager_contact',
              value: contactId,
            });
          }
          if (contactId) {
            /*newRecord.setValue({
                            fieldId: 'custbody_cb_contact_person_source',
                            value: contactPersonId
                        });*/
          }
        }
      }

      var salesTeamCount = newRecord.getLineCount({
        sublistId: 'salesteam',
      });
      for (var index = 0; index < lineCount; index++) {
        var newAutoDeskContractNum = newRecord.getSublistValue({
          sublistId: 'item',
          fieldId: 'custcol_autodesk_contract_number',
          line: index,
        });

        if (orderNumber) {
        
          var startDate = newRecord.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_swe_contract_start_date',
            line: index,
          });

          if (salesTeamCount > 0) {
            newRecord.setSublistValue({
              sublistId: 'salesteam',
              fieldId: 'isprimary',
              line: 0,
              value: true,
            });
          }
          var endDate = newRecord.getSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_swe_contract_end_date',
            line: index,
          });
          if (!endDate) {
            newRecord.setValue({
              fieldId: 'custbody_renewal_terms',
              value: 12,
            });
          } else {
            var year1 = startDate.toString().split(' ');
            year1 = year1[3];
            year1 = parseInt(year1);

            var year2 = endDate.toString().split(' ');
            year2 = year2[3];
            year2 = parseInt(year2);

            var terms = year2 - year1;
            terms = terms * 12;
            newRecord.setSublistValue({
              sublistId: 'item',
              fieldId: 'custcol_swe_contract_item_term_months',
              line: index,
              value: terms,
            });
            newRecord.setValue({
              fieldId: 'custbody_renewal_terms',
              value: terms,
            });
          }
        }

        //#TODO Needs Kacim Validation
        /*if (!bbeLib.isNullOrEmpty(newAutoDeskContractNum)) {
                    newRecord.setValue({
                        fieldId: 'custbody_autodesk_number',
                        value: newAutoDeskContractNum
                    });
                }*/
      }
      if (
        newRecord.type == record.Type.ESTIMATE &&
        newRecord.getValue('custbody_order_type') == ORDER_TYPE_RENEWAL
      ) {
        /*var autodeskContractNumber = search.lookupFields({
                    type: CONTRACT_RECORD,
                    id: newRecord.getValue('custbody_swe_from_contract'),
                    columns: ['name']
                });
                newRecord.setValue({
                    fieldId: 'custbody_autodesk_number',
                    value: autodeskContractNumber.name
                });*/
      }
    }
    if (
      scriptContext.type == scriptContext.UserEventType.CREATE &&
      newRecord.type == record.Type.INVOICE
    ) {
      var createdFrom = newRecord.getValue({
        fieldId: 'createdfrom',
      });
      if (createdFrom) {
        var sales_order = record.load({
          type: record.Type.SALES_ORDER,
          id: createdFrom,
        });
        if (sales_order) {
          var order_number = sales_order.getValue({
            fieldId: 'custbody_ordernumbereshop',
          });
          if (order_number) {
            sales_order.setValue({
              fieldId: 'custbody_eshop_orderstatuschanged',
              value: true,
            });
            sales_order.save();
          }
        }
      }
    }
    if (newRecord.type == CONTRACT_RECORD) {
      var newRecordLineCount = newRecord.getLineCount({
        sublistId: 'recmachcustrecord_ci_contract_id',
      });

      var contract = false;
      for (var line = 0; line < newRecordLineCount && !contract; line++) {
        var newAutoDeskContract = newRecord.getSublistValue({
          sublistId: 'recmachcustrecord_ci_contract_id',
          fieldId: 'custrecord_autodesk_contract_num',
          line: line,
        });
        if (!bbeLib.isNullOrEmpty(newAutoDeskContract)) {
          newRecord.setValue({
            fieldId: 'custbody_autodesk_number',
            value: newAutoDeskContract,
          });
          contract = true;
        }
      }
    }
  }
  return {
    beforeSubmit: beforeSubmit,
    afterSubmit: afterSubmit,
  };
});
