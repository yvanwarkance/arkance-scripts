<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<!-- translations -->
<#if .locale='fi_FI'>
    <#assign txtTitle='Ostotilaus' />
    <#assign labNumber='Ostotilaus' />
    <#assign labDate='Päivämäärä' />
    <#assign labPaymentConditions='Maksuehto' />
    <#assign labPrimaryContact='Asiakkaan yht eyshenkil' />
    <#assign labAutodeskContractNumber='Autodesk sopimusnumero' />
    <#assign labBillTO='Laskutusasiakas' />
    <#assign labShipTO='Toimitusasiakas' />
    <#assign labDueDate="Eräpäivä" />
    <#assign labBankDetails='Saajan tilinumero' />
    <#assign labVAT='Y-tunnus' />
    <#assign labItem='Tuote' />
    <#assign labQuantity='Määrä' />
    <#assign labPriceUnit='Yksikköhinta' />
    <#assign labAmount='Kok. hinta' />
    <#assign labTotals='Yhteensä' />
    <#assign labCompRegNUm='Y-tunnus' />
    <#assign labCompEmailInvoice='Sähköposti' />
    <#assign labPhone='Puhelinnumero' />
    <#assign labTAmount='Yhteensä ilman arvonlisäveroa' />
    <#assign labAmountVAT='ALV yhteensä' />
    <#assign labAmountInclVAT='Yhteensä' />
    <#assign labDiscount='Alennus' />
    <#assign labReferenceNumber='Viitteenne' />
    <#assign labValidity='Tarjouksen voimassaolo' />
    <#assign labContractNumber='Sopimusnumero' />
    <#assign labSerialNumber='Sarjanumero' />
    <#assign labPeriod='Kausi' />
    <#assign labStartDate='Aloituspäivämäärä' />
    <#assign labEndDate='Päättymispäivä' />
    <#assign labVATShifted="ALV siirretty" />
    <#assign labCustCode="Asiakasnumero" />
    <#assign txtPaidByIDeal='Invoice paid via iDeal' />
    <#assign txtPayInfo='Atliekant mokėjimą, nurodykite sąskaitos numerį' />
    <#assign labPrintoutNote="Tuloste Huomautus" />
    <#assign txtVATReverseNote='<b>ALV käänteisen maksun huomautukset:</b><br />Käänteinen verovelvollisuus - arvonlisävero, jonka vastaanottaja maksaa neuvoston direktiivin 2006/112/EY artiklan 44 mukaisesti.<br />' />
    <#assign labCompanyId='Įmonės ID: ' />
    <#assign Unit='Vnt.' />
    <#assign OrderConfirmText='Kiitos tilauksestasi. Vahvistamme tilauksen seuraavasti. Ellei toisin mainita, sovelletaan tarjouksen ehtoja.' />
    <#assign labUnit='Yksikkö' />
    <#assign txtTermsNotification='' />
    <#assign labFromInvoice='Kredituojama sąskaita faktūra' />
    <#assign labEndUser='Loppukäyttäjä' />
    <#assign labContractNumber='Sopimusnumero' />
    <#assign labSerialNum='Sarjanumero' />
    <#assign labDuration='Kausi' />
    <#assign labContractManageremail='Sopimusyhteyshenkilö e-mail' />
    <#assign labContractManager='Sopimusyhteyshenkilö' />
    <#else>
        <#assign txtTitle='Purchase Order' />
        <#assign labNumber='Number' />
        <#assign labDate='Date' />
        <#assign labPaymentConditions='Payment Conditions' />
        <#assign labPrimaryContact='Primary contact' />
        <#assign labAutodeskContractNumber='Autodesk Contract Number' />
        <#assign labBillTO='Bill to' />
        <#assign labShipTO='Ship to' />
        <#assign labDueDate="Due date" />
        <#assign labBankDetails='Bank details' />
        <#assign labVAT='VAT' />
        <#assign labItem='Item' />
        <#assign labQuantity='Quantity' />
        <#assign labPriceUnit='Price/Unit' />
        <#assign labAmount='Amount' />
        <#assign labTotals='Totals' />
        <#assign labCompRegNUm='Company Registration Number' />
        <#assign labCompEmailInvoice='Company email for Invoice' />
        <#assign labPhone='Phone' />
        <#assign labTAmount='Amount in' />
        <#assign labAmountVAT='Amount of VAT in' />
        <#assign labAmountInclVAT='Amount incl. VAT in' />
        <#assign labDiscount='Discount' />
        <#assign labReferenceNumber='Reference' />
        <#assign labValidity='Validity of offer' />
        <#assign labContractNumber='Contract number' />
        <#assign labSerialNumber='Serial Number' />
        <#assign labPeriod='Period' />
        <#assign labStartDate='Start date' />
        <#assign labEndDate='End date' />
        <#assign labVATShifted="VAT shifted" />
        <#assign labCustCode="Client code" />
        <#assign txtPaidByIDeal=record.terms />
        <#assign txtPayInfo='When paying, please state the invoice number.' />
        <#assign labPrintoutNote="Printout Note" />
        <#assign txtVATReverseNote='<b>VAT Reverse Charge Notes:</b><br />Reverse Charge - VAT to be accounted for by the recipient as per Article 44 of Council Directive 2006/112/EC.<br />' />
        <#assign labCompanyId='Company Code: ' />
        <#assign Unit='UN' />
        <#assign OrderConfirmText='Thank you for your order. We confirm the order as follows. Unless otherwise stated, the terms and conditions of the offer apply.' />
        <#assign labUnit='Unit' />
        <#assign txtTermsNotification='' />
        <#assign labFromInvoice='From Invoice ' />
        <#assign labEndUser='End User' />
        <#assign labContractNumber='Contract Number' />
        <#assign labSerialNum='Serial Number' />
        <#assign labDuration='Duration' />
        <#assign labContractManageremail='Contract Manager e-mail' />
        <#assign labContractManager='Contract Manager' />
</#if>
<pdf>

    <head>
        <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />
        <#if .locale=="zh_CN">
            <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />
            <#elseif .locale=="zh_TW">
                <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />
                <#elseif .locale=="ja_JP">
                    <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />
                    <#elseif .locale=="ko_KR">
                        <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />
                        <#elseif .locale=="th_TH">
                            <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />
        </#if>
        <macrolist>
            <macro id="nlheader">
                <table style="width: 100%; font-size: 10pt;">
                    <tr>
                        <td colspan="12">
                            <#if subsidiary.logo?length !=0>
                                <#if subsidiary.legalname?contains('AGA CAD, UAB')>
                                    <img src="${subsidiary.logo@Url}" style="width:185px; height:27px; margin-left:20px" />
                                    <#else>
                                        <img src="${subsidiary.logo@Url}" style="width:210px; height:70px" />
                                </#if>
                            </#if>
                        </td>
                        <td colspan="12" align="right" style="font-weight: bold;font-size:30;margin-top:10px;">
                            <!--<#if .locale = "en_US"><p>PVM sąskaita faktūra</p><#else><p>Invoice</p></#if>-->
                            ${txtTitle}
                        </td>
                    </tr>
                </table>
            </macro>
            <macro id="nlfooter">
                <table style="border-top: 1px solid black;width: 100%; font-size: 8pt;">
                    <tr>
                        <td align="left" colspan="3" style="padding: 0;"></td>
                        <td align="left" colspan="6"></td>
                        <td align="left" colspan="3" style="padding: 0;"></td>
                    </tr>
                    <tr>
                        <td align="left" colspan="3" style="padding: 0;">
                            ${subsidiary.legalname}
                        </td>
                        <td align="left" colspan="6" style="padding: 0;">&nbsp;<p><br /></p>
                        </td>
                        <td align="left" colspan="3" style="padding: 0;">&nbsp;<p><br /></p>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" colspan="3" style="padding: 0;">
                            <p>
                                ${subsidiary.mainaddress_text}
                            </p>
                            <#assign companyEmail=subsidiary.custrecord_invoice_company_email />
                            <#if record.billaddress?contains('Lithuania')>
                                <#assign companyEmail="Info@agacad.lt" />
                            </#if>
                            <p>
                                ${labPhone}: ${subsidiary.custrecord_sub_phone}
                                <br />
                                ${labCompEmailInvoice}: ${companyEmail}
                            </p>
                        </td>
                        <td colspan="6">
                        </td>
                        <td align="right" colspan="3" style="padding: 0;">
                            <p>
                                <span style="padding: 0;">
                                    ${labVAT}:</span><br />
                                ${subsidiary.federalidnumber}
                                <br /><br />
                                <span style="padding: 0;">
                                    ${labCompRegNUm}:</span><br />
                                ${subsidiary.custrecord_emea_company_reg_num}
                                <br />
                            </p>
                        </td>
                    </tr>
                </table>
            </macro>
        </macrolist>
        <style type="text/css">
        * {
            <#if .locale=="zh_CN">font-family: NotoSans, NotoSansCJKsc, sans-serif;
            <#elseif .locale=="zh_TW">font-family: NotoSans, NotoSansCJKtc, sans-serif;
            <#elseif .locale=="ja_JP">font-family: NotoSans, NotoSansCJKjp, sans-serif;
            <#elseif .locale=="ko_KR">font-family: NotoSans, NotoSansCJKkr, sans-serif;
            <#elseif .locale=="th_TH">font-family: NotoSans, NotoSansThai, sans-serif;
            <#else>font-family: NotoSans, sans-serif;
            </#if>
        }

        table {
            font-size: 9pt;
            table-layout: fixed;
        }

        th {
            font-weight: bold;
            font-size: 8pt;
            vertical-align: middle;
            padding: 5px 6px 3px;
            background-color: #1b4274;
            color: #FFFFFF;
        }

        td {
            padding: 4px 6px;
        }

        td p {
            align: left
        }
        </style>
    </head>

    <body header="nlheader" header-height="10%" footer="nlfooter" footer-height="65pt" padding="0.5in 0.5in 0.8in 0.5in" size="Letter">
        <table style="width: 100%; font-size: pt;">
            <tr>
                <td colspan="24">&nbsp;</td>
            </tr>
            <tr>
                <td colspan="7" style="font-size: 10pt; padding: 6px 0 2px; color: #333333;">
                    ${record.billaddress}
                    <br />
                    <#if record.entity.vatregnumber?has_content>
                        <p>
                            ${labVAT}: ${record.entity.vatregnumber}
                        </p>
                    </#if>
                    <#if record.billaddress?contains('Lithuania')>
                        <#assign companyID=record.entity.custentity_cb_companyid />
                        <p>
                            ${labCompanyId} ${companyID}
                        </p>
                    </#if>
                    <#assign indexCompNameStart=record.entity?index_of(" ")/>
                   <#assign customerCode = record.entity?substring(0,indexCompNameStart)/>
              </td>
              <td colspan=" 7">&nbsp;
                </td>
                <td colspan="9" rowspan="2">
                    <p style="margin-left: 5px">
                        ${labDate}: ${record.trandate}
                    </p>
                    <p style="margin-left: 5px">
                        ${labNumber}: ${record.tranid}
                    </p>
                    <p style="margin-left: 5px">
                        ${labCustCode}: ${customerCode}
                    </p>
                    <!--<p style = "margin-left: 5px">
${labFromInvoice}: ${record.createdfrom.tranid}
</p>-->
                    <table>
                        <tr>
                            <#if record.createdfrom.custbody_end_user_default_ship_address?has_content>
                                <td>
                                    ${labShipTO}:</td>
                                <td>
                                    ${record.createdfrom.custbody_end_user_default_ship_address}
                                </td>
                                <#else>
                                    <td>
                                        ${labShipTO}:</td>
                                    <td>
                                        ${record.shipaddress}
                                    </td>
                            </#if>
                        </tr>
                    </table>
                    <#if record.createdfrom.custbody_contract_manager_contact?has_content>
                        <p style="margin-left: 5px">
                            ${labContractManager}: ${record.custbody_contract_manager_contact}
                        </p>
                        <p style="margin-left: 5px">
                            ${labContractManageremail}: ${record.custbody_contract_manager_contact.email}
                        </p>
                    </#if>
                    <#if record.custbody_printout_note?has_content>
                        <p style="margin-left: 5px">
                            ${record.custbody_printout_note}
                        </p>
                    </#if>
                </td>
            </tr>
        </table>
        <!-- Items display-->
        <#assign totalDiscount=0>
        <#assign discountPresent=false>
        <#if record.item?has_content>
            <table style="width: 100%; margin-top: 10px;">
                <!-- start items -->
                <#list record.item as item>
                    <#if item_index==0>
                        <thead>
                            <tr>
                                <th colspan="15" style="background-color: #1b4274;">
                                    ${labItem}
                                </th>
                                <th align="center" colspan="3" style="background-color: #1b4274;">
                                    ${labQuantity}
                                </th>
                                <th align="right" colspan="3" style="background-color: #1b4274;">
                                    ${labPriceUnit}
                                </th>
                                <th align="right" colspan="3" style="background-color: #1b4274;">
                                    ${labAmount}
                                </th>
                            </tr>
                        </thead>
                    </#if>
                    <#if item.item="Description">
                        <tr>
                            <td align="left" colspan="15">
                                ${item.description}
                            </td>
                            <td align="center" colspan="3"></td>
                            <td align="right" colspan="3"></td>
                            <td align="right" colspan="3"></td>
                        </tr>
                    </#if>
                    <#if item.item !="Description">
                        <tr>
                            <td colspan="15"><span style="font-weight: bold;color: #333333;">
                                    ${item.item}
                                </span><br />
                                ${item.description}
                                <br />
                                <#if item.custcol_autodesk_contract_number?has_content>
                                    <span>
                                        ${labContractNumber}: ${item.custcol_autodesk_contract_number}
                                    </span> <br />
                                </#if>
                                <#if item.custcol_serial_number?has_content>
                                    <span>
                                        ${labSerialNum}: ${item.custcol_serial_number}
                                    </span> <br />
                                </#if>
                                <span>
                                    ${labDuration}: ${item.custcol_swe_contract_start_date} - ${item.custcol_swe_contract_end_date}
                                </span>
                            </td>
                            <td align="center" colspan="3">
                                ${item.quantity}
                            </td>
                            <td align="right" colspan="3">
                                <#if item.custcol_calculated_rate?has_content>
                                    ${item.rate?string['#,###,##0.00']}
                                </#if>
                            </td>
                            <td align="right" colspan="3">
                                <p>
                                    ${item.custcol_amount_before_discount?string['#,###,##0.00']}
                                </p>
                            </td>
                        </tr>
                    </#if>
                    <#if item.custcol_inline_discount?has_content>
                        <#assign discountPresent=true>
                    </#if>
                    <#if item.custcol_inline_discount?has_content>
                        <#assign totalDiscount=totalDiscount + item.custcol_line_discount_amount>
                    </#if>
                </#list><!-- end items -->
            </table>
            <hr style="width: 100%; color: #d3d3d3; background-color: #d3d3d3; height: 1px;" />
        </#if>
        <#assign trueSubtotal=record.subtotal + totalDiscount>
        <!-- Transaction Totals Section and Contract Manager Contact Info -->
        <table
            style="page-break-inside: avoid; width: 100%; margin-top: 30px;">
            <tr>
                <th colspan="7" style="background-color: #1b4274; height: 18px;">
                    <!--${record.custbody_tran_printout_translation.custrecord_tran_for_approval@label}:-->
                </th>
                <th colspan="5" style="background-color: #1b4274; height: 18px;">
                    <!--${labTotals}:-->
                </th>
            </tr>
            <tr>
                <td colspan="6">&nbsp;
                </td>
                <td colspan="1">&nbsp;</td>
                <td colspan="3" align="left"
                    style="font-weight: bold; color: #333333;">
                    ${labTAmount}
                    ${record.currencyname?replace("Euro","Eur")}
                </td>
                <td colspan="2" align="right" style="font-weight:bold;color:#333333;">
                    <p>
                        <#if trueSubtotal??>
                            ${trueSubtotal?string['#,###,##0.00']}
                        </#if>
                    </p>
                </td>
            </tr>
            <tr>
                <td colspan="6" style="text-decoration: none;">
                    <#if record.custbody_swe_from_contract !=''>
                        <#assign indexStart=record.custbody_contract_manager_contact?index_of(":") />
                        <#if indexStart lt 0>
                            <#assign indexStart=0 />
                            <#else>
                                <#assign indexStart=indexStart + 1 />
                        </#if>
                        <!--<#assign ccm = record.custbody_contract_manager_contact?substring(indexStart)/>
            ${ccm}-->
                    </#if>
                </td>
                <td colspan="1">&nbsp;
                </td>
                <td colspan="3" align="left">
                    <#if discountPresent=true>
                        ${labDiscount} </#if>
                </td>
                <td colspan="2" align="right">
                    <#if discountPresent=true>
                        ${totalDiscount?string['#,###,##0.00']}
                    </#if>
                </td>
            </tr>
            <tr>
                <td colspan="6">
                    <!--<table>
            <tr> 
            <td align="left">
${record.custbody_tran_printout_translation.custrecord_tran_your_reference@label}:</td>
            <td> ................................................</td> 
            </tr>
            <tr> 	
            <td align="left">
${record.trandate@label}: </td>
                <td> ................................................</td> 
            </tr>
            <tr> 
            <td align="left">
${record.custbody_tran_printout_translation.custrecord_tran_name@label}: </td>
                <td> ................................................</td> 
            </tr>
            <tr> 
                <td align="left">
${record.custbody_tran_printout_translation.custrecord_tran_function@label}:</td>
                <td> ................................................</td> 
            </tr>
            <tr> 
                <td colspan="2">&nbsp;</td>
            </tr>
            <tr> 
                <td align="left">
${record.custbody_tran_printout_translation.custrecord_tran_signature@label}:</td>
                <td> ................................................</td> 
            </tr>
        </table>-->
                            </td>
                            <td colspan="1">&nbsp;
                            </td>
                            <td colspan="3" align="left">
                                <p>
                                    ${labAmountVAT} ${record.currencyname?replace("Euro","Eur")}
                                </p>
                                <hr width="150%" />
                                <p style="font-weight: bold; color: #333333;">
                                    ${labAmountInclVAT} ${record.currencyname?replace("Euro","Eur")}
                                </p>
                            </td>
                            <td colspan="2" align="right">
                                <p>
                                    ${record.taxtotal?string['#,###,##0.00']}
                                </p>
                                <hr />
                                <p style="font-weight: bold; color: #333333;">
                                    ${record.total?string['#,###,##0.00']}
                                </p>
                            </td>
                        </tr>
                    </table>
                    <!-- Disclaimer Section
		<#if .locale == "nl_NL">
          	<p style="font-size: 9pt;page-break-after: always;">
			Bij betaling graag het betalingskenmerk vermelden
			</p>
		<#else>
          	<p style="font-size: 9pt;page-break-after: always;">
			When paying, please state the payment reference
			</p>
		</#if>-->
    </body>
</pdf>