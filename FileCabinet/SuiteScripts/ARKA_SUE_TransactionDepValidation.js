/* jshint undef: true, unused: true */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/query', 'N/ui/message', 'N/runtime'], function (query, message, runtime) {
    const lineSublistId = {
        ITEM: 'item',
        LINE: 'line',
        INVENTORY: 'inventory',
        EXPENSE: 'expense',
    }

    const PNL_ACCOUNT_TYPE = ['Income', 'OthIncome', 'Expense', 'OthExpense', 'COGS']
    const TO_VALIDATE_ITEMTYPE = ['NonInvtPart', 'Service', 'InvtPart', 'OthCharge']
    let CUSTOM_SEGMENT_FIELDID //cseg1
    let EFFECTIVE_POSTING_PERIOD //221
    let EFFECTIVE_TRANDATE
    let DEPARTMENT_SEG_TABLE_FIELD //MAP_department_custrecord_dept_area_mapping
    let SEGMENT_LABEL

    /**
     * Function to display error message
     *
     * @param {*} scriptContext
     * @governance
     */
    function beforeLoad(scriptContext) {
        let newRecord = scriptContext.newRecord

        let errorLogsDeptArea = newRecord.getValue({
            fieldId: 'custbody_trans_dept_area_error_log',
        })

        if (errorLogsDeptArea) {
            scriptContext.form.addPageInitMessage({
                type: message.Type.ERROR,
                message: errorLogsDeptArea,
            })
        }
    }

    /**
     * Function to
     * 1. validate department based on Mapping transaction department record
     * 2. Add error message if pnl transaction on journal entry or other transaction has the department and area empty on line or on header
     * 3. Add error message if area is not valid for the desired department
     *
     * @param {*} scriptContext
     * @governance 30 units
     */
    function beforeSubmit(scriptContext) {
        let newRecord = scriptContext.newRecord
        let script = runtime.getCurrentScript()

        let effectiveDate = script.getParameter({
            name: 'custscript_sue_eff_trandate',
        })

        EFFECTIVE_POSTING_PERIOD = script.getParameter({
            name: 'custscript_sue_eff_postperiod',
        })

        CUSTOM_SEGMENT_FIELDID = script.getParameter({
            name: 'custscript_sue_classification_field_id',
        })

        DEPARTMENT_SEG_TABLE_FIELD = script.getParameter({
            name: 'custscript_sue_dep_seg_field',
        })

        EFFECTIVE_TRANDATE = changeDateFormat(effectiveDate)

        if (SEGMENT_LABEL == 'location') {
            SEGMENT_LABEL = 'location'
        } else {
            SEGMENT_LABEL = 'area'
        }

        if (
            scriptContext.type == scriptContext.UserEventType.CREATE ||
            scriptContext.type == scriptContext.UserEventType.EDIT
        ) {
            let sublistIds = [lineSublistId.ITEM, lineSublistId.INVENTORY, lineSublistId.LINE, lineSublistId.EXPENSE]
            let transNotValidateExpense = ['itemreceipt']
            let transToValidateShipItem = ['estimate', 'salesorder', 'invoice', 'creditmemo']
            let containSublistIds = []
            let sublistId
            let recType = newRecord.type
            let validDeptObj = {}
            let areaDeptObj = {}
            let recTypeId
            let lineCount = -1
            let validateDeptMessage = []
            let emptyClassification = []
            var validateAreaMessage = []
            var pnlAccounts = []
            let message = ''
            let shippingItemMethod
            let shippingItemCost

            let toValidateCheckbox = newRecord.getValue({
                fieldId: 'custbody_odyssey_validation',
            })

            if (!validateEffectiveTranDate(newRecord) || (toValidateCheckbox == true && recType == 'journalentry')) {
                return
            }

            recTypeId = newRecord.getValue({
                fieldId: 'ntype',
            })

            shippingItemMethod = newRecord.getValue({
                fieldId: 'shipmethod',
            })

            shippingItemCost = newRecord.getValue({
                fieldId: 'shippingcost',
            })

            if (recTypeId) {
                validDeptObj = getValideDept(recTypeId) //10 units
                areaDeptObj = areaDept() //10 units - only bring paired department and area
                pnlAccounts = getPNLAccounts() //10 units - list pnl accounts

                for (let i = 0; i < sublistIds.length; i++) {
                    lineCount = newRecord.getLineCount({
                        sublistId: sublistIds[i],
                    })

                    if (lineCount != -1) {
                        containSublistIds.push(sublistIds[i])
                    }
                }

                if (
                    (!containSublistIds.length && recType != 'opportunity') ||
                    recType == 'inventorytransfer' ||
                    (shippingItemMethod &&
                        shippingItemCost &&
                        shippingItemCost > 0 &&
                        transToValidateShipItem.indexOf(recType) != -1)
                ) {
                    let errorMsg = 'on header information'
                    let departmentIdMain = newRecord.getValue({
                        fieldId: 'department',
                    })

                    let areaIdMain = newRecord.getValue({
                        fieldId: CUSTOM_SEGMENT_FIELDID,
                    })

                    log.debug('departmentMain', departmentIdMain)
                    if (Object.keys(validDeptObj).length || Object.keys(areaDeptObj).length) {
                        validateDepartmentArea(departmentIdMain, areaIdMain, errorMsg, true)
                    }

                    if (!departmentIdMain || !areaIdMain) {
                        if (shippingItemMethod && transToValidateShipItem.indexOf(recType) != -1) {
                            errorMsg += ' due to the presence of shipping item'
                        }
                        emptyClassification.push(errorMsg)
                    }
                }

                if (containSublistIds.length) {
                    containSublistIds.forEach((sublistId) => {
                        lineCount = newRecord.getLineCount({
                            sublistId: sublistId,
                        })
                        for (
                            let line = 0;
                            line < lineCount &&
                            !(sublistId == lineSublistId.EXPENSE && transNotValidateExpense.indexOf(recType) != -1);
                            line++
                        ) {
                            let expenseAccId
                            let lineKey = line + 1
                            lineKey = sublistId + ' line ' + lineKey
                            log.debug('lineKey', lineKey)

                            if (sublistId == lineSublistId.ITEM) {
                                let itemType = newRecord.getSublistValue({
                                    sublistId: sublistId,
                                    fieldId: 'itemtype',
                                    line: line,
                                })

                                if (TO_VALIDATE_ITEMTYPE.indexOf(itemType) == -1) {
                                    continue
                                }
                            }

                            if (sublistId == lineSublistId.EXPENSE) {
                                expenseAccId = newRecord.getSublistValue({
                                    sublistId: sublistId,
                                    fieldId: 'account',
                                    line: line,
                                })
                            }
                            let deptId = newRecord.getSublistValue({
                                sublistId: sublistId,
                                fieldId: 'department',
                                line: line,
                            })

                            let areaId = newRecord.getSublistValue({
                                sublistId: sublistId,
                                fieldId: CUSTOM_SEGMENT_FIELDID,
                                line: line,
                            })

                            let accType

                            if (recType == 'journalentry') {
                                accType = newRecord.getSublistValue({
                                    sublistId: lineSublistId.LINE,
                                    fieldId: 'accounttype',
                                    line: line,
                                })
                            }

                            if (Object.keys(validDeptObj).length || Object.keys(areaDeptObj).length) {
                                validateDepartmentArea(deptId, areaId, lineKey, false)
                            }
                            log.debug('lineKey outer', lineKey)
                            if (
                                (!deptId || !areaId) &&
                                ((accType && PNL_ACCOUNT_TYPE.indexOf(accType) != -1) ||
                                    (expenseAccId && pnlAccounts.indexOf(parseInt(expenseAccId)) != -1) ||
                                    sublistId == lineSublistId.ITEM) &&
                                emptyClassification.indexOf(lineKey) == -1
                            ) {
                                log.debug('lineKey inner', lineKey)
                                emptyClassification.push(lineKey)
                            }
                        }
                    })
                }
            }

            log.debug('validateDeptMessage', validateDeptMessage)
            log.debug('validateAreaMessage', validateAreaMessage)
            log.debug('emptyClassification', emptyClassification)

            if (emptyClassification.length) {
                message += `A department or an ${SEGMENT_LABEL} is missing for the following line: ${emptyClassification.join(', ')}<br />`
            }

            if (validateDeptMessage.length) {
                message += `The following department is/are invalid for the following: ${validateDeptMessage.join(', ')}<br />`
            }

            if (validateAreaMessage.length) {
                message += `The ${SEGMENT_LABEL} are invalid for the following :- ${validateAreaMessage.join(', ')}<br />`
            }
            log.debug('message', message)
            newRecord.setValue({
                fieldId: 'custbody_trans_dept_area_error_log',
                value: message,
            })

            function validateDepartmentArea(departId, areaId, lineKey = 'On Main information', isHeader) {
                if (
                    departId &&
                    ((!validDeptObj[departId] &&
                        Object.keys(validDeptObj).length &&
                        !(
                            isHeader &&
                            shippingItemMethod &&
                            shippingItemCost &&
                            shippingItemCost > 0 &&
                            transToValidateShipItem.indexOf(recType) != -1
                        )) ||
                        (Object.keys(areaDeptObj).length && areaDeptObj[departId] && !areaDeptObj[departId].length)) &&
                    validateDeptMessage.indexOf(lineKey) == -1
                ) {
                    validateDeptMessage.push(lineKey)
                }

                if (
                    departId &&
                    validateDeptMessage.indexOf(lineKey) == -1 &&
                    Object.keys(areaDeptObj).length &&
                    areaId &&
                    areaDeptObj[departId] &&
                    areaDeptObj[departId].length &&
                    areaDeptObj[departId].indexOf(parseInt(areaId)) == -1
                ) {
                    validateAreaMessage.push(lineKey)
                }
            }
        }
    }

    /**
     * Function to get list of valide department/area based on the record type
     *
     * @param {number/string} recTypeId internal of the record type
     * @governance 10 units
     * @return deptIdObj
     */
    function getValideDept(recTypeId) {
        let deptIdObj = {}
        let queryString = `
        SELECT
            mtd.name,
            mtd.custrecord_mtp_tranactiontype transaction_type_id,
            mapDept.maptwo dept_id,
            mapArea .maptwo area_id 
        FROM
            CUSTOMRECORD_MAP_TRANSDEPT mtd
            INNER JOIN MAP_customrecord_map_transdept_custrecord_mtp_department mapDept ON mtd.id = mapDept .mapone --//comment: Join with multiselect list department
            LEFT JOIN  ${DEPARTMENT_SEG_TABLE_FIELD} mapArea ON  mapDept.maptwo = mapArea .mapone     --//comment: Join with multiselect list area in department record
        WHERE
            mtd.custrecord_mtp_tranactiontype = ${recTypeId}
        `

        let resultSet = query.runSuiteQL({
            query: queryString,
        }).results //10 units

        for (let i = 0; i < resultSet.length; i++) {
            let deptQuId = resultSet[i].values[2]
            let areaQuId = resultSet[i].values[3]

            if (!deptIdObj[deptQuId]) {
                deptIdObj[deptQuId] = []
            }

            if (areaQuId) {
                deptIdObj[deptQuId].push(areaQuId)
            }
        }

        return deptIdObj
    }

    /**
     * Function to get list of pairs of department/area
     *
     * @governance 10 units
     * @return deptIdObj
     */
    function areaDept() {
        let areaDept = {}
        let queryStr = `
        SELECT	
            d.id,
            mapArea .maptwo
        FROM 
            department d
            LEFT JOIN  ${DEPARTMENT_SEG_TABLE_FIELD} mapArea ON  d.id= mapArea .mapone 
        `

        let resultSet = query.runSuiteQL({
            query: queryStr,
        }).results //10 units

        for (let i = 0; i < resultSet.length; i++) {
            let deptQuId = resultSet[i].values[0]
            let areaQuId = resultSet[i].values[1]

            if (!areaDept[deptQuId]) {
                areaDept[deptQuId] = []
            }

            if (areaQuId) {
                areaDept[deptQuId].push(areaQuId)
            }
        }

        return areaDept
    }

    /**
     * Function to get list of nl accounts
     *
     * @governance 10 units
     * @return pnlAccounts
     */
    function getPNLAccounts() {
        let pnlAccounts = []
        let accQueryString = `
           SELECT
               acc.id,
               acc.fullName,
               acc.acctType
           FROM
               account acc
           WHERE
               acc.acctType IN (${PNL_ACCOUNT_TYPE.map((accType) => "'" + accType + "'").join(',')})
       `

        let resultSet = query.runSuiteQL({
            query: accQueryString,
        }).results //10 untis

        for (let i = 0; i < resultSet.length; i++) {
            let accId = resultSet[i].values[0]
            pnlAccounts.push(accId)
        }

        return pnlAccounts
    }

    /**
     * Validate if validation should be appplied based on effective transaction date
     *
     * @param {*} context
     */
    function validateEffectiveTranDate(newRec) {
        let toValid = false
        let postingPeriod = newRec.getValue({ fieldId: 'postingperiod' })
        let trandate = newRec.getValue({ fieldId: 'trandate' })

        if (postingPeriod || trandate) {
            let formatedtranDate = changeDateFormat(trandate)
            toValid =
                (postingPeriod && postingPeriod >= EFFECTIVE_POSTING_PERIOD) ||
                (!postingPeriod && formatedtranDate >= EFFECTIVE_TRANDATE)
        }

        return toValid
    }

    function changeDateFormat(dateString) {
        let date = new Date(dateString)

        return [
            date.getFullYear(),
            (date.getMonth() + 1).toString().padStart(2, '0'),
            date.getDate().toString().padStart(2, '0'),
        ].join('-') //YYYY-MM-DD
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
    }
})
