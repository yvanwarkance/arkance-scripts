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
 * 20250410 RB
 * - Replaced the saved search implementation by SQL query construction for
 *   performance optimization.
 * 
 * 20250123 RB
 * - Initial version
 * 
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget', 'N/ui/message', 'N/record', 'N/query', 'N/format'], function (serverWidget, message, record, query, format) {

    function beforeLoad(context) {
        log.debug("Function", "beforeLoad");
        if (context.type === context.UserEventType.VIEW ||
            context.type === context.UserEventType.EDIT) {
            var newRecord = context.newRecord;
            var transactionId = newRecord.id;
            var transactionType = newRecord.type;
            var referenceDate = 'today';
            var refInFuture = false;

            // Show warning only for estimates, opportunities and sales orders
            if (transactionType !== record.Type.ESTIMATE &&
                transactionType !== record.Type.OPPORTUNITY &&
                transactionType !== record.Type.SALES_ORDER)
                return;

            switch (transactionType) {
                case record.Type.ESTIMATE:
                case record.Type.OPPORTUNITY:
                    var dateValue = newRecord.getValue({
                        fieldId: "expectedclosedate"
                    });
                    if (isDateAfterToday(dateValue)) {
                        referenceDate = getFormattedDate(dateValue);
                        refInFuture = true;
                    } else {
                        referenceDate = getFormattedDate(new Date());
                    }
                    break;
                default:
                    referenceDate = getFormattedDate(new Date());
                    break;
            }

            log.debug("Info", "transactionId(" + transactionId + ") transactionType(" + transactionType + ") referenceDate(" + referenceDate + ") refInFuture(" + refInFuture + ")");

            var sql =
                "	SELECT " +
                "		i.itemid, i.custitem_end_of_life_date " +
                "   FROM " +
                "       item i " +
                "   INNER JOIN " +
                "		transactionLine tl ON tl.item = i.id " +
                "   INNER JOIN " +
                "         transaction t on t.id = tl.transaction " +
                "	WHERE " +
                "		tl.transaction = " + transactionId +
                "   AND " +
                "       i.custitem_end_of_life_date <= TO_DATE( '" + referenceDate + "', 'DD/MM/YYYY' ) " +
                "   AND " +
                "       t.type in ('Estimate','Opprtnty','SalesOrd') " +
                "   GROUP BY " +
                "       i.itemid, i.custitem_end_of_life_date";

            log.debug("SQL", sql);

            var resultSet = query.runSuiteQL({
                query: sql
            });//10 units

            var results = resultSet.results;
            if (results && results.length > 0) {
                log.debug("Info", "Transaction item search result count (" + results.length + ")");
                var itemList = "";
                for (var index = 0; index < results.length; index++) {
                    itemList += "<b>" + results[index].values[0] + "</b>";
                    itemList += " (" + results[index].values[1] + "), ";
                };
                itemList = itemList.substring(0, itemList.length - 2);
                var msg = 'RB1: The following items used in this transaction are End of Life: ' + itemList;
                if (refInFuture) {
                    msg = 'RB2: The following items used in this transaction are End of Life on or before the expected close date: ' + itemList;
                }
                context.form.addPageInitMessage({
                    type: message.Type.WARNING,
                    title: 'Warning',
                    message: msg
                });
            } else {
                log.debug("Info", "Transaction item search returned no results");
            }
        }
    }

    function getFormattedDate(dateValue) {
        log.debug("Function", "getFormattedDate(" + dateValue + ")");

        var days = dateValue.getDate();
        var months = dateValue.getMonth() + 1;
        var years = dateValue.getFullYear();

        var dayStr = (days < 10 ? "0" + days : "" + days);
        var monthStr = (months < 10 ? "0" + months : "" + months);
        var formattedDate = dayStr + "/" + monthStr + years;

        log.debug("Info", "formattedDate(" + formattedDate + ")");
        return formattedDate;
    }

    function isDateAfterToday(dateValue) {
        log.debug("Function", "isDateAfterToday(" + dateValue + ")");

        var today = new Date(); // Get current date
        today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison
        var recordDate = new Date(dateValue); // Convert date to object

        // Return the comparison
        return recordDate > today;
    }

    return {
        beforeLoad: beforeLoad
    };
});