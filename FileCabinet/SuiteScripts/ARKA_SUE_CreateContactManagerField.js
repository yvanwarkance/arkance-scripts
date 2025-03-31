/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/query', 'N/runtime'], function (serverWidget, query, runtime) {
    var dropDownList = []

    /**
     * Add dynamic fields to source attached contacts
     *
     * @param {Object} context - The context object for the beforeLoad event
     * @param {Record} context.newRecord - The current record being processed
     *
     * @governance 0 units
     *
     */
    function beforeLoad(scriptContext) {
        let form = scriptContext.form
        if (
            scriptContext.type == scriptContext.UserEventType.EDIT ||
            scriptContext.type == scriptContext.UserEventType.COPY ||
            scriptContext.type == scriptContext.UserEventType.CREATE
        ) {
            var currentRecord = scriptContext.newRecord

            addDynamicFields(currentRecord.type)

            dropDownList.map((dropDownOptions) => {
                let customForm = scriptContext.form
                let selectField = form.addField({
                    id: dropDownOptions.genid,
                    type: dropDownOptions.type,
                    label: dropDownOptions.genName,
                })
                let standardContactField = customForm.getField({
                    id: dropDownOptions.nsnextfield,
                })
                if (standardContactField) {
                    standardContactField.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED,
                    })
                }

                selectField.isMandatory = dropDownOptions.isMandatory // Set the field as mandatory

                form.insertField({
                    field: selectField,
                    nextfield: dropDownOptions.nsnextfield,
                })
            })
        }
    }

    function addDynamicFields(recType) {
        if (recType == 'opportunity' || recType == 'estimate' || recType == 'salesorder') {
            dropDownList.push({
                nsfield: 'custbody_contract_manager_contact',
                nsnextfield: 'custbody_contract_manager_contact',
                sourcedfield: 'custbody_end_user',
                genid: 'custpage_contactmanager_selectfield',
                genName: 'Contract Manager Contact',
                isMandatory: false,
                isAddr: false,
                type: serverWidget.FieldType.SELECT,
            })

            dropDownList.push({
                nsfield: 'custbody_custom_contactperson',
                nsnextfield: 'custbody_custom_contactperson',
                sourcedfield: 'custbody_end_user',
                genid: 'custpage_contactperson_selectfield',
                genName: 'Contact Person',
                isMandatory: false,
                isAddr: false,
                type: serverWidget.FieldType.SELECT,
            })
        }
    }

    return {
        beforeLoad: beforeLoad,
    }
})
