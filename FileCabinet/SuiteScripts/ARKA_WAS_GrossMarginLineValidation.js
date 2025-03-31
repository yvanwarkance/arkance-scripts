/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', '/SuiteScripts/BBE_LIB_GenericFunctionsSS2.js'], function (search, bbeLib) {
    // jshint ignore:line
    /**
     * Goes through the lines of the Quote/Estimate and check if the Gross Margin is under the Gross Margin on the item.
     * If the Gross Margin is under, check the checkbox.
     *
     * @governance 10 Units
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @return {Integer} underGrossMargin - 1 if a line on the Quote/Estimate is under the Gross Margin of the item
     */
    function onAction_grossMarginVerification(scriptContext) {
        var newRecord = scriptContext.newRecord
        return calculateMargin(newRecord) // 10 Units
    }

    /**
     * Goes through the lines of the Quote/Estimate and check if the Gross Margin is under the Gross Margin on the item.
     *
     * @governance 10 Units
     * @param {Record} newRecord - New record
     * @param {Integer} itemLineCount - Number of item lines on the record
     * @return {Integer} underGrossMargin - 1 if a line on the Quote/Estimate is under the Gross Margin of the item
     */
    function calculateMargin(newRecord) {
        var underGrossMargin = 0
        var estimateLinesWithGrossMargin = getGrossProfitPercentAtLine(newRecord.id) // 10 Units

        if (!bbeLib.isNullOrEmpty(estimateLinesWithGrossMargin)) {
            for (var i = 0; i < estimateLinesWithGrossMargin.length; i++) {
                var itemSoldAtZeroPrice = estimateLinesWithGrossMargin[i].getValue({
                    name: 'custitem_item_sold_at_zero',
                    join: 'item',
                })
                var grossProfitMarginOfItem = estimateLinesWithGrossMargin[i].getValue({
                    name: 'custitem_target_gross_margin',
                    join: 'item',
                })
                var grossProfitPercentageOfLine = estimateLinesWithGrossMargin[i].getValue('estgrossprofitpct')

                if (bbeLib.isNullOrEmpty(grossProfitPercentageOfLine) && itemSoldAtZeroPrice == false) {
                    underGrossMargin = 1
                    break
                } else {
                    grossProfitPercentageOfLine = parseInt(grossProfitPercentageOfLine)
                }

                if (parseFloat(grossProfitPercentageOfLine) < parseFloat(grossProfitMarginOfItem)) {
                    underGrossMargin = 1
                    break
                }
            }
        }
        return underGrossMargin
    }

    /**
     * Get the Gross Estimated Profit Percentage from a search. This is due to the fact that
     * The field is not accessible through getValue on newRecord.
     *
     * @governance 10 Units
     * @param {Integer} itemLineCount - Number of item lines on the record
     * @return {Search Object} estimateLineResults - Search results for estimate lines
     */
    function getGrossProfitPercentAtLine(estimateId) {
        var estimateSearchObj = search.create({
            type: 'estimate',
            filters: [
                ['type', 'anyof', 'Estimate'],
                'AND',
                ['internalid', 'anyof', estimateId],
                'AND',
                ['mainline', 'is', 'F'],
                'AND',
                ['item.type', 'anyof', 'InvtPart', 'NonInvtPart'],
            ],
            columns: [
                search.createColumn({
                    name: 'estgrossprofitpct',
                    label: 'Est. Gross Profit Percent (Line)',
                }),
                search.createColumn({
                    name: 'item',
                    label: 'Item',
                }),
                search.createColumn({
                    name: 'custitem_target_gross_margin',
                    join: 'item',
                    label: 'Target Gross Margin',
                }),
                search.createColumn({
                    name: 'amount',
                    label: 'Amount',
                }),
                search.createColumn({
                    name: 'custitem_item_sold_at_zero',
                    join: 'item',
                    label: 'Item Sold at Zero Price (Custom)',
                }),
            ],
        })
        var estimateLineResults = bbeLib.getAllSearchResults({
            search: estimateSearchObj,
        }) // 10 Units

        return estimateLineResults
    }
    return {
        onAction: onAction_grossMarginVerification,
    }
})
