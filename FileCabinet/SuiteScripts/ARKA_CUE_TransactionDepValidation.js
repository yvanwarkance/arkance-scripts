/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/query', 'N/ui/message', 'N/search', 'N/runtime'], function (query, msg, search, runtime) {
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

    function pageInit(context) {
        let script = runtime.getCurrentScript()

        let effectiveDate = script.getParameter({
            name: 'custscript_eff_trandate',
        })

        EFFECTIVE_POSTING_PERIOD = script.getParameter({
            name: 'custscript_eff_postperiod',
        })

        CUSTOM_SEGMENT_FIELDID = script.getParameter({
            name: 'custscript_classification_field_id',
        })

        DEPARTMENT_SEG_TABLE_FIELD = script.getParameter({
            name: 'custscript_dep_seg_field',
        })

        EFFECTIVE_TRANDATE = changeDateFormat(effectiveDate)

        if (SEGMENT_LABEL == 'location') {
            SEGMENT_LABEL = 'location'
        } else {
            SEGMENT_LABEL = 'area'
        }
    }
    /**
     *  Function to
     * 1. validate department based on Mapping transaction department record
     * 2. Prevent saving if pnl transaction on journal entry or other transaction has the department and area empty on line or on header
     * 3. Prevent saving if area is not valid for the desired department
     *
     * @param {*} context
     * @governance 30 units
     */
    function saveRecord(context) {
        let sublistIds = [lineSublistId.ITEM, lineSublistId.INVENTORY, lineSublistId.LINE, lineSublistId.EXPENSE]
        let transNotValidateExpense = ['itemreceipt']
        let transToValidateShipItem = ['estimate', 'salesorder', 'invoice', 'creditmemo']
        let containSublistIds = []
        let allowRecordSave = true
        let currentRec = context.currentRecord
        let recType = context.currentRecord.type
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

        //log.error('Enter', recType);
        if (!validateEffectiveTranDate(currentRec)) {
            return true
        }

        recTypeId = currentRec.getValue({
            fieldId: 'ntype',
        })

        shippingItemMethod = currentRec.getValue({
            fieldId: 'shipmethod',
        })

        shippingItemCost = currentRec.getValue({
            fieldId: 'shippingcost',
        })

        //log.error('Enter recTypeId', recTypeId);
        if (recTypeId) {
            validDeptObj = getValideDept(recTypeId) //10 units - only bring configure mapping department transaction
            areaDeptObj = areaDept() //10 units - only bring paired department and area
            pnlAccounts = getPNLAccounts() //10 units - list pnl accounts

            for (let i = 0; i < sublistIds.length; i++) {
                lineCount = currentRec.getLineCount({
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
                let departmentIdMain = currentRec.getValue({
                    fieldId: 'department',
                })

                let departmentNameMain = currentRec.getText({
                    fieldId: 'department',
                })

                let areaIdMain = currentRec.getValue({
                    fieldId: CUSTOM_SEGMENT_FIELDID,
                })

                let areaNameMain = currentRec.getText({
                    fieldId: CUSTOM_SEGMENT_FIELDID,
                })
                //log.debug('departmentMain', departmentIdMain);
                if (Object.keys(validDeptObj).length || Object.keys(areaDeptObj).length) {
                    validateDepartmentArea(
                        departmentIdMain,
                        departmentNameMain,
                        areaIdMain,
                        areaNameMain,
                        errorMsg,
                        true
                    )
                }

                if ((!departmentIdMain || !areaIdMain) && emptyClassification.indexOf(errorMsg) == -1) {
                    if (shippingItemMethod && transToValidateShipItem.indexOf(recType) != -1) {
                        errorMsg += ' due to the presence of shipping item'
                    }
                    emptyClassification.push(errorMsg)
                }
            }

            if (containSublistIds.length) {
                containSublistIds.forEach((sublistId) => {
                    lineCount = currentRec.getLineCount({
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
                        lineKey = sublistId.toUpperCase() + ' line ' + lineKey
                        //log.debug('lineKey', lineKey)

                        if (sublistId == lineSublistId.ITEM) {
                            let itemType = currentRec.getSublistValue({
                                sublistId: sublistId,
                                fieldId: 'itemtype',
                                line: line,
                            })

                            if (TO_VALIDATE_ITEMTYPE.indexOf(itemType) == -1) {
                                continue
                            }
                            //log.debug('itemType', itemType);
                        }

                        if (sublistId == lineSublistId.EXPENSE) {
                            expenseAccId = currentRec.getSublistValue({
                                sublistId: sublistId,
                                fieldId: 'account',
                                line: line,
                            })
                        }

                        let deptId = currentRec.getSublistValue({
                            sublistId: sublistId,
                            fieldId: 'department',
                            line: line,
                        })

                        let deptName = currentRec.getSublistText({
                            sublistId: sublistId,
                            fieldId: 'department',
                            line: line,
                        })

                        let areaId = currentRec.getSublistValue({
                            sublistId: sublistId,
                            fieldId: CUSTOM_SEGMENT_FIELDID,
                            line: line,
                        })

                        let areaName = currentRec.getSublistText({
                            sublistId: sublistId,
                            fieldId: CUSTOM_SEGMENT_FIELDID,
                            line: line,
                        })

                        let accType
                        let accName

                        if (recType == 'journalentry') {
                            accType = currentRec.getSublistText({
                                sublistId: lineSublistId.LINE,
                                fieldId: 'accounttype',
                                line: line,
                            })

                            accName = currentRec.getSublistText({
                                sublistId: lineSublistId.LINE,
                                fieldId: 'account',
                                line: line,
                            })

                            lineKey += `:${accName}` //lineNum:Accoount name
                        }

                        if (Object.keys(validDeptObj).length || Object.keys(areaDeptObj).length) {
                            validateDepartmentArea(deptId, deptName, areaId, areaName, lineKey, false)
                        }
                        if (
                            (!deptId || !areaId) &&
                            ((accType && PNL_ACCOUNT_TYPE.indexOf(accType) != -1) ||
                                (expenseAccId && pnlAccounts.indexOf(parseInt(expenseAccId)) != -1) ||
                                sublistId == lineSublistId.ITEM) &&
                            emptyClassification.indexOf(lineKey) == -1
                        ) {
                            //log.debug('lineKey inner', lineKey);
                            emptyClassification.push(lineKey)
                        }
                    }
                })
            }
        }
        //log.debug('validateDeptMessage', validateDeptMessage);
        //log.debug('validateAreaMessage', validateAreaMessage);
        //log.debug('emptyClassification', emptyClassification);

        if (emptyClassification.length) {
            message += `A department or an ${SEGMENT_LABEL} is missing for the following line: ${emptyClassification.join(', ')}<br />`
        }

        if (validateDeptMessage.length) {
            message += `The department is/are invalid for this transaction for the following line: ${validateDeptMessage.join(', ')}<br />`
        }

        if (validateAreaMessage.length) {
            message += `The ${SEGMENT_LABEL} are invalid  department[${SEGMENT_LABEL}] combinations for the following lines: ${validateAreaMessage.join(', ')}<br />`
        }

        if (message) {
            allowRecordSave = false

            msg.create({
                title: 'Error Saving',
                message: message,
                type: msg.Type.ERROR,
            }).show(10000)
        }

        function validateDepartmentArea(departId, departName, areaId, areaName, lineRef, isHeader) {
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
                validateDeptMessage.indexOf(lineRef) == -1
            ) {
                validateDeptMessage.push(lineRef)
            }

            if (
                departId &&
                validateDeptMessage.indexOf(lineRef) == -1 &&
                Object.keys(areaDeptObj).length &&
                areaId &&
                areaDeptObj[departId] &&
                areaDeptObj[departId].length &&
                areaDeptObj[departId].indexOf(parseInt(areaId)) == -1
            ) {
                validateAreaMessage.push(lineRef)
            }
        }

        return allowRecordSave
    }

    /**
     * Automatically fill in department and product area if sales order and ite are both filled on journal lines
     *
     * @param {*} context
     * @governance
     */
    function validateLine(context) {
        let currentRec = context.currentRecord
        let recType = currentRec.type
        let sublistName = context.sublistId
        let department = ''
        let segment = ''

        if (!validateEffectiveTranDate(currentRec)) {
            return true
        }

        if (recType == 'journalentry' && sublistName == lineSublistId.LINE) {
            let soLine = currentRec.getCurrentSublistValue({
                sublistId: lineSublistId.LINE,
                fieldId: 'custcol_salesorder_manual_je',
            })

            let item = currentRec.getCurrentSublistValue({
                sublistId: lineSublistId.LINE,
                fieldId: 'custcol_item',
            })

            let dept = currentRec.getCurrentSublistValue({
                sublistId: lineSublistId.LINE,
                fieldId: 'department',
            })

            let segmentLine = currentRec.getCurrentSublistValue({
                sublistId: lineSublistId.LINE,
                fieldId: CUSTOM_SEGMENT_FIELDID,
            })

            if (soLine && item && (!dept || !segmentLine)) {
                let itemObjSubrec = search.lookupFields({
                    type: search.Type.ITEM,
                    id: item,
                    columns: ['department', CUSTOM_SEGMENT_FIELDID],
                })

                department = itemObjSubrec.department.length ? itemObjSubrec.department[0].value : ''
                segment = itemObjSubrec[CUSTOM_SEGMENT_FIELDID].length
                    ? itemObjSubrec[CUSTOM_SEGMENT_FIELDID][0].value
                    : ''

                currentRec.setCurrentSublistValue({
                    sublistId: lineSublistId.LINE,
                    fieldId: 'department',
                    value: department,
                })

                currentRec.setCurrentSublistValue({
                    sublistId: lineSublistId.LINE,
                    fieldId: CUSTOM_SEGMENT_FIELDID,
                    value: segment,
                })
            }
        }

        return true
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
     * Validate if validation should be appplied based on effective transaction date
     *
     * @param {*} context
     */
    function validateEffectiveTranDate(currentRec) {
        let toValid = false
        let postingPeriod = currentRec.getValue({ fieldId: 'postingperiod' })
        let trandate = currentRec.getValue({ fieldId: 'trandate' })

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

    function fieldChanged(context) {
        let currentRec = context.currentRecord
        let recType = currentRec.type
        let department = ''
        let area = ''

        //log.error('context', context);
        if (!validateEffectiveTranDate(currentRec)) {
            return true
        }

        if (
            (context.fieldId == 'category' || context.fieldId == 'account') &&
            (recType == 'expensereport' || context.line == 0) &&
            context.sublistId == lineSublistId.EXPENSE
        ) {
            department = currentRec.getValue('department')
            area = currentRec.getValue(CUSTOM_SEGMENT_FIELDID)

            let actualLineDep = currentRec.getCurrentSublistValue({
                sublistId: lineSublistId.EXPENSE,
                fieldId: 'department',
            })

            let actualLineArea = currentRec.getCurrentSublistValue({
                sublistId: lineSublistId.EXPENSE,
                fieldId: CUSTOM_SEGMENT_FIELDID,
            })

            if (area && !actualLineArea) {
                currentRec.setCurrentSublistValue({
                    sublistId: lineSublistId.EXPENSE,
                    fieldId: CUSTOM_SEGMENT_FIELDID,
                    value: area,
                })
            }

            if (department && !actualLineDep) {
                currentRec.setCurrentSublistValue({
                    sublistId: lineSublistId.EXPENSE,
                    fieldId: 'department',
                    value: department,
                })
            }
        }
    }

    return {
        pageInit: pageInit,
        validateLine: validateLine,
        saveRecord: saveRecord,
        fieldChanged: fieldChanged,
    }
})
