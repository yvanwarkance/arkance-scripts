/**
 * Name  : ARKA_CUE_WarningOnTransaction.js
 * Date  : 2025-01-23
 * Author: Richard Brand (richard.brand@arkance.world)
 * CR    : ARK-375
 *
 * Shows a warning message when an item in the transaction
 * (estimate, opportunity or sales order) is used that is EOL.
 * With estimates and opportunities, the expected close date
 * is used as reference. For sales orders it is today.
 *
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget', 'N/ui/message', 'N/record', 'N/search', 'N/format'], function (
    serverWidget,
    message,
    record,
    search,
    format
) {
    /**
     * @governance 10 Units
     */
    function beforeLoad(context) {
        log.debug('Function', 'beforeLoad')
        if (context.type === context.UserEventType.VIEW || context.type === context.UserEventType.EDIT) {
            var newRecord = context.newRecord
            var transactionId = newRecord.id
            var transactionType = newRecord.type
            var referenceDate = 'today'
            var refInFuture = false

            // Show warning only for estimates, opportunities and sales orders
            if (
                transactionType !== record.Type.ESTIMATE &&
                transactionType !== record.Type.OPPORTUNITY &&
                transactionType !== record.Type.SALES_ORDER
            )
                return

            switch (transactionType) {
                case record.Type.ESTIMATE:
                case record.Type.OPPORTUNITY:
                    var dateValue = newRecord.getValue({
                        fieldId: 'expectedclosedate',
                    })
                    if (isDateAfterToday(dateValue)) {
                        referenceDate = getFormattedDate(dateValue)
                        refInFuture = true
                    } else {
                        referenceDate = 'today'
                    }
                    break
                default:
                    referenceDate = 'today'
                    break
            }

            log.debug(
                'Info',
                'transactionId(' +
                    transactionId +
                    ') transactionType(' +
                    transactionType +
                    ') referenceDate(' +
                    referenceDate +
                    ') refInFuture(' +
                    refInFuture +
                    ')'
            )

            var transactionSearch = search.create({
                type: search.Type.TRANSACTION,
                filters: [
                    ['type', 'anyof', ['Estimate', 'Opprtnty', 'SalesOrd']],
                    'AND',
                    ['internalid', 'is', transactionId],
                    'AND',
                    ['item.custitem_end_of_life_date', 'onorbefore', referenceDate],
                ],
                columns: [
                    search.createColumn({ name: 'item', summary: search.Summary.GROUP }),
                    search.createColumn({
                        name: 'custitem_end_of_life_date',
                        join: 'item',
                        summary: search.Summary.GROUP,
                    }),
                    search.createColumn({ name: 'itemid', join: 'item', summary: search.Summary.GROUP }),
                ],
            })

            var searchResultCount = transactionSearch.runPaged().count
            log.debug('Info', 'Transaction Search Result Count (' + searchResultCount + ')')

            if (searchResultCount > 0) {
                var itemList = ''

                var pagedData = transactionSearch.runPaged({ pageSize: 1000 })
                pagedData.pageRanges.forEach(function (pageRange) {
                    var page = pagedData.fetch({ index: pageRange.index })
                    page.data.forEach(function (result) {
                        itemList +=
                            '<b>' +
                            result.getValue({ name: 'itemid', summary: search.Summary.GROUP, join: 'item' }) +
                            '</b>'
                        itemList +=
                            ' (' +
                            result.getValue({
                                name: 'custitem_end_of_life_date',
                                summary: search.Summary.GROUP,
                                join: 'item',
                            }) +
                            '), '
                    })
                })
                itemList = itemList.substring(0, itemList.length - 2)
                var msg = 'The following items used in this transaction are End of Life: ' + itemList
                if (refInFuture) {
                    msg =
                        'The following items used in this transaction are End of Life on or before the expected close date: ' +
                        itemList
                }
                context.form.addPageInitMessage({
                    type: message.Type.WARNING,
                    title: 'Warning',
                    message: msg,
                })
            }
        }
    }
    function getFormattedDate(dateValue) {
        log.debug('Function', 'getFormattedDate(' + dateValue + ')')

        var formatted = format.format({ value: dateValue, type: format.Type.DATETIMETZ })
        var formattedDateOnly = formatted.substring(0, formatted.indexOf(' '))

        log.debug('Info', 'formattedDateOnly(' + formattedDateOnly + ')')
        return formattedDateOnly
    }

    function isDateAfterToday(dateValue) {
        log.debug('Function', 'isDateAfterToday(' + dateValue + ')')

        var today = new Date() // Get current date
        today.setHours(0, 0, 0, 0) // Set time to 00:00:00 for accurate comparison
        var recordDate = new Date(dateValue) // Convert date to object

        // Return the comparison
        return recordDate > today
    }

    return {
        beforeLoad: beforeLoad,
    }
})
