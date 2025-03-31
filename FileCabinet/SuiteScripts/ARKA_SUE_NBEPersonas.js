/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/query', 'N/runtime', 'N/log'], function (serverWidget, query, runtime, log) {
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
        log.debug({
            title: 'ARKA_SUE_NBEPersonas',
            details: {
                title: 'Loading the script ARKA_SUE_NBEPersonas',
                entrypoint: 'beforeLoad',
            },
        })
        let form = scriptContext.form
        if (
            scriptContext.type == scriptContext.UserEventType.EDIT ||
            scriptContext.type == scriptContext.UserEventType.COPY ||
            scriptContext.type == scriptContext.UserEventType.CREATE
        ) {
            var currentRecord = scriptContext.newRecord

            addDynamicFields(currentRecord.type)

            dropDownList.map((dropDownOptions) => {
                let selectField = form.addField({
                    id: dropDownOptions.genid,
                    type: dropDownOptions.type,
                    label: dropDownOptions.genName,
                })
                selectField.isMandatory = dropDownOptions.isMandatory // Set the field as mandatory

                form.insertField({
                    field: selectField,
                    nextfield: dropDownOptions.nsnextfield,
                })
            })
        }
    }

    function addDynamicFields(recType) {
        if (recType == 'opportunity' || recType == 'estimate') {
            dropDownList.push({
                nsfield: 'custbody_arka_adminmain',
                nsnextfield: 'custbody_arka_adminmain',
                sourcedfield: 'entity',
                genid: 'custpage_arka_adminmain',
                genName: 'Quote Admin',
                isMandatory: false,
                isAddr: false,
                type: serverWidget.FieldType.SELECT,
            })

            dropDownList.push({
                nsfield: 'custbody_arka_recipientsmain',
                nsnextfield: 'custbody_arka_recipientsmain',
                sourcedfield: 'entity',
                genid: 'custpage_arka_recipientsmain',
                genName: 'Quote Recipients',
                isMandatory: false,
                isAddr: false,
                type: serverWidget.FieldType.MULTISELECT,
            })
        }
    }

    return {
        beforeLoad: beforeLoad,
    }
})
