<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">

<#--  Variables to be used in the template (for the discount display logic - Bluebeam Project)  -->

<#if .locale=="fr_FR">
    <#assign labDiscount = "Remise" />
    <#assign labTotalinWithoutDiscountBox='Sous-Total HT (sans remise)' />
    <#assign labTotalinBox='Sous-Total HT' />
    <#assign labTAmount='Montant en' />
    <#assign labAmountVAT='Total TVA' />
    <#assign labAmountInclVAT='Total TTC' />
    <#assign labAmountExclVAT='Sous-Total HT' />
    <#assign labTotalinEuro='Total en Euro' />
<#else>
    <#assign labDiscount = "Discount" />
    <#assign labTotalinWithoutDiscountBox='Total exclude VAT (w/o discount)' />
    <#assign labTotalinBox='Total exclude VAT' />
    <#assign labTAmount='Amount in' />
    <#assign labAmountVAT='Total VAT' />
    <#assign labAmountInclVAT='Total' />
    <#assign labAmountExclVAT='Subtotal HT' />
    <#assign labTotalinEuro='Total in Euro' />
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
                <table style="width: 100%;">
                    <tr>
                        <td colspan="2" rowspan="3" align="left" style="padding: 0;">
                            <#if subsidiary.legalname=='Arkance Optimum France'><img src="https://5565205.app.netsuite.com/core/media/media.nl?id=7759&amp;c=5565205&amp;h=lgyRAw5kz7ySij-iU0MCq5gvh3bXOpfmAmBu83_TqzLkpeOm" style="float: left; padding: 0; margin: 0px; width:220px;height:100px" /> </#if>
                        </td>
                        <td colspan="1">&nbsp;</td>
                        <td colspan="2" rowspan="3" align="right" style="padding: 0;">
                            <#if subsidiary.logo?length !=0><img src="${subsidiary.logo@Url}" style="float: right; margin: 7px; width:220px;height:100px" /> </#if>
                        </td>
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
                        <td align="left" style="margin: 0px;padding-top: 8px;" colspan="1">
                            <!--<#if subsidiary.legalname != 'Arkance Optimum France'><img height="35" src="https://5565205.app.netsuite.com/core/media/media.nl?id=29071&amp;c=5565205&amp;h=fHlBw3ApMvTQHds6Nkd9BCMOk2v9ju5KTXBw8YkNPg7qgMhX&amp;fcts=20201214044405&amp;whence=" style="float: right; margin: 3px;padding-top: 1px;" width="80" /></#if>-->
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
            background-color: #40477E;
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

        span.addressheader {
            font-weight: bold;
            font-size: 8pt;
            padding-bottom: 10px;
        }
        </style>
    </head>

    <body header="nlheader" header-height="10%" footer="nlfooter" footer-height="30pt" padding="0.1in 0.5in 0.4in 0.5in" size="letter">
        <table style="width: 100%; margin-top: 10px;padding-top: 20px;">
            <tr>
                <td style="font-size:24;padding-top: 2px;">
                    ${record.custbody_tran_printout_translation.custrecord_tran_invoice@label}
                </td>
            </tr>
        </table>
        <table style="width: 100%;">
            <tr>
                <td style="width: 55%;padding: 0">
                    <table style="width: 100%;margin-top:30px;line-height:100%">
                        <tr>
                            <td width="35%">
                                ${record.custbody_tran_printout_translation.custrecord_tran_inv_number@label} :</td>
                            <td width="65%" style="padding-top: 2px;">
                                <#if record.status=="Pending Approval" || record.status=="En attente d'approbation">Pro Forma <#else>
                                        ${record.tranid}
                                </#if>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <#if .locale=="fr_FR">N° de commande :<#else>Order number :</#if>
                            </td>
                            <td style="padding-top: 2px;">
                                ${record.otherrefnum}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ${record.custbody_tran_printout_translation.custrecord_tran_inv_date@label} :</td>
                            <td style="padding-top: 2px;">
                                ${record.trandate}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <#if .locale=="fr_FR">Date d'échéance :<#else>
                                        ${record.duedate@label} :</#if>
                            </td>
                            <td style="padding-top: 2px;">
                                ${record.duedate}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <#if .locale=="fr_FR">Délai de paiement :<#else>Terms :</#if>
                            </td>
                            <td style="padding-top: 2px;">
                                ${record.terms}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ${record.custbody_tran_printout_translation.custrecord_tran_your_vat_num@label} :</td>
                            <td style="padding-top: 2px;">
                                ${record.entity.vatregnumber}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                ${record.custbody_tran_printout_translation.custrecord_tran_client_num@label} :</td>
                            <td style="padding-top: 2px;">
                                ${record.entity.entityid}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <#if .locale=="fr_FR">Vos références :<#else>
                                        ${record.custbody_tran_printout_translation.custrecord_tran_your_reference@label} :</#if>
                            </td>
                            <td style="padding-top: 2px;">
                                <#list record.createdfrom.createdfrom?split("#") as recordpart>
                                    <#if recordpart_index==1>
                                        ${recordpart}
                                    </#if>
                                </#list>
                            </td>
                        </tr>
                        <#if record.custbody_swe_from_contract !='' || record.custbody_contract_name !=''>
                            <#assign AutodeskContractNumberAlreadyDisplayed=false>
                                <tr>
                                    <td>
                                        <#if .locale=="fr_FR">Contrat N° :<#else>Contract N° :</#if>
                                    </td>
                                    <td style="padding-top: 2px;">
                                        <#if record.item?has_content>
                                            <#list record.item as item>
                                                <#if item.custcol_product_line=="Autodesk" && AutodeskContractNumberAlreadyDisplayed==false>
                                                    ${item.custcol_autodesk_contract_number}
                                                    <#assign AutodeskContractNumberAlreadyDisplayed=true>
                                                </#if>
                                            </#list>
                                        </#if>
                                        <#if AutodeskContractNumberAlreadyDisplayed==false>
                                            <#if record.item?has_content>
                                                <#list record.item as item>
                                                    <#if item_index==0>
                                                        ${item.custcol_autodesk_contract_number}
                                                    </#if>
                                                </#list>
                                            </#if>
                                        </#if>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        ${record.custbody_tran_printout_translation.custrecord_tran_period@label} :</td>
                                    <td style="padding-top: 2px;">
                                        <#if record.item?has_content>
                                            <#list record.item as item>
                                                <#if item_index==0>
                                                    ${item.custcol_swe_contract_start_date} - ${item.custcol_swe_contract_end_date}
                                                </#if>
                                            </#list>
                                        </#if>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <#if .locale=="fr_FR">Commercial :<#else>
                                                ${record.salesrep@label} :</#if>
                                    </td>
                                    <td style="padding-top: 2px;">
                                        ${record.salesrep}
                                    </td>
                                </tr>
                                <#else>
                                    <tr>
                                        <td>
                                            <#if .locale=="fr_FR">Commercial :<#else>
                                                    ${record.salesrep@label} :</#if>
                                        </td>
                                        <td style="padding-top: 2px;">
                                            ${record.salesrep}
                                        </td>
                                    </tr>
                                    <tr height="35px"></tr>
                        </#if>
                    </table>
                </td>
                <td style="width: 45%;padding: 0">
                    <table style="width: 100%;margin-top:20px;">
                        <tr>
                            <td colspan="2" rowspan="8" align="left" style="font-size:9;padding-right:50px;">
                                <p style="padding:0px">
                                    <span class="addressheader">
                                        ${record.billaddress@label}
                                    </span><br />
                                    ${record.billaddress}
                                </p>
                                <p style="margin-top:105px">
                                    <span class="addressheader">
                                        ${record.shipaddress@label}
                                    </span><br />
                                    ${record.shipaddress}
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <#--  Logic to apply discounts on the total amount (According to the specifications of the bluebeam project)  -->
        <#--  Refer to ASF Inventory & Software Estimate.ftl for more details about how this process works  -->
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

        <!-- Items Section-->
        <!-- Items display-->
        <#assign totalDiscount=0>
                <#if record.item?has_content>
                    <table style="width: 100%; margin-top: 10px;">
                        <!-- start items -->
                        <#list record.item as item>
                            <#if item_index==0>
                                <thead>
                                    <#setting number_format="0.##">
                                        <tr>
                                            <th align="left" colspan="14">
                                                ${item.description@label}
                                            </th>
                                            <th align="center" colspan="2">
                                                ${record.custbody_tran_printout_translation.custrecord_tran_quantity@label}
                                            </th>
                                            <th align="center" colspan="2">
                                                ${record.custbody_tran_printout_translation.custrecord_tran_price_unit@label}
                                            </th>

                                            <#--  4th cell dynamically added with discount logic  -->
                                            <#if discountDisplay="inlineAndTotal" && discountOnLine=true>
                                                <th align="center" colspan="2">
                                                    ${labDiscount}
                                                </th>
                                            </#if>
                                            <th align="center" colspan="2">
                                                ${item.amount@label}
                                            </th>
                                        </tr>
                                </thead>
                            </#if>
                            <#assign itemIsAService=false>
                                <tr>
                                    <td align="left" colspan="14">
                                        <span style="font-weight: bold; line-height: 150%; color: #333333;">
                                            ${item.item}
                                        </span><br />
                                        ${item.description}
                                        <#list item.item?split("-") as itempart>
                                            <#if itempart_index==0 && itempart=="SER">
                                                <#assign itemIsAService=true>
                                            </#if>
                                            <#if itempart_index==1 && itempart=="HOT">
                                                <br />
                                                <#if .locale=="fr_FR">Contrat N°<#else>Contract N°</#if> : ${item.custcol_autodesk_contract_number}
                                            </#if>
                                        </#list>
                                    </td>
                                    <td align="center" colspan="2" line-height="150%">
                                        ${item.quantity}
                                    </td>

                                    <#--  3rd cell (while removing discount) -->
                                    <#assign cal_rate=item.custcol_rate_before_discount />
                                    <#if item.itemtype=="Group" || item.itemtype=="EndGroup">
                                        <#if item.quantity!=0>
                                            <#assign cal_rate=(item.custcol_amount_before_discount / item.quantity) />
                                        </#if>
                                    </#if>
                                    <td align="right" colspan="2">
                                        <#if (item.itemtype="Discount" || discountDisplay="noDiscount")>
                                            <#if item.rate?? && item.rate?has_content>
                                                ${item.rate?string['#,###,##0.00']}
                                            <#else>
                                                0.00
                                            </#if>
                                        <#else>
                                            <#if (discountDisplay="inlineAndTotal" || discountDisplay="onTotal")>
                                                <#if cal_rate?? && cal_rate?has_content>
                                                    ${cal_rate?string['#,###,##0.00']}
                                                <#else>
                                                    0.00
                                                </#if>
                                            <#else>
                                                <#if item.custcol_calculated_rate?? && item.custcol_calculated_rate?has_content>
                                                    ${item.custcol_calculated_rate?number?string['#,###,##0.00']}
                                                <#else>
                                                    0.00
                                                </#if>
                                            </#if>
                                            
                                        </#if>
                                    </td>


                                    <#--  <td align="center" colspan="2">
                                        <#if item.custcol_calculated_rate?? && item.custcol_calculated_rate?has_content>
                                            ${item.custcol_calculated_rate?number?string['#,###,##0.00']}
                                        <#else>
                                            0.00
                                        </#if>
                                    </td>  -->


                                    <#--  4th cell (Dynamically added with discount logic) & last cell  -->
                                    <#if (discountDisplay="inlineAndTotal" || discountDisplay="noDiscount" ) && discountOnLine=true>
                                        <#--  4th cell  -->
                                        <#if discountDisplay="inlineAndTotal">
                                            <td align="right" colspan="2">
                                                <#if item.custcol_inline_discount !=0>
                                                    
                                                    ${item.custcol_line_discount_amount?string['#,###,##0.00']}
                                                    <br />
                                                    (${item.custcol_inline_discount*100}%)
                                                </#if>
                                            </td>
                                        <#else>
                                            <#if discountDisplay !="noDiscount">
                                                <td align="right" colspan="2">
                                                    ${item.amount?string['#,###,##0.00']}
                                                </td>
                                            </#if>
                                        </#if>
                                        <#--  last cell  -->
                                        <#assign discountedAmount = 0>
                                        <#if item.custcol_amount_before_discount?? && item.custcol_amount_before_discount?has_content>
                                            <#if item.custcol_line_discount_amount?? && item.custcol_line_discount_amount?has_content>
                                                <#assign discountedAmount = item.custcol_amount_before_discount?number - item.custcol_line_discount_amount?number>
                                            <#else>
                                                <#assign discountedAmount = item.custcol_amount_before_discount?number>
                                            </#if>
                                        </#if>
                                        <td align="right" colspan="2">
                                            ${discountedAmount?string['#,###,##0.00']}
                                        </td>
                                    <#else>
                                        <#--  last cell only  -->
                                        <#if discountDisplay ="onTotal">
                                            <td align="right" colspan="2">
                                                <#if item.custcol_amount_before_discount?? && item.custcol_amount_before_discount?has_content>
                                                    ${item.custcol_amount_before_discount?string['#,###,##0.00']}
                                                <#else>
                                                    0.00
                                                </#if>
                                            </td>
                                        <#else>
                                            <td align="right" colspan="2">
                                                <#if item.amount?? && item.amount?has_content>
                                                    ${item.amount?string['#,###,##0.00']}
                                                <#else>
                                                    0.00
                                                </#if>
                                            </td>
                                        </#if>
                                    </#if>
                                    <#if item.custcol_inline_discount?has_content>
                                        <#assign totalDiscount=totalDiscount + item.custcol_line_discount_amount>
                                    </#if>

                                    <#--  <td align="right" colspan="2">
                                        ${item.amount?string['#,###,##0.00']}
                                    </td>  -->
                                </tr>
                        </#list>
                        <!-- end items -->
                    </table>
                </#if>
                <#assign trueSubtotal=record.subtotal + totalDiscount>
                <!-- Item Totals Section -->
                <table style="page-break-inside: avoid; width: 100%; margin-top: 10px;">
                    <#--  Head  -->
                    <tr>
                        <td align="left" colspan="2">&nbsp;</td>
                        <td align="left" colspan="2">&nbsp;</td>
                        <td align="left" colspan="2">&nbsp;</td>
                        <th colspan="4">
                            ${labTotalinEuro}
                        </th>
                    </tr>

                    <#--  Totals Section (According to the specifications of the bluebeam project)  -->
                    <#--  1st total row  -->
                    <#if (discountDisplay="inlineAndTotal" || discountDisplay="onTotal")>
                        <tr>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td colspan="3" style="font-weight: bold; color: #333333;">
                                <#if discountDisplay="inlineAndTotal">
                                    ${labTotalinWithoutDiscountBox}
                                <#else>
                                    ${labTotalinBox}
                                </#if>
                                ${record.currencyname?replace("Euro","Eur")}
                            </td>
                            <td align="right" style="font-weight: bold; color: #333333;">
                                <#if trueSubtotal??>
                                    ${trueSubtotal?string['#,###,##0.00']}
                                </#if>
                            </td>
                        </tr>
                    <#else>
                        <tr>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td colspan="3" style="font-weight: bold; color: #333333;">
                                ${labTotalinBox}
                                ${record.currencyname?replace("Euro","Eur")}
                            </td>
                            <td align="right" style="font-weight: bold; color: #333333;">
                                <#if record.subtotal??>
                                    ${record.subtotal?string['#,###,##0.00']}
                                </#if>
                            </td>
                        </tr>
                    </#if>

                     <#--  2nd & 3rd total row  -->
                    <#if totalDiscount !=0 && (discountDisplay="inlineAndTotal" || discountDisplay="onTotal" )>
                        <tr>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td colspan="3" style="">
                                <#if totalDiscount !=0>
                                    ${labDiscount}
                                </#if>
                            </td>
                            <td align="right" style="">
                                <#if totalDiscount !=0>-&nbsp;${totalDiscount?string['#,###,##0.00']}
                                </#if>
                            </td>
                        </tr>
                        <#if discountDisplay!="onTotal">
                            <tr>
                                <td align="left" colspan="2">&nbsp;</td>
                                <td align="left" colspan="2">&nbsp;</td>
                                <td align="left" colspan="2">&nbsp;</td>
                                <td colspan="3" style="font-weight: bold; color: #333333;">
                                    ${labTotalinBox}
                                    ${record.currencyname?replace("Euro","Eur")}     
                                </td>
                                <#if (discountDisplay="inlineAndTotal" || discountDisplay="noDiscount" )>
                                    <td align="right" style="font-weight: bold; color: #333333;">
                                        <#if trueSubtotal??>
                                            ${record.subtotal?string['#,###,##0.00']}
                                        </#if>
                                    </td>
                                <#else>
                                    <td align="right" style="font-weight: bold; color: #333333;">
                                        <#if trueSubtotal??>
                                            ${trueSubtotal?string['#,###,##0.00']}
                                        </#if>
                                    </td>
                                </#if>
                            </tr>
                        </#if>  
                    </#if>

                    <#--  4th total row  -->
                    <#if discountDisplay="onTotal">
                        <#assign BaseImponible=trueSubtotal - totalDiscount>
                        <tr>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td colspan="3" <#if discountDisplay="onTotal">style="font-weight: bold; color: #333333;"</#if>>
                                ${labTAmount}
                                ${record.currencyname?replace("Euro","Eur")}
                            </td>
                            <td align="right" <#if discountDisplay="onTotal">style="font-weight: bold; color: #333333;"</#if>>
                                ${BaseImponible?string['#,###,##0.00']}
                            </td>
                        </tr>
                    </#if>

                    <#--  last 2 total row  -->
                    <tr>
                        <td align="left" colspan="2">&nbsp;</td>
                        <td align="left" colspan="2">&nbsp;</td>
                        <td align="left" colspan="2">&nbsp;</td>
                        <td colspan="3" style="">
                            ${labAmountVAT}
                            (${((record.taxtotal /record.subtotal)*100)?string['0.0']} %) 
                            ${record.currencyname?replace("Euro","Eur")}
                        </td>
                        <td align="right" style="">
                            ${record.taxtotal?string['#,###,##0.00']}
                        </td>
                    </tr>
                    <tr>
                        <td align="left" colspan="2">&nbsp;</td>
                        <td align="left" colspan="2">&nbsp;</td>
                        <td align="left" colspan="2">&nbsp;</td>
                        <td colspan="3" style="font-weight: bold; color: #333333; border-top: 1px solid black;padding-top:10px;">
                            ${labAmountInclVAT}
                            ${record.currencyname?replace("Euro","Eur")}
                        </td>
                        <td align="right" style="font-weight: bold; color: #333333; border-top: 1px solid black;padding-top:10px;">
                            ${record.total?string['#,###,##0.00']}
                        </td>
                    </tr>



                    <#--  <tr>
                        <td colspan="5">&nbsp;</td>
                        <td style="width: 1%;"></td>
                        <td align="left" colspan="2" style="font-weight: bold; color: #333333;">
                            <#if .locale=="fr_FR">
                                ${labAmountExclVAT}
                            <#else>
                                ${record.custbody_tran_printout_translation.custrecord_tran_total_ex_vat@label}
                            </#if>:
                        </td>
                        <td align="right" style="font-weight: bold; color: #333333;">
                            ${record.subtotal?string['#,###,##0.00']}
                        </td>
                    </tr>  -->

                    <#--  <tr>
                        <td colspan="5">&nbsp;</td>
                        <td style="width: 1%;"></td>
                        <#if record.subtotal==0>
                            <td align="left" colspan="2">
                                ${labAmountVAT}:
                            </td>
                            <#else>
                                <td align="left" colspan="2">
                                    ${labAmountVAT} (${((record.taxtotal /record.subtotal)*100)?string['0.0']} %)
                                </td>
                        </#if>
                        <td align="right">
                            ${record.taxtotal?string['#,###,##0.00']}
                        </td>
                    </tr>  -->

                    <tr>
                        <td colspan="5" style="font-size:8;color:#40477E;border: 1px solid black;">
                            <#if .locale=="fr_FR">
                                Référence à rappeler lors de votre règlement : ${record.tranid}
                                <#else>
                                Please use the payment reference : ${record.tranid}
                            </#if>
                            <br />
                            IBAN : ${subsidiary.custrecord_iban}
                            <br />BIC/SWIFT : <span style="margin-left:6pt">
                                ${subsidiary.custrecord_bic}
                            </span>
                        </td>
                        <#--  <td style="width: 1%;"></td>
                        <td style="border-top: 1px solid black;padding-top:10px;" colspan="2" align="left"><b>
                                <#if .locale=="fr_FR">Total TTC<#else>Total</#if> :
                            </b></td>
                        <td style="border-top: 1px solid black;padding-top:10px;" align="right">
                            ${record.total?string['#,###,##0.00']}
                        </td>  -->
                    </tr>

                </table>
                    <!-- Multiyear billing schedule note 
		<#list record.createdfrom.billingschedule?split(" / ") as schedule>
          <#if schedule_index==0><#if schedule = "Multi Year" && record.createdfrom.nextbilldate?has_content>
            <p style="font-size:8;color:#40477E">
              <#if .locale == 'fr_FR'>
                Ceci est une facture partielle du contrat de 3 ans. Vous recevrez la prochaine facture (partielle) du montant restant (&euro; ${record.createdfrom.amountunbilled?string['#,###,##0.00']}) vers le ${record.createdfrom.nextbilldate}.
              <#else>
                This is a partial invoice of the 3-year contract. You will receive the next (partial) invoice of the remaining amount (&euro; ${record.createdfrom.amountunbilled?string['#,###,##0.00']}) around ${record.createdfrom.nextbilldate}.
              </#if>
            </p>
         </#if></#if>
       </#list>
-->
                    <!-- Display tax notice -->
                    <#if .locale=="fr_FR">
                        <#assign displayTaxNoticeForEFR=false>
                        <#assign displayTaxNoticeForESFR=false>
                        <#assign displayTaxNoticeForESSSFR=false>
                        <#assign displayTaxNoticeForIFR=false>
                        <#assign displayTaxNoticeForOFR=false>
                        <#assign displayTaxNoticeForOSFR=false>
                        <#assign displayTaxNoticeForENCDED=false>
                        <#assign displayTaxNoticeForSFR=false>
                        <#assign displayTaxNoticeForUNDEFFR=false>
                    </#if>
                    <table style="width: 100%; font-size: 7.5pt;">
                        <tr>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td align="left" colspan="2">&nbsp;</td>
                            <td colspan="2" align="right" class="address">
                                <#if .locale=="fr_FR">
                                    <#if record.item?has_content>
                                        <#list record.item as item>
                                            <#list item.taxcode?split(":") as taxcodepart>
                                                <#if taxcodepart_index==1>
                                                    <#if taxcodepart=="E-FR" & displayTaxNoticeForEFR==false>
                                                        Exonération-Art.294-1 du CGI<br />
                                                        <#assign displayTaxNoticeForEFR=true>
                                                            <#elseif taxcodepart=="ES-FR" & displayTaxNoticeForESFR==false>
                                                                Autoliquidation-Art.138 de la directive 2006/112/CE<br />
                                                                <#assign displayTaxNoticeForESFR=true>
                                                                    <#elseif taxcodepart=="ESSS-FR" & displayTaxNoticeForESSSFR==false>
                                                                        Autoliquidation-Art.283-2 du CGI<br />
                                                                        <#assign displayTaxNoticeForESSSFR=true>
                                                                            <#elseif taxcodepart=="I-FR" & displayTaxNoticeForIFR==false>
                                                                                <#assign displayTaxNoticeForIFR=true>
                                                                                    <#elseif taxcodepart=="O-FR" & displayTaxNoticeForOFR==false>
                                                                                        Exonération-Art.262-1 du CGI<br />
                                                                                        <#assign displayTaxNoticeForOFR=true>
                                                                                            <#elseif taxcodepart=="OS-FR" & displayTaxNoticeForOSFR==false>
                                                                                                Exonération-Art.283-2 du CGI<br />
                                                                                                <#assign displayTaxNoticeForOSFR=true>
                                                                                                    <#elseif taxcodepart=="S-FR" & displayTaxNoticeForSFR==false>
                                                                                                        <#assign displayTaxNoticeForSFR=true>
                                                                                                            <#elseif taxcodepart=="ENC/DED" & displayTaxNoticeForENCDED==false>
                                                                                                                TVA exigible sur les débits - CGI, art. 269-2-c, al. 1<br />
                                                                                                                <#assign displayTaxNoticeForENCDED=true>
                                                                                                                    <#elseif taxcodepart=="UNDEF-FR" & displayTaxNoticeForUNDEFFR==false>
                                                                                                                        <#assign displayTaxNoticeForUNDEFFR=true>
                                                    </#if>
                                                </#if>
                                            </#list>
                                        </#list>
                                    </#if>
                                    <#else>
                                        VAT reverse Charge
                                </#if>
                            </td>
                        </tr>
                    </table>
                    <#if .locale=="fr_FR">
                        <table style="width: 100%; font-size: 7.5pt;padding-top: 40px;">
                            <tr>
                                <td align="justify" class="address"><span text-transform="uppercase">
                                        <#if subsidiary.legalname=='Arkance Optimum France'>Sitech France<#else>
                                                ${subsidiary.legalname}
                                        </#if>
                                    </span> conserve l&rsquo;enti&egrave;re propri&eacute;t&eacute; des biens jusqu&rsquo;au r&egrave;glement complet des factures correspondantes.</td>
                            </tr>
                            <tr>
                                <td align="justify" class="address">Loi n&deg;2001-420 du 15 mai 2001 &ndash; Toute somme impay&eacute;e &agrave; l&rsquo;&eacute;ch&eacute;ance de la facture portera, sans mise en demeure pr&eacute;alable, int&eacute;r&ecirc;t aux taux de 1,5 fois le taux d&rsquo;int&eacute;r&ecirc;t l&eacute;gal en vigueur sur la totalit&eacute; de la somme due et par mois de retard entam&eacute;. Indemnit&eacute; forfaitaire pour frais de recouvrement de 40&euro;</td>
                            </tr>
                        </table>
                    </#if>
    </body>
</pdf>