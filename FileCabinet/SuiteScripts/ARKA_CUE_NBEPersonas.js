/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/query'], (query) => {
    var dropDownList = []
    let contactsObj = {}
    let shippingObj = {}

    const DATATYPE = {
        SELECT: 'select',
        MULTISELECT: 'multiselect',
    }

    /**
     * Populate the dynamic fields with the attached contacts
     *
     * @param {Object} - scriptContext
     * @param {Record} - scriptContext.currentRecord
     * @param {String} - scriptContext.mode - (create, copy, or edit)
     * @returns {void}
     * @governance 0 unit
     */
    function pageInit(scriptContext) {
        let currRec = scriptContext.currentRecord
        //Transform == Copy
        if (currRec.type == 'opportunity' || currRec.type == 'estimate') {
            dropDownList.push({
                nsfield: 'custbody_arka_adminmain',
                nsnextfield: 'custbody_arka_adminmain',
                sourcedfield: 'entity',
                genid: 'custpage_arka_adminmain',
                genName: 'Quote Admin',
                isMandatory: false,
                isAddr: false,
                type: DATATYPE.SELECT,
            })

            dropDownList.push({
                nsfield: 'custbody_arka_recipientsmain',
                nsnextfield: 'custbody_arka_recipientsmain',
                sourcedfield: 'entity',
                genid: 'custpage_arka_recipientsmain',
                genName: 'Quote Recipients',
                isMandatory: false,
                isAddr: false,
                type: DATATYPE.MULTISELECT,
            })
        }

        dropDownList.map((dropDownOptions) => {
            if (scriptContext.mode == 'edit' || scriptContext.mode == 'copy' || scriptContext.mode == 'create') {
                //hidden added field if the ns field don't appear on form
                let nsField = currRec.getField({
                    fieldId: dropDownOptions.nsfield,
                })

                if ((nsField && nsField.isDisplay == false) || !nsField) {
                    currRec.getField({
                        fieldId: dropDownOptions.genid,
                    }).isDisplay = false
                }

                let tmpValue = currRec.getValue(dropDownOptions.sourcedfield)
                //console.log('PageInit - ' + dropDownOptions.sourcedfield, tmpValue);

                if (tmpValue) {
                    getAllContacts(tmpValue, dropDownOptions.sourcedfield, dropDownOptions.isAddr)

                    selectField = currRec.getField({
                        fieldId: dropDownOptions.genid,
                    })

                    if (selectField) {
                        selectField.removeSelectOption({
                            value: null,
                        })

                        let initFieldId = currRec.getValue(dropDownOptions.nsfield)
                        let initFieldText = currRec.getText(dropDownOptions.nsfield)

                        var dataList = contactsObj[dropDownOptions.sourcedfield]

                        var selectedOption = { id: initFieldId, name: initFieldText }

                        populateDropDown(selectField, dataList, selectedOption, selectField.type)
                    }
                }
            }
        })
    }

    function populateDropDown(dropDown, dataList, selectedObj, dataType) {
        let arraySelectedId = []
        if (selectedObj && selectedObj.id) {
            if (dataType && dataType == DATATYPE.MULTISELECT) {
                selectedObj.id.forEach((id, index) => {
                    arraySelectedId.push(id)
                })
            } else {
                arraySelectedId.push(selectedObj.id)
            }
        }

        //DEFAULT VALUE ADDED blank
        dropDown.insertSelectOption({
            value: 0,
            text: '',
        })

        //ADDING DEFAULT VALUES
        dataList.map((data) => {
            dropDown.insertSelectOption({
                value: data.id,
                text: data.name,
                isSelected: arraySelectedId.includes(data.id),
            })
        })
    }

    /**
     * Function to be executed when field is changed.
     * @param {Object} - scriptContext
     * @param {Record} - scriptContext.currentRecord
     * @param {String} - scriptContext.mode - (create, copy, or edit)
     * @returns {void}
     * @governance 0 unit
     */
    function fieldChanged(scriptContext) {
        let currRec = scriptContext.currentRecord
        let currField = scriptContext.fieldId

        //Check if field inside before sending in loop
        let isFieldFoundArray = dropDownList.filter(
            (dropDownOptions) => dropDownOptions.sourcedfield == currField || dropDownOptions.genid == currField
        )

        if (isFieldFoundArray.length) {
            dropDownList.map((dropDownOptions) => {
                if (currField == dropDownOptions.sourcedfield) {
                    // console.log('Field Changed ===============> ' + dropDownOptions.sourcedfield);
                    let tmpValue = currRec.getValue(currField)
                    selectField = currRec.getField({
                        fieldId: dropDownOptions.genid,
                    })

                    if (tmpValue) {
                        getAllContacts(tmpValue, dropDownOptions.sourcedfield, dropDownOptions.isAddr)

                        if (selectField) {
                            selectField.removeSelectOption({
                                //Empty dropdown
                                value: null,
                            })

                            if (contactsObj[dropDownOptions.sourcedfield].length > 0) {
                                //Default selection == empty
                                var emptySelection = { id: 0, name: '' }
                                var dataList = contactsObj[dropDownOptions.sourcedfield]
                                populateDropDown(selectField, dataList, emptySelection)

                                //Empty NetSuite Field
                                currRec.setValue({
                                    fieldId: dropDownOptions.nsfield,
                                    value: null,
                                    ignoreFieldChange: true,
                                })

                                // console.log('Field Empptid + ' +  dropDownOptions.nsfield);
                            }
                        }
                    } //Empty
                    else {
                        selectField.removeSelectOption({
                            value: null,
                        })

                        currRec.setValue({
                            fieldId: dropDownOptions.nsfield,
                            value: null,
                            ignoreFieldChange: true,
                        })
                    }
                }

                //Replicate value on NS field
                if (!dropDownOptions.isAddr && currField == dropDownOptions.genid) {
                    //DO NOT replicate on ship address as it overrides old change to set address
                    //console.log(' NS ID ' + dropDownOptions.genid + '   ----   ' + dropDownOptions.nsfield);
                    //console.log(' NS ID ' + dropDownOptions.genid);
                    //console.log(currRec.getValue(dropDownOptions.genid));

                    currRec.setValue({
                        fieldId: dropDownOptions.nsfield,
                        value: currRec.getValue(dropDownOptions.genid),
                    })
                }
            })
        }
    }

    /**
     * Function to be get attached contacts and set on the global variable
     * @param {string} - customer id
     * @param {string} - variable name to store data
     * @governance 10 unit
     */
    function getAllContacts(customerId, fieldName, isAddress) {
        contactsObj[fieldName] = [] //Empty global value

        let contactCustQuery = `
            SELECT
                ct.id,
                ct.entityTitle,
                ct.email,
            FROM 
                customer cust
                INNER JOIN CompanyContactRelationship ccr ON ccr.company= cust.id
                INNER JOIN contact ct ON ccr.contact = ct.id
            WHERE
                cust.id = ${customerId}
                AND ct.email IS NOT NULL
                AND ct.isinactive = 'F'
        `

        let resultSet = query.runSuiteQL({
            query: contactCustQuery,
        }).results

        resultSet.forEach((d) => {
            contactsObj[fieldName].push({
                id: d.values[0].toString(),
                name: `${d.values[1]} (${d.values[2]})`,
            })
        })

        //console.log('Fetched data ==============>');
        //console.log(contactsObj);
        //console.log(contactsObj[fieldName]);
    }

    function saveRecord(context) {
        dropDownList.map((dropDownOptions) => {
            if (dropDownOptions.isMandatory) {
                // Validate Mandatory fields
                var currentRecord = context.currentRecord
                let nsSelValue = currentRecord.getValue(dropDownOptions.genid)

                if (!nsSelValue) {
                    // alert('Enter value for:' + dropDownOptions.genName);
                    return false
                }
            }
        })

        return true
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
    }
})
