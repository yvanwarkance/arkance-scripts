/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(["N/currentRecord", 'N/ui/message', 'N/search', 'N/record', 'N/ui/dialog', 'N/runtime'], function (currentRecord, message, search, record, dialog, runtime) {

    let currentRec;
    const percentagesProbabilityArray = [10, 20, 40, 75, 90, 99, 100, 0];
    let matchFound = false;
    let today = new Date();
    var warnings = [];

    /**
     * The page init will check if the checkbox Tender is already check ,
     * thus will make the probability field uneditable else make it editable,
     * this will be on Estimate & Opportunity
     * @param {Object} scriptContext - The script context.
     * @param {Record} scriptContext.currentRecord - Current record being accessed.
     * @goverance 
     */
    function pageInit(scriptContext) {
        currentRec = scriptContext.currentRecord;
        let currentType = currentRec.type;

        // ARK-323
        let checkboxTender = currentRec.getValue({ fieldId: 'custbody_tender_business' });
        let haveCreatedFrom = currentRec.getValue({ fieldId: 'createdfrom' });

        // ARK-323 
        if (scriptContext.mode == 'copy' && currentType == 'opportunity') {
            let currentUser = runtime.getCurrentUser().id;
            if (currentUser) {
                currentRec.setValue({
                    fieldId: 'custbody_cb_issued_by',
                    value: currentUser
                });
            }
        }

        //ARK-321
        if (scriptContext.mode == 'create' && currentType == 'opportunity') {

            let terms = currentRec.getValue({ fieldId: 'custbody_tran_term_in_months' });
            if (terms && today) {
                currentRec.setValue({ fieldId: 'custbody_startdate', value: today, ignoreFieldChange: true });
                let endDate = new Date(today.setMonth(today.getMonth() + terms));
                endDate.setDate(endDate.getDate() - 1);
                currentRec.setValue({ fieldId: 'custbody_enddate', value: endDate, ignoreFieldChange: true });
            }
        }

        // ARK-323
        ((currentType == 'opportunity' || currentType == 'estimate') && (checkboxTender == true)) ? setFieldDisabled('probability', false) : setFieldDisabled('probability', true);

        //ARK-323
        if (currentType == 'estimate' && haveCreatedFrom) {
            //Search.lookup did not work hence used record.load
            let objOppRecord = record.load({
                type: record.Type.OPPORTUNITY,
                id: haveCreatedFrom
            });

            let startDate = objOppRecord.getValue({ fieldId: 'custbody_startdate' });
            currentRec.setValue({
                fieldId: 'startdate',
                value: startDate
            });

            let endDate = objOppRecord.getValue({ fieldId: 'custbody_enddate' });
            currentRec.setValue({
                fieldId: 'enddate',
                value: endDate
            });
        }
    }

    /**
     * Set the field's disabled status.
     * @param {string} fieldId - The ID of the field.
     * @param {boolean} isDisabled - Whether the field should be disabled or not.
     */
    function setFieldDisabled(fieldId, isDisabled) {
        currentRec.getField({ fieldId: fieldId }).isDisabled = isDisabled;
    }

    /**
     * The Field Change will check if the tender checkbox is checked,
     * then will set the field enabled else disabled
     * @param {Object} context - The field change context.
     * @param {string} context.fieldId - The ID of the field that was changed.
     * @governance 10 Units
     */
    function fieldChanged(context) {

        try {

            currentRec = context.currentRecord;
            let currentType = currentRec.type;
            let fieldName = context.fieldId;
            let subListName = context.sublistId;
            let checkboxTender = currentRec.getValue({ fieldId: 'custbody_tender_business' });


            // ARK-323 - pending
            if (currentType == 'opportunity' || currentType == 'estimate') {
                setFieldDisabled('probability', checkboxTender == true ? false : true);

                if ((fieldName == 'custbody_tender_business' || fieldName == 'probability') && (checkboxTender == true)) {
                    validateProbabilityField();
                }
              
                //New update 2025 tender checkbox
               let currentStage = currentRec.getValue({ fieldId: 'entitystatus' });
            
                if (fieldName == 'custbody_tender_business' && checkboxTender == false) {
                   currentRec.setValue({fieldId: 'entitystatus',value: currentStage });   
                }
            }
            // ARK 321 
            if (currentType == 'opportunity' && fieldName == 'custbody_contract_name') {

                let fromContract = currentRec.getValue({ fieldId: 'custbody_contract_name' });

                if (fromContract) {
                    var contractSearchObj = search.create({
                        type: "customrecord_contracts",
                        filters:
                            [
                                ["isinactive", "is", "F"],
                                "AND",
                                ["id", "equalto", fromContract]
                            ],
                        columns:
                            [
                                search.createColumn({
                                    name: "formulatext1",
                                    formula: "TO_CHAR({custrecord_contracts_start_date}, 'YYYY-MM-DD')",
                                    label: "Formula (Text)"
                                }),
                                search.createColumn({
                                    name: "formulatext2",
                                    formula: "TO_CHAR({custrecord_contracts_end_date}, 'YYYY-MM-DD')",
                                    label: "Formula (Text)"
                                })
                            ]
                    });
                    var searchResultContract = contractSearchObj.run().getRange(0, 1);
                    if (searchResultContract.length > 0) {

                        var contractStartDate = searchResultContract[0].getValue({
                            name: "formulatext1",
                            formula: "TO_CHAR({custrecord_contracts_start_date}, 'YYYY-MM-DD')",
                            label: "Formula (Text)"
                        });
                        currentRec.setValue({
                            fieldId: 'custbody_startdate',
                            value: new Date(contractStartDate),
                            ignoreFieldChange: true
                        });

                        var contractEndDate = searchResultContract[0].getValue({
                            name: "formulatext2",
                            formula: "TO_CHAR({custrecord_contracts_end_date}, 'YYYY-MM-DD')",
                            label: "Formula (Text)"
                        });
                        currentRec.setValue({
                            fieldId: 'custbody_enddate',
                            value: new Date(contractEndDate),
                            ignoreFieldChange: true
                        });
                    }

                    if (contractStartDate && contractEndDate) {

                        let startDate = new Date(currentRec.getValue({ fieldId: 'custbody_startdate' }));
                        let endDate = new Date(currentRec.getValue({ fieldId: 'custbody_enddate' }));
                        resultTerm = calculateTerm(startDate, endDate);
                        currentRec.setValue({ fieldId: 'custbody_tran_term_in_months', value: resultTerm });
                    }
                }
            }
            // ARK 321
            if (currentType == 'opportunity' && (fieldName == 'custbody_startdate' || fieldName == 'custbody_tran_term_in_months')) {


                let terms = currentRec.getValue({ fieldId: 'custbody_tran_term_in_months' });
                let startDate = currentRec.getValue({ fieldId: 'custbody_startdate' });
                if (startDate && terms) {

                    startDate = new Date(startDate);
                    let endDate = new Date(startDate);
                    let fullMonths = Math.floor(terms);
                    let remainingDays = Math.round((terms - fullMonths) * 30);
                    endDate.setMonth(startDate.getMonth() + fullMonths);
                    endDate.setDate(startDate.getDate());
                    endDate.setDate(endDate.getDate() + remainingDays);
                    endDate.setDate(endDate.getDate() - 1);
                    currentRec.setValue({ fieldId: 'custbody_enddate', value: endDate, ignoreFieldChange: true });

                }
            }
            if (currentType == 'opportunity' && fieldName == 'custbody_enddate') {

                let endDate = new Date(currentRec.getValue({ fieldId: 'custbody_enddate' }));
                let startDate = new Date(currentRec.getValue({ fieldId: 'custbody_startdate' }));


                if (endDate && startDate) {

                    let resultTerm = calculateTerm(startDate, endDate);
                    if (resultTerm == -1) {

                        dialog.alert({
                            title: 'Invalid End Date',
                            message: "The Contract Term is invalid. Please enter a value greater than 0."
                        });

                        resultTerm = 0;
                    }

                    currentRec.setValue({ fieldId: 'custbody_tran_term_in_months', value: resultTerm, ignoreFieldChange: true });

                }
            }
        } catch (e) {
            log.error(e);
        }
    }

    /**
     * The function calculate the terms of netsuite 
     * @param {start /end date} - It take the end and start date and give term in netsuite 
     * @governance 0 Units
     */
    function calculateTerm(startDate, endDate) {

        let startDateDay = new Date(startDate);
        let startDay = startDateDay.getDate() - 1;

        let endDateDay = new Date(endDate);
        let endDay = endDateDay.getDate();

        let fullTerm = monthDiff(startDate, endDate);
        let resultTerm = 0;

        //To set correct contract term
        let startDateYear = startDateDay.getFullYear();
        let startDateMonth = startDateDay.getMonth() + 1;
        let endDateYear = endDateDay.getFullYear();
        let endDateMonth = endDateDay.getMonth() + 1;

        //Make date in miliseconds
        let startDates = new Date(startDate).getTime();
        let endDates = new Date(endDate).getTime();

        //if (((startDateYear == endDateYear) && (startDateMonth && endDateMonth)) && (endDate.getDate() < startDate.getDate())) {
        if (endDates < startDates) {
            resultTerm = -1;
        }
        else {

            if (startDay == endDay) {

                let denominatorNum = numOfDays(endDate);
                let remTerm = ((endDay - startDay) / denominatorNum);
                let newTerms = (fullTerm + remTerm);
                resultTerm = newTerms;
            }
            else {

                let endDateBackup = new Date(endDate);
                if (startDate.getDate() > endDate.getDate()) {

                    endDateBackup.setDate(startDay);
                    endDateBackup.setMonth(endDateBackup.getMonth() - 1);
                    let denominatorNum = numOfDays(endDateBackup);
                    let remDays = dateDiffInDays(endDate, endDateBackup);
                    let remTerm = remDays / denominatorNum;
                    let newTerms = fullTerm + remTerm - 1;
                    resultTerm = newTerms.toFixed(3);
                }
                else {

                    let denominatorNum = numOfDays(endDate);
                    let remTerm = (endDay - startDay) / denominatorNum;
                    let newTerms = fullTerm + remTerm;
                    resultTerm = newTerms.toFixed(3);
                }
            }
        }
        return resultTerm;

    }
    /**
     * The function will find month difference 
     * @param {start/end date} - It take the end and start date and give the month difference as a whole number 
     * @governance 0 Units
     */
    function monthDiff(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    /**
     * The function will find number of days per month
     * @param {start/end date} - The function will find number of days per month 
     * @governance 0 Units
     */
    function numOfDays(endDate) {
        const year = endDate.getFullYear();
        const month = endDate.getMonth() + 1;
        return new Date(year, month, 0).getDate();
    }

    /**
     * The function will find number of days between 2 dates
     * @param {end date/backup end date} - The function will find number of days between 2 dates 
     * @governance 0 Units
     */
    function dateDiffInDays(endDate, endDateBackup) {
        const date1_ms = endDate.getTime();
        const date2_ms = endDateBackup.getTime();
        const difference_ms = Math.abs(date2_ms - date1_ms);
        return Math.floor(difference_ms / (1000 * 60 * 60 * 24));
    }

    /**
     *  Validate the probability field it will check if the value of probability matches
     * the defined set of probability if not it will show an error message
     * @param {matchFound} it will be false by default to prevent saving if the probability does not match
     */
    function validateProbabilityField() {
        let currentProbability = currentRec.getValue({ fieldId: 'probability' });
        matchFound = percentagesProbabilityArray.includes(currentProbability);

        if (!matchFound) {
            let myMsgError = message.create({
                title: 'Wrong Probability',
                message: 'The probability must be in the range (10%, 20%, 40%, 75%, 90%, 99%, 100%, 0%)',
                type: message.Type.ERROR
            });
            myMsgError.show({ duration: 10000 });
        }
        return matchFound;
    }
    /**
     * Save record event handler, while saving it will indicate 
     * @param {Object} context - The save record context.
     * @returns {boolean} - Whether the record is successfully saved.
     */
    function saveRecord(context) {

        currentRec = context.currentRecord;
        let currentType = currentRec.type;

        // ARK-323 
        if (currentType == 'opportunity' || currentType == 'estimate') {

            return validateProbabilityField();
        }

        return true;
    }

    /**
     * Validate Contract start/End Date on line give an error message and prevent to save line data
     * @governance 0 unit
     */
    // ARK-321 Date Enhancement - pending + merge QC note above can deploy
    function validateLine(context) {

        let currentRec = context.currentRecord;
        let currentType = currentRec.type;
        let itemType = currentRec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'itemtype' });
        let sublistId = context.sublistId;
        if (currentType == 'opportunity' && sublistId == 'item' && itemType == 'NonInvtPart') {

            let startDate = currentRec.getValue({ fieldId: 'custbody_startdate' });
            let newStartDateHeader = formatDate(startDate);
            let endDate = currentRec.getValue({ fieldId: 'custbody_enddate' });
            let newEndDateHeader = formatDate(endDate);
            let lineStartDate = currentRec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_swe_contract_start_date' });
            let newlineStartDate = formatDate(lineStartDate);
            let lineEndDate = currentRec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'custcol_swe_contract_end_date' });
            let newlineEndDate = formatDate(lineEndDate);

            if (!lineStartDate || !lineEndDate) {
                if (startDate) {
                    currentRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_swe_contract_start_date',
                        value: startDate,
                    });
                }

                if (endDate) {
                    currentRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_swe_contract_end_date',
                        value: endDate,
                    });
                }

            } else {

                switch (true) {

                    case (newStartDateHeader > newlineStartDate):

                        dialog.alert({
                            title: '5565205-sb1.app.netsuite.com says',
                            message: 'The Contract Item Start Date is earlier than the transaction Start Date. \n Please enter a valid Contract Item Start Date.'
                        });
                        return false;

                    case (newEndDateHeader < newlineEndDate):

                        dialog.alert({
                            title: '5565205-sb1.app.netsuite.com says',
                            message: 'The Contract Item End Date is later than the transaction End Date. \n Please enter a valid Contract Item End Date.'
                        });
                        return false;
                }
            }

        }
        return true;
    }

    /**
     * Formats a date string into 'DD/MM/YYYY' format.
     * 
     * @param {string} dateString - Date string in a format parsable by the Date constructor.
     * @returns {string} - Formatted date string.
     * @governance 0 unit
     */
    function formatDate(dateString) {
        let date = new Date(dateString);
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        return `${year}/${month}/${day}`;
    }

    /**
    * Function triggered by clicking on "Update Date on Line" button. Will put Header Date on Line if incorrect.
    * @governance 0 units
    */
    function updateDates() {

        try {
            updateDatesOnLines()
        } catch (e) {
            log.error('e', e);
        }
    }

    /**
    * Function will check if the date is within the header date
    * @governance 0 units
    */
    function checkDateRange(headerStartDate, headerEndDate, lineStartDate, lineEndDate) {

        let bool = false;
        if (lineStartDate >= headerStartDate && lineEndDate <= headerEndDate) {
            bool = true;
        }
        return bool;
    }

    function commitDateOnLines(i, headerStartDate, headerTerm, headerEndDate) {

        currentRec.selectLine({ sublistId: 'item', line: i });
        currentRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_swe_contract_start_date',
            value: new Date(headerStartDate)
        });
        currentRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_swe_contract_item_term_months',
            value: headerTerm
        });
        currentRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_swe_contract_end_date',
            value: new Date(headerEndDate)
        });
        currentRec.commitLine({ sublistId: 'item' });

    }
    function updateDatesOnLines() {

        alert('The Line Date will be aligned to the Header Dates');
        let currentRec = currentRecord.get();
        let startDate, endDate;

        if (currentRec.type == 'opportunity') {
            startDate = currentRec.getValue({ fieldId: 'custbody_startdate' });
            endDate = currentRec.getValue({ fieldId: 'custbody_enddate' });
        }
        if (currentRec.type == 'estimate') {
            startDate = currentRec.getValue({ fieldId: 'startdate' });
            endDate = currentRec.getValue({ fieldId: 'enddate' });
        }

        let headerStartDate = formatDate(startDate);
        let headerEndDate = formatDate(endDate);
        let headerTerm = currentRec.getValue({ fieldId: 'custbody_tran_term_in_months' });
        let lineCount = currentRec.getLineCount({ sublistId: 'item' });

        for (let i = lineCount - 1; i >= 0; i--) {
            let itemType = currentRec.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line: i });

            if (itemType == 'NonInvtPart') {

                let lineTerm = currentRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_swe_contract_item_term_months',
                    line: i
                });
                let startDates = currentRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_swe_contract_start_date',
                    line: i
                });
                let lineStartDate = formatDate(startDates);
                let endDates = currentRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_swe_contract_end_date',
                    line: i
                });
                let lineEndDate = formatDate(endDates);
                let dateRangeBool = checkDateRange(headerStartDate, headerEndDate, lineStartDate, lineEndDate);

                if ((headerTerm == lineTerm) || (headerTerm !== lineTerm && dateRangeBool === false)) {

                    if (headerTerm !== lineTerm) {
                        let warningMsg = `Line ${i + 1}: Term  (${lineTerm} months), Start Date : ${lineStartDate}  , End Date : ${lineEndDate}.`;
                        warnings.push(warningMsg);
                    }
                    commitDateOnLines(i, headerStartDate, headerTerm, headerEndDate);
                }
                if (headerTerm !== lineTerm && dateRangeBool === true) {

                    // Show confirmation dialog
                    let options = {
                        title: 'Confirm Term Update',
                        message: `The term on line ${i + 1} differs from the header term. Do you want to overwrite the term and date with the header values?`,
                    };

                    dialog.confirm(options).then((result) => {

                        if (result) {

                            commitDateOnLines(i, headerStartDate, headerTerm, headerEndDate);
                        }
                    }).catch(() => {
                        log.error('Dialog dismissed');
                    });
                }
            }
        }
        if (warnings.length > 0) {
            let warningMessage = 'Date overwrite on the following lines : ' + '</br>' + warnings.join('</br>');
            let myMsgWarning = message.create({
                title: 'Date Warning',
                message: warningMessage,
                type: message.Type.WARNING
            });
            myMsgWarning.show();
        }
    }
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        validateLine: validateLine,
        updateDates: updateDates
    };
});
