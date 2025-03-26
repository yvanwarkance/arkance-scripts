<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<#assign labFromOpportunity='From opportunity' />
<#assign labEndUser='End User' />
<#assign labContractNumber='Contract Number' />
<#assign labSerialNum='Serial Number' />
<#assign labReferenceSerialNumber='Reference Serial Number' />
<#assign labOpportunityNumber='From opportunity' />
<#assign labDuration='Duration' />
<#assign labContractManageremail='Contract Manager e-mail' />
<#assign labContractManager='Contract Manager' />
<#assign labDatechOrderScenarioDisplay='Order Scenario' />
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
                        <td rowspan="3" style="padding: 0;">
                            <#if subsidiary.logo?length !=0><img src="${subsidiary.logo@Url}" style="margin: 7px; width:182px;height:70px" width="182" height="70" /> </#if>
                        </td>
                        <td colspan="3">&nbsp;</td>
                    </tr>
                </table>
            </macro>
            <macro id="nlfooter">
                <table class="footer" style="width: 100%;">
                    <tr>
                        <td colspan="12" align="right" width="100%">Page
                            <pagenumber />/
                            <totalpages />
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="margin: 0px;padding-top: 8px;" colspan="2">
                            <#if subsidiary.legalname !='Arkance Optimum France'><img height="35" src="https://5565205.app.netsuite.com/core/media/media.nl?id=29071&amp;c=5565205&amp;h=fHlBw3ApMvTQHds6Nkd9BCMOk2v9ju5KTXBw8YkNPg7qgMhX&amp;fcts=20201214044405&amp;whence=" style="float: right; margin: 3px;padding-top: 1px;" width="80" /></#if>
                        </td>
                        <td line-height="8.5" colspan="8" style="padding-top:10px;padding-left:7px;"><span class="footer-company-bold">
                                <#if subsidiary.legalname='Arkance Optimum France'>Sitech France<#else>
                                        ${subsidiary.legalname}
                                </#if>
                            </span><span class="footer-company-coordinate">&nbsp;${subsidiary.mainaddress.addr1}-${subsidiary.mainaddress.addr2}&nbsp;${subsidiary.mainaddress.zip} ${subsidiary.mainaddress.city}
                            </span><br /><span class="footer-agency footer-agency-bold">
                                ${subsidiary.custrecord_form_line1}
                            </span><br />
                            <#if subsidiary.legalname='Arkance Optimum France'><span class="footer-company-coordinate">www.arkance.world &nbsp; <#if subsidiary.custrecord_sub_phone !=''><span class="footer-company-coordinate">T&eacute;l. : ${subsidiary.custrecord_sub_phone}
                                        </span></#if></span>
                                <#else><span class="footer-company-coordinate"> www.arkance.world &nbsp; T&eacute;l. : ${subsidiary.custrecord_sub_phone}
                                    </span>
                            </#if> - <span class="footer-agency2">
                                ${subsidiary.custrecord_form_line2}
                            </span><br />
                            <!--	<span class="footer-company-coordinate">
${subsidiary.id.Url}
</span><span class="footer-company-bold">&nbsp;Tél. : 01 39 44 18 18</span><br />-->
                            <#if subsidiary.legalname='Arkance Systems France'><span class="footer-agency2">
                                    ${subsidiary.custrecord_form_line3}
                                </span></#if>
                            <#if subsidiary.legalname='Arkance Optimum France'><span class="footer-agency">
                                    ${subsidiary.custrecord_form_line3}
                                </span></#if>
                            <#if subsidiary.custrecord_autodesk_csn?has_content>
                                <span class="footer-company-coordinate"><br />Arkance Company CSN: ${subsidiary.custrecord_autodesk_csn}
                                </span>
                            </#if>
                        </td>
                        <td align="right" colspan="2">
                            <#if subsidiary.legalname !='Arkance Optimum France'>
                                <#if !record.class?c_lower_case?contains("bluebeam")>
                                    <img height="50" src="https://5565205.app.netsuite.com/core/media/media.nl?id=1816723&amp;c=5565205&amp;h=HnF4Qjxw5CF-TVDtlGnnQpSJoyRsx7nlRkpO2RAg0_LWxpmj" style="margin: 3px;padding-top: 1px;" width="76" />
                                    <#else>
                                        <img height="21" width="85" style="margin: 3px;padding-top: 3px;position:relative; right: 15px;" src="https://5565205.app.netsuite.com/core/media/media.nl?id=5389446&amp;c=5565205&amp;h=kYofT3sMnv_hwMziplpKfu763H-sGTjOBK938pmB9giKqm-A&amp;fcts=20250122034502" />
                                </#if>
                                <!--img height="10" width="40" src="https://5565205.app.netsuite.com/core/media/media.nl?id=7412&amp;c=5565205&amp;h=55fec30cedcfef81471d" style="margin: 3px;padding-top: 1px;" width="120" /-->
                            </#if>
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

        th p {
            align: left
        }

        table.footer td {
            padding: 0;
            font-size: 8pt;
        }

        span.footer-company-bold {
            font-size: 8pt;
            font-weight: bold;
            color: #254164;
        }

        span.footer-company-coordinate {
            font-size: 6.5pt;
            color: #254164;
        }

        span.footer-agency {
            font-size: 6.5pt;
            font-style: italic;
            color: #254164;
        }

        span.footer-agency2 {
            font-size: 6.5pt;
            color: #254164;
        }

        span.footer-agency-bold {
            font-weight: bold;
        }

        span.footer-tiny {
            font-size: 6pt;
            color: #254164;
        }
        </style>
    </head>

    <body header="nlheader" header-height="10%" footer="nlfooter" footer-height="65pt" padding="0.5in 0.5in 0.2in 0.5in" size="Letter">
        <table style="width: 100%; font-size: 10pt;align:right;">
            <tr>
                <td style="align:right;font-size: 24pt;font-weight:bold;vertical-align:top;">
                    ${record.custbody_tran_printout_translation.custrecord_po_print_page_title@label}
                </td>
            </tr>
        </table>
        <br />
        <table style="width: 100%; font-size: 10pt;align:left;">
            <tr>
                <td style="padding: 6px 0 2px; color: #333333;line-height:16px;vertical-align:top;">
                    ${record.entity.companyname}
                    <#--  Bluebeam specific condition for printouts  -->
                    <#if !record.class?c_lower_case?contains("bluebeam")>
                        <br />
                        ${record.billaddress}
                    <#else>
                        <#assign finalbilladdress = record.billaddress?replace(record.entity.companyname, "")>
                        ${finalbilladdress}
                    </#if>
                </td>
                <td style="width:50%;">
                    <table style="width: 100%; font-size: 10pt;align:left;">
                        <tr>
                            <td>
                                ${record.custbody_tran_printout_translation.custrecord_order_number@label}:</td>
                            <td style="padding-top: 2px;">
                                ${record.tranid}
                            </td>
                        </tr>
                        
                        <tr>
                            <td>
                                ${record.trandate@label}:</td>
                            <td style="padding-top: 2px;">
                                ${record.trandate}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ${record.custbody_tran_printout_translation.custrecord_contact_person@label}:</td>
                            <td style="padding-top: 2px;">
                                ${record.custbody_po_creator}
                                <br />
                                ${record.custbody_po_creator.phone}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ${record.custbody_tran_printout_translation.custrecord_payment_condition@label}:</td>
                            <td style="padding-top: 2px;">
                                ${record.terms}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <table style="width:100%;border-bottom: 1px solid black;width: 100%; font-size: 8pt;">
            <tr>
                <td>&nbsp;</td>
            </tr>
        </table>
        <table style="width: 100%; margin-top: 10px;align:center;">
            <tr>
                <#if record.createdfrom?has_content>
                    <td colspan="6" style="font-weight: bold; padding: 6px 0 2px 20px; color: #333333;">
                        ${record.custbody_tran_printout_translation.custrecord_end_user@label}:</td>
                    <td colspan="6" style="font-weight: bold; padding: 6px 0 2px 20px; color: #333333;">
                        ${record.custbody_tran_printout_translation.custrecord_info_contract_manager@label}:</td>
                    <#else>
                        <td colspan="12" style="font-weight: bold; padding: 6px 0 2px 20px; color: #333333;">
                            ${record.custbody_tran_printout_translation.custrecord_so_delivery_address@label}:</td>
                </#if>
            </tr>
            <tr>
                <#if record.createdfrom?has_content>
                    <td colspan="6" style="padding: 6px 0 2px 20px; color: #333333;">
                        <#if record.shipto?has_content>
                            ${record.shipto.shipaddress}
                            <#else>
                                ${record.shipaddress}
                        </#if>
                        <#-- Bluebeam specific condition for printouts -->
                            <#if !record.class?c_lower_case?contains("bluebeam")>
                                <#if record.shipto.custentity_autodesk_csn?has_content>
                                    <br /><span style="line-height:24px;">CSN: ${record.shipto.custentity_autodesk_csn?string.c}
                                    </span>
                                </#if>
                            </#if>
                    </td>
                    <td colspan="6" style="padding: 6px 0 2px 20px; color: #333333;">
                        <span>
                            ${record.custbody_tran_printout_translation.custrecord_tran_name@label} : ${record.custbody_contract_manager_contact.firstname}
                            <br />
                            ${record.custbody_tran_printout_translation.custrecord_tran_email@label} : ${record.custbody_contract_manager_contact.email}
                            <br />
                            ${record.custbody_tran_printout_translation.custrecord_tran_phone@label} : ${record.custbody_contract_manager_contact.phone}
                        </span>
                    </td>
                    <#else>
                        <td colspan="12" style="padding: 6px 0 2px 20px; color: #333333;">
                            ${record.shipaddress}
                        </td>
                </#if>
            </tr>
        </table>
        <#if record.item?has_content>
            <#--  For bluebeam specific condition for printouts  -->
            <table style="width: 100%; margin-top: 10px;">
                <!-- start items -->
                <#list record.item as item>
                    <#if item_index==0>
                        <thead>
                            <tr>
                                <th colspan="10">
                                    ${record.custbody_tran_printout_translation.custrecord_tran_item@label}
                                </th>
                                <#if record.createdfrom?has_content>
                                    <#--  Bluebeam specific condition for printouts  -->
                                    <#if !item.class?c_lower_case?contains("bluebeam")>
                                        <th align="center" colspan="4">
                                            ${record.custbody_tran_printout_translation.custrecord_autodesk_contract_number@label}
                                        </th>
                                    </#if>
                                    <th align="center" colspan="4">
                                        ${record.custbody_tran_printout_translation.custrecord_start_date@label}
                                    </th>
                                    <th align="center" colspan="3">
                                        ${record.custbody_tran_printout_translation.custrecord_end_date@label}
                                    </th>
                                </#if>
                                <th align="center" colspan="3">
                                    <#if .locale=="fr_FR">
                                        ${record.custbody_tran_printout_translation.custrecord_item_quantity@label}
                                        <#else />Qnt
                                    </#if>
                                </th>
                                <th align="right" colspan="3">
                                    ${record.custbody_tran_printout_translation.custrecord_tran_price_unit@label}
                                </th>
                                <th align="right" colspan="3">
                                    ${record.custbody_tran_printout_translation.custrecord_item_price@label}
                                </th>
                            </tr>
                        </thead>
                    </#if>
                    <tr>
                        <td colspan="10">
                            <span style="font-weight: bold; line-height: 150%; color: #333333;">
                                ${item.item}
                            </span>
                            <br />
                            <span style="font-weight: normal; line-height: 150%; color: #333333;">
                                ${item.description}
                            </span>
                            <#--  Bluebeam specific condition for printouts  -->
                            <#if item.class?c_lower_case?contains("bluebeam")>
                                <#if item.custcol_autodesk_contract_number?has_content>
                                    <br />
                                    <span>
                                        ${labContractNumber}: ${item.custcol_autodesk_contract_number}
                                    </span> <br />
                                </#if>
                                <#if item.custcol_serial_number?has_content>
                                    <span>
                                        ${labSerialNum}: ${item.custcol_serial_number}
                                    </span> <br />
                                </#if>
                                <#if item.custcol_autodesk_refserialnumber?has_content>
                                    <span>
                                        ${labReferenceSerialNumber}: ${item.custcol_autodesk_refserialnumber}
                                    </span> <br />
                                </#if>
                                <#if item.custcol_opportunity_number?has_content>
                                    <span>
                                        ${labOpportunityNumber}: ${item.custcol_opportunity_number}
                                    </span> <br />
                                </#if>
                                <#if item.custcol_datech_order_scenario?has_content>
                                    <span>
                                        ${labDatechOrderScenarioDisplay}: ${item.custcol_datech_order_scenario}
                                    </span> <br />
                                </#if>
                            </#if>
                        </td>
                        <#if record.createdfrom?has_content>
                            <#--  Bluebeam specific condition for printouts  -->
                            <#if !item.class?c_lower_case?contains("bluebeam")>
                                <td align="center" colspan="4">
                                    ${item.custcol_autodesk_contract_number}
                                </td>
                            </#if>
                            <td align="center" colspan="4">
                                ${item.custcol_swe_contract_start_date}
                            </td>
                            <td align="center" colspan="3">
                                ${item.custcol_swe_contract_end_date}
                            </td>
                        </#if>
                        <td align="center" colspan="3" line-height="150%">
                            ${item.quantity}
                        </td>
                        <td align="right" colspan="3">
                            ${item.rate?string['#,###,##0.00']}
                        </td>
                        <td align="right" colspan="3">
                            ${item.amount?string['#,###,##0.00']}
                        </td>
                    </tr>
                </#list><!-- end items -->
            </table>
        </#if>
        <#if record.expense?has_content>
            <table style="width: 100%; margin-top: 10px;">
                <!-- start expenses -->
                <#list record.expense as expense>
                    <#if expense_index==0>
                        <thead>
                            <tr>
                                <th colspan="12">
                                    ${expense.category@label}
                                </th>
                                <th colspan="10">
                                    ${expense.account@label}
                                </th>
                                <th align="right" colspan="4">
                                    ${expense.amount@label}
                                </th>
                            </tr>
                        </thead>
                    </#if>
                    <tr>
                        <td colspan="12">
                            ${expense.category}
                        </td>
                        <td colspan="10"><span class="itemname">
                                ${expense.account}
                            </span></td>
                        <td align="right" colspan="4">
                            ${expense.amount?string['#,###,##0.00']}
                        </td>
                    </tr>
                </#list><!-- end expenses -->
            </table>
        </#if>
        <hr style="width: 100%; color: #d3d3d3; background-color: #d3d3d3; height: 1px;" />
        <table style="width: 100%; margin-top: 0px;">
            <tr>
                <td colspan="4">&nbsp;</td>
                <td align="center" colspan="12">&nbsp;</td>
                <td align="center" colspan="3" line-height="150%">&nbsp;</td>
                <td align="right" colspan="4" style="font-weight: bold">
                    <#if .locale=="fr_FR">
                        ${record.total@label}
                        <#else />Total
                    </#if>
                </td>
                <td align="right" colspan="4" style="font-weight: bold">
                    ${record.subtotal?string['#,###,##0.00']}
                </td>
            </tr>
        </table>
        <table style="page-break-after: always; width: 100%; margin-top: 100px;">
            <tr>
                <td colspan="2">&nbsp;</td>
                <th align="left">
                    <#if .locale=="fr_FR">
                        ${record.custbody_tran_printout_translation.custrecord_tran_totals@label}
                        <#else />Total
                    </#if>
                </th>
                <th align="left">&nbsp;</th>
            </tr>
            <tr style="line-height: 200%;">
                <td colspan="2">&nbsp;</td>
                <td align="right" style="font-weight: bold">
                    ${record.custbody_tran_printout_translation.custrecord_amount_vat@label} ${record.currencyname}
                </td>
                <td align="right" style="font-weight: bold">
                    ${record.taxtotal?string['#,###,##0.00']}
                </td>
            </tr>
            <tr style="line-height: 200%;">
                <td colspan="2">&nbsp;</td>
                <td align="right" style="font-weight: bold">
                    ${record.custbody_tran_printout_translation.custrecord_amount_inc_vat@label} ${record.currencyname}
                </td>
                <td align="right" style="font-weight: bold">
                    ${record.total?string['#,###,##0.00']}
                </td>
            </tr>
        </table>
    </body>
</pdf>