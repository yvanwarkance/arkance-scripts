/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([], function () {
    /**
     * Function to Hide 08 - Quote won status
     * Empty integration field on estimates
     * @param {*} context
     * @governance 0 Units
     */
    function pageInit(context) {
        var recType = context.currentRecord.getValue('type')

        let fieldToHide = {
            estimate: [
                '08 - Quote Closed Won',
                'Stage 1 - Prospecting',
                'Stage 2 - Qualification',
                'Stage 3 - Solution Design',
            ],
            opprtnty: [
                'Stage 4 - Decision Pending/Negotion',
                'Stage 5 - Verbal Agreement',
                'Stage 6 - Order Validation',
                'Stage 7 - Final/Closed/Won',
                '10 - Dormant',
                '11 - Lost Customer',
            ],
        }
        //let fieldToHide2 = {estimate: [],opprtnty: []};

        //Mutation Observer
        var observer = new MutationObserver((mutationList) => {
            for (m of mutationList) {
                if (m.attributeName == 'class' && m.type == 'attributes') {
                    if (m.target.classList.contains('uir-field-active')) {
                        let dropdown = document.querySelector('.uir-tooltip.uir-field-tooltip-wrapper')
                        console.log('dropdown', dropdown)
                        let uniqueRemoval = []
                        let uniqueStatuses = []
                        dropdown.querySelectorAll('.dropdownDiv div').forEach((opt) => {
                            if (!uniqueRemoval.includes(opt.innerHTML)) {
                                if (
                                    fieldToHide[recType].includes(opt.innerHTML) &&
                                    !opt.classList.contains('dropdownSelected')
                                ) {
                                    opt.style.display = 'none'
                                    uniqueRemoval.push(opt.innerHTML)
                                } else {
                                    if (!uniqueStatuses.includes(opt.innerHTML)) {
                                        uniqueStatuses.push(opt.innerHTML)
                                    } else {
                                        opt.style.display = 'none'
                                    }
                                }
                            }
                        })
                    }
                }
            }
        })
        let eleOpp = document.querySelector('#entitystatus_fs .uir-select-input-container input')
        observer.observe(eleOpp, { attributes: 'class' })

        if (recType == 'estimate') {
            if (context.mode == 'copy') {
                var PENDING_STATUS_ID = 1
                var fieldToEmpty = [
                    'custbody_autodesk_transaction_id',
                    'custbody_autodesk_quote_detail_status',
                    'custbody_autodesk_quote_number',
                    'custbody_autodesk_error',
                    'custbody_autodesk_quote_id',
                ]
                var variableEmpty = [
                    { id: 'text', value: null, data: fieldToEmpty },
                    { id: 'List', value: PENDING_STATUS_ID, data: ['custbody_autodesk_quote_status'] },
                    { id: 'List', value: '', data: ['custbody_autodesk_quote_detail_status'] },
                ]

                for (var mainIndex = 0; mainIndex < variableEmpty.length; mainIndex++) {
                    var varObj = variableEmpty[mainIndex]
                    for (var index = 0; index < varObj.data.length; index++) {
                        context.currentRecord.setValue({
                            fieldId: varObj.data[index],
                            value: varObj.value,
                        })
                    }
                }
            }
        }
    }

    return {
        pageInit: pageInit,
    }
})
