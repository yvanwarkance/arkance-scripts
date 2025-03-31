/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message', 'N/query', 'N/record'], function (message, query, record) {
    const WARNING_ITEM_GROUP_COMPO_FIELD = 'custbody_warning_itmgrp_compo'
    /**
     * Function to display warning message
     *
     * @param {*} scriptContext
     */
    function beforeLoad(scriptContext) {
        // [ ARK-289 ] Warning transaction creation with itemGroup components
        if (scriptContext.type == scriptContext.UserEventType.VIEW) {
            var newRecord = scriptContext.newRecord

            if (
                newRecord.type == record.Type.SALES_ORDER ||
                newRecord.type == record.Type.INVOICE ||
                newRecord.type == record.Type.ESTIMATE
            ) {
                let warningMessage = newRecord.getValue({
                    fieldId: WARNING_ITEM_GROUP_COMPO_FIELD,
                })

                if (warningMessage) {
                    scriptContext.form.addPageInitMessage({
                        type: message.Type.WARNING,
                        message: warningMessage,
                    })
                }
            }
        }
    }

    /**
     * Function to set item group warning message to a field
     *
     * @governance 10 units
     * @param {*} scriptContext
     */
    function beforeSubmit(scriptContext) {
        // [ ARK-289 ] Blocking transaction creation with itemGroup components
        if (
            scriptContext.type == scriptContext.UserEventType.EDIT ||
            scriptContext.type == scriptContext.UserEventType.CREATE
        ) {
            var newRecord = scriptContext.newRecord

            if (
                newRecord.type == record.Type.SALES_ORDER ||
                newRecord.type == record.Type.INVOICE ||
                newRecord.type == record.Type.ESTIMATE
            ) {
                let arrItemOutsideItmGrp = checkCompoOutsideItemGroup(newRecord) //10 units
                let warningMessage = ''
                if (arrItemOutsideItmGrp.length) {
                    warningMessage = `The followingss items: ${arrItemOutsideItmGrp.join(', ')} are restricted to item group only, and should not be used as standalone item`
                }

                newRecord.setValue({
                    fieldId: WARNING_ITEM_GROUP_COMPO_FIELD,
                    value: warningMessage,
                })
            }
        }
    }

    /**
     * Check whether the transaction contain an item(s) which is part of an ItemGroup and the item is checked as 'Restricted to ItemGroup use'.
     *
     * @governance 10 unit
     * @param {Object} newRecord
     */
    function checkCompoOutsideItemGroup(newRecord) {
        let ousideItemgroupItem = []
        let arrItemId = []
        let itemObj = {}
        let lineCount = newRecord.getLineCount({
            sublistId: 'item',
        })

        for (let i = 0; i < lineCount; i++) {
            let itemId = newRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i,
            })

            let ingroup = newRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'ingroup',
                line: i,
            })

            if (!ingroup) {
                let lineNumber = i + 1
                lineNumber = 'line ' + lineNumber
                if (arrItemId.indexOf(itemId) == -1) {
                    arrItemId.push(itemId)
                }

                if (!itemObj[itemId]) {
                    itemObj[itemId] = []
                }

                itemObj[itemId].push(lineNumber)
            }
        }

        if (arrItemId.length) {
            let queryString = `
                SELECT
                    id,
                    itemId
                FROM
                    item
                WHERE
                    id IN (${arrItemId.join(',')})
                    AND 
                    custitem_restricted_itemgroup = 'T'
            `

            let resultSet = query.runSuiteQL({
                query: queryString,
            }).results //10 units

            resultSet.forEach((element) => {
                let itemName = element.values[1]
                let itemId = element.values[0]

                let nameKey = `${itemName}: ${itemObj[itemId]}`
                ousideItemgroupItem.push(nameKey)
            })
        }

        return ousideItemgroupItem
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
    }
})
