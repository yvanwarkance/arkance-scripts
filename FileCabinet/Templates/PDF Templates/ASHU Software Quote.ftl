<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<!-- translations -->
<#if record.entity.language?contains('Hun')>
    <#assign txtTitle='Ajánlat' />
    <#assign labNumber='Ajánlat száma' />
    <#assign labDate='Kiállítás dátuma' />
    <#assign labCompletionDate='Teljesítés dátuma' />
    <#assign labPaymentConditions='Fizetési feltételek' />
    <#assign labPrimaryContact='Címzett' />
    <#assign labContractManager='Szerződéskezelő' />
    <#assign labAutodeskContractNumber='Autodesk szerződésszám' />
    <#assign labBillTO='Címzett' />
    <#assign labShipTO='Szállítási cím' />
    <#assign labDueDate="Fizetési határidő" />
    <#assign labPaymentMethod="Fizetési mód" />
    <#assign labBankDetails='Banki adatok' />
    <#assign labVATPrc='ÁFA %' />
    <#assign labVAT='Adószám' />
    <#assign labItem='Tétel' />
    <#assign labUnit='M.e.' />
    <#assign labQuantity='Mennyiség' />
    <#assign labPriceUnit='Egységár' />
    <#assign labAmount='Nettó érték' />
    <#assign labTotals='Összesen' />
    <#assign labCompRegNUm='Cégjegyzékszám' />
    <#assign labCompEmailInvoice='Email' />
    <#assign labPhone='Telefon' />
    <#assign labTAmount='Összesen' />
    <#assign labAmountVAT='ÁFA összeg' />
    <#assign labAmountInclVAT='Fizetendő végösszeg' />
    <#assign labDiscount='Kedvezmény' />
    <#assign labReferenceNumber='Referencia' />
    <#assign labValidity='Az ajánlat érvényessége' />
    <#assign labContractNumber='Szerződésszám' />
    <#assign labSerialNumber='Sorozatszám' />
    <#assign labPeriod='Időszak' />
    <#assign labStartDate='Kezdés dátuma' />
    <#assign labEndDate='Befejezés dátuma' />
    <#assign labVATShifted="ÁFA eltolódott" />
    <#assign labCustCode="Ügyfélkód" />
    <#assign txtPaidByIDeal='Az iDeal-en keresztül fizetett számla' />
    <#assign labCompanyId='Cégkód: ' />
    <#assign labAdvancePayment='Előleg' />
    <#assign txtUnitTypeUnits='db' />
    <#assign txtUnitTypeHours='óra' />
    <#assign txtUnitTypeDays='nap' />
    <#assign txtPayMethodTransfer='Átutalás' />
    <#assign txtPayMethodCash='Készpénz' />
    <#assign txtPayMethodCard='Kártya' />
    <#assign txtPayMethodVoucher='Utalvány' />
    <#assign txtPayMethodOther='Egyéb' />
    <#assign txtPayInfo='Fizetéskor kérjük feltüntetni a számla számát' />
    <#assign txtTermsNotification='Erre az ajánlatra általános szerződési feltételeink vonatkoznak.' />
    <#assign txtVATReverseNote='ÁFA fordított adózás Megjegyzések: Fordított adózás – az ÁFA-t a címzettnek kell elszámolnia a 2006/112/EK tanácsi irányelv 44. cikke szerint. ' />
    <#assign labTax='Adókulcs(%)' />
    <#assign labTotalinBox='Nettó összeg' />
    <#assign labTotalinWithoutDiscountBox='Kedvezmény nélküli nettó összeg' />
    <#assign urlGeneralConditionsPDF="" />
    <#else>
        <#assign txtTitle='Offer' />
        <#assign labNumber='Number' />
        <#assign labDate='Date' />
        <#assign labCompletionDate='Completion date' />
        <#assign labPaymentConditions='Payment Conditions' />
        <#assign labPrimaryContact='Contact' />
        <#assign labContractManager='Contract Manager' />
        <#assign labAutodeskContractNumber='Autodesk Contract Number' />
        <#assign labBillTO='Bill to' />
        <#assign labShipTO='Ship to' />
        <#assign labDueDate="Due date invoice" />
        <#assign labPaymentMethod="Payment method" />
        <#assign labBankDetails='Bank details' />
        <#assign labVATPrc='VAT %' />
        <#assign labVAT='VAT' />
        <#assign labItem='Item' />
        <#assign labUnit='Unit' />
        <#assign labQuantity='Quantity' />
        <#assign labPriceUnit='Price/Unit' />
        <#assign labAmount='Amount' />
        <#assign labTotals='Totals' />
        <#assign labCompRegNUm='Company Registration Number' />
        <#assign labCompEmailInvoice='Email' />
        <#assign labPhone='PHONE' />
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
        <#assign txtPaidByIDeal='Invoice paid via iDeal' />
        <#assign labCompanyId='Company Code: ' />
        <#assign labAdvancePayment='Advance payment' />
        <#assign txtUnitTypeUnits='UN' />
        <#assign txtUnitTypeHours='Hr' />
        <#assign txtUnitTypeDays='Manday' />
        <#assign txtPayMethodTransfer='Transfer' />
        <#assign txtPayMethodCash='Cash' />
        <#assign txtPayMethodCard='Card' />
        <#assign txtPayMethodVoucher='Voucher' />
        <#assign txtPayMethodOther='Other' />
        <#assign txtPayInfo=' ' />
        <#assign txtVATReverseNote=' ' />
        <#assign txtTermsNotification='' />
        <#assign labTax='Tax Rate(%)' />
        <#assign labTotalinBox='Total' />
        <#assign labTotalinWithoutDiscountBox='Total without discount' />
        <#assign urlGeneralConditionsPDF="" />
</#if>
<#if record.currency?upper_case !="HUF">
    <#assign txtIBAN=subsidiary.custrecord_sta_einvoicing_payee_iban />
    <#assign txtSWIFT=subsidiary.custrecord_company_bic />
    <#assign txtVAT="27028614-2-43<br />" + subsidiary.federalidnumber />
    <#else>
        <#assign txtIBAN="11600006-00000000-83854576" />
        <#assign txtSWIFT=subsidiary.custrecord_company_bic />
        <#assign txtVAT="27028614-2-43<br />" + subsidiary.federalidnumber />
</#if>
<pdfset>
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
            <!-- There is no inter italic and inter bolditalic, so the normal versions are used -->
            <#assign font_inter_regular="https://5565205.app.netsuite.com/core/media/media.nl?id=2250137&amp;c=5565205&amp;h=Rm2XkmqTVQxEpBL8RP_Z7m9cqjEpaTqmKedbU1CCgVJabnYu&amp;_xt=.ttf" />
            <#assign font_inter_bold="https://5565205.app.netsuite.com/core/media/media.nl?id=2250141&amp;c=5565205&amp;h=XVIf-Zn1hdkiqFStMZjumNrIwqlxXD88T6gkLXnwTR93hCR8&amp;_xt=.ttf" />
            <link name="Inter" type="font" subtype="truetype" src="${font_inter_regular?html}" src-bold="${font_inter_bold?html}" src-italic="${font_inter_regular?html}" src-bolditalic="${font_inter_bold?html}" />
            <macrolist>
                <macro id="nlheader">
                    <table style="width: 100%; font-size: 10pt;">
                        <tr>
                            <td colspan="12">
                                <#if subsidiary.logo?length !=0>
                                    <#if subsidiary.legalname?contains('AGA CAD, UAB')>
                                        <img src="${subsidiary.logo@Url}" style="width:185px; height:27px; margin-left:20px" />
                                        <#else>
                                            <img src="${subsidiary.logo@Url}" style="width:210px; height:80px" />
                                    </#if>
                                </#if>
                            </td>
                            <td colspan="12" align="right" style="font-weight: bold;font-size:30;margin-top:10px;">
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
                            <td align="left" colspan="6" style="padding: 0;">&nbsp;<p></p>
                            </td>
                            <td align="left" colspan="3" style="padding: 0;">&nbsp;<p> </p>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" colspan="5" style="vertical-align:top;padding: 0;">
                                <#if record.entity.language?contains('Hun')>
                                    <p>
                                        ${subsidiary.mainaddress_text?replace('Hungary','')}
                                    </p>
                                    <#else>
                                        <p>
                                            ${subsidiary.mainaddress_text}
                                        </p>
                                </#if>
                                <p>
                                    ${labPhone}: ${subsidiary.custrecord_sub_phone}
                                    <br />
                                    ${labCompEmailInvoice}: ${subsidiary.custrecord_invoice_company_email}
                                </p>
                            </td>
                            <td colspan="4" style="vertical-align:top;padding: 0;">
                                <p>
                                    <span style="color:#1b4274;">
                                        ${labBankDetails}:</span><br />
                                    ${txtIBAN}
                                    <br />
                                    SWIFT: ${txtSWIFT}
                                </p>
                            </td>
                            <td align="right" colspan="3" style="vertical-align:top;padding: 0;">
                                <p>
                                    <span style="color:#1b4274;">
                                        ${labVAT}:</span><br />
                                    ${txtVAT}
                                    <!-- <span style="padding: 0;">
${labCompRegNUm}:</span><br />
${subsidiary.custrecord_emea_company_reg_num}
<br />-->
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
                <#else>font-family: Inter, sans-serif;
                </#if>
            }

            body {
                font-family: Inter, Arial, sans-serif;
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
                align: left;
            }

            .totBoxTable {}

            .totBoxLabel {
                font-size: 11px;
                vertical-align: top;
                border-bottom: solid 1px #000000;
            }

            .totBoxValueLast,
            .totBoxValueLast {
                font-size: 11px;
                vertical-align: bottom;
                height: 20px;
            }

            .totBoxValue {
                border-bottom: solid 1px #000000;
            }
            </style>
        </head>

        <body header="nlheader" header-height="10%" footer="nlfooter" footer-height="80pt" padding="0.5in 0.5in 1.0in 0.5in" size="Letter">
            <table style="width: 100%;">
                <tr>
                    <td colspan="24">&nbsp;</td>
                </tr>
                <tr>
                    <#assign billAddress=record.billaddress />
                    <#assign shipAddress=record.custbody_end_user_default_ship_address />
                    <#if billAddress?starts_with("CUST")>
                        <#assign billAddress=record.billaddress?keep_after(" ")/>
                </#if>
                <#if shipAddress?starts_with(" CUST")>
                            <#assign shipAddress=shipAddress?keep_after(" ")/>
                </#if>
                <#if record.entity.language?contains('Hun') >
                  <#if billAddress?ends_with(" Hungary")>
                                <#assign billAddress=billAddress?keep_before_last("Hungary") />
                    </#if>
                    <#if shipAddress?ends_with("Hungary")>
                        <#assign shipAddress=shipAddress?keep_before_last("Hungary") />
                    </#if>
                    </#if>
                    <td colspan="8" style="padding: 6px 0 2px; color: #333333;">
                        <p><b>
                                ${labBillTO}:</b><br />
                            ${billAddress}
                        </p>
                        <#if record.custbody_custom_contactperson?has_content>
                            <p>
                                ${labPrimaryContact}: ${record.custbody_custom_contactperson}
                            </p>
                        </#if>
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
                    </td>
                    <td colspan="7" style="padding: 6px 0 2px; color: #333333;">
                        <p>
                            <!--
                      <#if shipAddress!= billAddress>
                       <b>
${labShipTO}:</b><br />
                        ${shipAddress}
                      </#if>
                    -->
                        </p>
                    </td>
                    <td colspan="9" rowspan="2">
                        <p>
                            ${labNumber}: ${record.tranid}
                        </p>
                        <p>
                            <#if record.entity.language?contains('Hun')>
                                ${labDate}: ${record.trandate?string('yyyy.MM.dd')}
                                <#else>
                                    ${labDate}: ${record.trandate}
                            </#if>
                        </p>
                        <p>
                            <#if record.entity.language?contains('Hun')>
                                ${labValidity}: ${record.custbody_validity_date?string('yyyy.MM.dd')}
                                <#else>
                                    ${labValidity}: ${record.custbody_validity_date}
                            </#if>
                        </p>
                        <#if record.custbody_sta_hu_vat_delivery_date?has_content>
                            <p>
                                <#if record.entity.language?contains('Hun')>
                                    ${labCompletionDate}: ${record.custbody_sta_hu_vat_delivery_date?string('yyyy.MM.dd')}
                                    <#else>
                                        ${labCompletionDate}: ${record.custbody_sta_hu_vat_delivery_date}
                                </#if>
                            </p>
                        </#if>
                        <#assign indexCompNameStart=record.entity?index_of(" ")/>
                    <#assign customerCode = record.entity?substring(0,indexCompNameStart)/>
                    <p>
                      ${labCustCode}: ${customerCode}
                    </p>
                    <#if record.custbody_contract_manager_contact?has_content>
                      <p>
                        ${labContractManager}: ${record.custbody_contract_manager_contact}
                      </p>
                    </#if>
                    <#if record.terms?has_content>
                      <p>
                        ${labPaymentConditions}: ${record.terms}
                      </p>
                    </#if>
                </td>
            </tr>            
        </table>

<!-- Items display-->
<#assign totalDiscount = 0>  
<#assign discountOnLine = false/>
<#list record.item as item>
    <#if item.custcol_inline_discount?has_content && item.custcol_inline_discount != 0>
        <#assign discountOnLine = true/>
    </#if>
</#list>
<#assign discountDisplay = " onTotal" />
<#if record.custbody_discount_layout_options="Show discount inline and the total discount amount on the totals.">
    <#assign discountDisplay="inlineAndTotal" />
<#elseif record.custbody_discount_layout_options="Show total discount on the totals.">
    <#assign discountDisplay="onTotal" />
<#elseif record.custbody_discount_layout_options="Do not show discount. The amount on the lines are the discounted amount.">
    <#assign discountDisplay="noDiscount" />
</#if>
                        <#if record.item?has_content>
                            <table style="width: 100%; margin-top: 10px;">
                                <!-- start items -->
                                <#list record.item as item>
                                    <#if item_index==0>
                                        <thead>
                                            <tr>
                                                <th colspan="11" align="left">
                                                    ${labItem}
                                                </th>
                                                <th align="center" colspan="2">
                                                    ${labVATPrc}
                                                </th>
                                                <th align="right" colspan="2">
                                                    ${labUnit}
                                                </th>
                                                <th align="center" colspan="3">
                                                    ${labQuantity}
                                                </th>
                                                <th align="right" colspan="3">
                                                    ${labPriceUnit}
                                                </th>
                                                <#if discountDisplay="inlineAndTotal" && discountOnLine=true>
                                                    <th align="right" colspan="3">
                                                        ${labDiscount}
                                                    </th>
                                                </#if>
                                                <th align="right" colspan="3">
                                                    ${labAmount}
                                                </th>
                                            </tr>
                                        </thead>
                                    </#if>
                                    <#if item.item="Description">
                                        <tr>
                                            <td align="left" colspan="11">
                                                ${item.description}
                                            </td>
                                            <td align="center" colspan="2"></td>
                                            <td align="center" colspan="2"></td>
                                            <td align="right" colspan="3"></td>
                                            <td align="right" colspan="3"></td>
                                            <#if discountDisplay="inlineAndTotal" && discountOnLine=true>
                                                <td align="right" colspan="3"></td>
                                            </#if>
                                            <td align="right" colspan="3"></td>
                                        </tr>
                                    </#if>
                                    <#if item.item !="Description" && item.itemtype !="EndGroup">
                                        <#--  1st content row  -->
                                        <tr>
                                            <#--  1st cell  -->
                                            <td align="left" colspan="11" style="line-height:14px;">
                                                <#if item.itemtype="Group">
                                                    <b>
                                                        ${item.description}
                                                    </b>
                                                    <#else>
                                                        <#if item.item="Advance Payment Item">
                                                            <b>
                                                                ${labAdvancePayment}
                                                            </b><br />
                                                            ${item.description}
                                                            <#else>
                                                                <b>
                                                                    ${item.item}
                                                                </b><br />
                                                                ${item.description}
                                                        </#if>
                                                </#if>
                                                <#if item.custcol_autodesk_contract_number?has_content>
                                                    <br />
                                                    ${labContractNumber}: ${item.custcol_autodesk_contract_number}
                                                </#if>
                                                <#if record.custbody_order_type!="Contract - New">
                                                    <#if item.custcol_swe_contract_start_date?has_content && item.custcol_swe_contract_end_date?has_content>
                                                        <br />
                                                        ${labPeriod}: ${item.custcol_swe_contract_start_date} - ${item.custcol_swe_contract_end_date}
                                                        <#else>
                                                            <#if item.custcol_swe_contract_start_date?has_content>
                                                                <br />
                                                                ${labStartDate}: ${item.custcol_swe_contract_start_date}
                                                            </#if>
                                                            <#if item.custcol_swe_contract_end._date?has_content>
                                                                <br />
                                                                ${labEndDate}: ${item.custcol_swe_contract_end_date}
                                                            </#if>
                                                    </#if>
                                                </#if>
                                                <#if item.itemtype="Group">
                                                    <br />
                                                    ${labPeriod}: ${record.startdate} - ${record.enddate}
                                                </#if>
                                                <#if item.custcol_serial_number?has_content>
                                                    <br />
                                                    ${labSerialNumber}: ${item.custcol_serial_number}
                                                </#if>
                                            </td>
                                            <#--  2nd cell  -->
                                            <td align="center" colspan="2">
                                                ${item.taxrate1}
                                            </td>
                                            <#--  3rd cell  -->
                                            <#assign txtUnit=txtUnitTypeUnits />
                                            <#if item.units="">
                                                <#assign txtUnit="" />
                                            </#if>
                                            <#if item.units="Hr">
                                                <#assign txtUnit=txtUnitTypeHours />
                                            </#if>
                                            <#if item.units="Manday">
                                                <#assign txtUnit=txtUnitTypeDays />
                                            </#if>
                                            <#if item.itemtype="Group">
                                                <#assign txtUnit=txtUnitTypeUnits />
                                            </#if>
                                            <#if item.item="Advance Payment Item">
                                                <#assign txtUnit=txtUnitTypeUnits />
                                            </#if>
                                            <td align="right" colspan="2">
                                                ${txtUnit}
                                            </td>
                                            <#--  4th cell  -->
                                            <td align="center" colspan="3">
                                                ${item.quantity}
                                            </td>
                                            <#--  5th cell (while removing discount)  -->
                                            <#assign cal_rate=item.custcol_rate_before_discount />
                                            <#if item.itemtype=="Group" || item.itemtype=="EndGroup">
                                                <#if item.quantity!=0>
                                                    <#assign cal_rate=(item.custcol_amount_before_discount / item.quantity) />
                                                </#if>
                                            </#if>
                                            <td align="right" colspan="3">
                                                <#if item.itemtype="Discount" || discountDisplay="noDiscount">
                                                    ${item.rate?replace('Ft','')?replace('€','')}
                                                <#else>
                                                    ${cal_rate?string['#,###,##0.00']}
                                                </#if>
                                            </td>
                                            
                                            <#--  6th cell (dynamically added with discount logic) & last cell   -->
                                            <#if (discountDisplay="inlineAndTotal" || discountDisplay="noDiscount" ) && discountOnLine=true>
                                                <#if discountDisplay="inlineAndTotal">
                                                    <td align="center" colspan="3">
                                                        <#if item.custcol_inline_discount !=0>
                                                            <#--  6th cell  -->
                                                            ${item.custcol_line_discount_amount?string['#,###,##0.00']}
                                                            <br />
                                                            (${item.custcol_inline_discount})
                                                        </#if>
                                                    </td>
                                                </#if>
                                                <#assign discountedAmount=item.custcol_amount_before_discount - item.custcol_line_discount_amount>
                                                <td align="right" colspan="3">
                                                    <#--  last cell  -->
                                                    ${discountedAmount?string['#,###,##0.00']}
                                                </td>
                                            <#else>
                                                <#--  last cell only  -->
                                                <td align="right" colspan="3">
                                                    ${item.custcol_amount_before_discount?string['#,###,##0.00']}
                                                </td>
                                            </#if>
                                        </tr>
                                    </#if>
                                    <#if item.custcol_inline_discount?has_content>
                                        <#assign totalDiscount=totalDiscount + item.custcol_line_discount_amount>
                                    </#if>
                                </#list><!-- end items -->
                            </table>
                        </#if>
                        <#assign trueSubtotal=record.subtotal + totalDiscount>
                        <!-- Transaction Totals Section and Contract Manager Contact Info -->
                        <table
                            style="page-break-inside: avoid; width: 100%; margin-top: 10px;">
                            <tr>
                                <th colspan="15"></th>
                                <th colspan="9">
                                    ${labTotals}:</th>
                            </tr>
                            <#--  1st row total  -->
                            <#if (discountDisplay="inlineAndTotal" || discountDisplay="onTotal" )>
                                <tr>
                                    <td colspan="14">&nbsp;</td>
                                    <td colspan="1">&nbsp;</td>
                                    <td colspan="6" align="left" style="font-weight: bold; color: #333333;">
                                        <#if discountDisplay="inlineAndTotal">
                                            ${labTotalinWithoutDiscountBox}
                                            <#else>
                                                ${labTotalinBox}
                                        </#if>
                                        ${record.currencyname?replace("Euro","Eur")}
                                    </td>
                                    <td colspan="3" align="right" style="font-weight:bold;color:#333333;">
                                        <#if trueSubtotal??>
                                            ${trueSubtotal?string['#,###,##0.00']}
                                        </#if>
                                    </td>
                                </tr>
                            </#if>
                            <#--  2nd & 3rd row total  -->
                            <#if totalDiscount !=0 && (discountDisplay="inlineAndTotal" || discountDisplay="onTotal" )>
                                <tr>
                                    <td colspan="14" style="text-decoration: none;">
                                    </td>
                                    <td colspan="1">&nbsp;
                                    </td>
                                    <td colspan="6" align="left">
                                        <#if totalDiscount !=0>
                                            ${labDiscount}
                                        </#if>
                                    </td>
                                    <td colspan="3" align="right">
                                        <#if totalDiscount !=0>-&nbsp;${totalDiscount?string['#,###,##0.00']}
                                        </#if>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="14">&nbsp;</td>
                                    <td colspan="1">&nbsp;</td>
                                    <td colspan="6" align="left" style="font-weight: bold; color: #333333;">
                                        ${labTotalinBox}
                                        ${record.currencyname?replace("Euro","Eur")}
                                    </td>
                                    <#if (discountDisplay="inlineAndTotal" || discountDisplay="noDiscount" )>
                                        <td colspan="3" align="right" style="font-weight:bold;color:#333333;">
                                            <#if trueSubtotal??>
                                                ${record.subtotal?string['#,###,##0.00']}
                                            </#if>
                                        </td>
                                    <#else>
                                        <td colspan="3" align="right" style="font-weight:bold;color:#333333;">
                                            <#if trueSubtotal??>
                                                ${trueSubtotal?string['#,###,##0.00']}
                                            </#if>
                                        </td>
                                    </#if>
                                </tr>
                            </#if>
                            <#--  4th row total  -->
                            <#if discountDisplay="onTotal">
                                <#assign BaseImponible=trueSubtotal - totalDiscount>
                                    <tr>
                                        <td colspan="14">&nbsp;</td>
                                        <td colspan="1">&nbsp;</td>
                                        <td colspan="6" align="left">
                                            ${labTAmount}
                                            ${record.currencyname?replace("Euro","Eur")}
                                        </td>
                                        <td colspan="3" align="right" style="color:#333333;">
                                            ${BaseImponible?string['#,###,##0.00']}
                                        </td>
                                    </tr>
                            </#if>

                            <#--  last total row  -->
                            <tr>
                                <td colspan="14" rowspan="2">
                                </td>
                                <td colspan="1">&nbsp;
                                </td>
                                <td colspan="6" align="left">
                                    <p>
                                        ${labAmountVAT} ${record.currencyname?replace("Euro","Eur")}
                                    </p>
                                    <hr width="150%" />
                                    <p style="font-weight: bold; color: #333333;">
                                        ${labAmountInclVAT} ${record.currencyname?replace("Euro","Eur")}
                                    </p>
                                </td>
                                <td colspan="3" align="right">
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
                        <!-- Printout Note display-->
                        <#if record.custbody_printout_note?has_content>
                            <p style="line-height:18px;font-size: 9pt;">
                                ${record.custbody_printout_note}
                            </p>
                        </#if>
        </body>
    </pdf>
    <#if (urlGeneralConditionsPDF?length>0) >
        <pdf src="${urlGeneralConditionsPDF}" />
    </#if>
</pdfset>