/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/log'], function (log) {
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        try {
            const { currentRecord } = scriptContext

            // Set the field Date closed to disabled so that no one can edit it
            const dateClosedField = currentRecord.getField({
                fieldId: 'custpage_closed_date',
            })
            if (dateClosedField) {
                dateClosedField.isDisabled = true
            }
        } catch (e) {
            log.error({
                title: 'Error in setting the Date closed field to disabled',
                details: {
                    error: e,
                },
            })
        }
    }

    return {
        pageInit: pageInit,
    }
})
