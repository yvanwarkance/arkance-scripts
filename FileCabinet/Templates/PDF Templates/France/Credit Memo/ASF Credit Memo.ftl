<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
	<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />
	<#if .locale == "zh_CN">
		<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />
	<#elseif .locale == "zh_TW">
		<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />
	<#elseif .locale == "ja_JP">
		<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />
	<#elseif .locale == "ko_KR">
		<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />
	<#elseif .locale == "th_TH">
		<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />
	</#if>
    <macrolist>
        <macro id="nlheader">
            <table style="width: 100%;">
              <tr>
                  <td colspan="3">&nbsp;</td>
				  <td colspan="2" rowspan="3" align="right" style="padding: 0;"><#if subsidiary.logo?length != 0><img src="${subsidiary.logo@Url}" style="float: right; margin: 7px; width:220px;height:100px" /> </#if></td>
            </tr>
			</table>
        </macro>
        <macro id="nlfooter">
            <table class="footer" style="width: 100%;"><tr>
	<td colspan="12" align="right" width="100%">Page <pagenumber/>/<totalpages/></td>
	</tr>
	<tr>
    <td align="left" style="margin: 0px;padding-top: 8px;" colspan="2" ><#if subsidiary.legalname != 'Arkance Optimum France'><img height="35" src="https://5565205.app.netsuite.com/core/media/media.nl?id=29071&amp;c=5565205&amp;h=fHlBw3ApMvTQHds6Nkd9BCMOk2v9ju5KTXBw8YkNPg7qgMhX&amp;fcts=20201214044405&amp;whence=" style="float: right; margin: 3px;padding-top: 1px;" width="80" /></#if></td>
	<td line-height="8.5" colspan="8" style="padding-top:10px;padding-left:7px;"><span class="footer-company-bold">${subsidiary.legalname}</span><span class="footer-company-coordinate">&nbsp;${subsidiary.mainaddress.addr1}-${subsidiary.mainaddress.addr2}&nbsp;${subsidiary.mainaddress.zip} ${subsidiary.mainaddress.city}</span><br /><span class="footer-agency footer-agency-bold">${subsidiary.custrecord_form_line1}</span><br/><#if subsidiary.legalname='Arkance Optimum France'><span class="footer-company-coordinate">www.arkance.world &nbsp; <#if subsidiary.custrecord_sub_phone != ''><span class="footer-company-coordinate">T&eacute;l. : ${subsidiary.custrecord_sub_phone}</span></#if></span><#else><span class="footer-company-coordinate"> www.arkance.world &nbsp; T&eacute;l. : ${subsidiary.custrecord_sub_phone}</span></#if> - <span class="footer-agency2">${subsidiary.custrecord_form_line2}</span><br /><!--	<span class="footer-company-coordinate">${subsidiary.id.Url}</span><span class="footer-company-bold">&nbsp;Tél. : 01 39 44 18 18</span><br />--><#if subsidiary.legalname = 'Arkance Systems France'><span class="footer-agency2">${subsidiary.custrecord_form_line3}</span></#if><#if subsidiary.legalname = 'Arkance Optimum France'><span class="footer-agency">${subsidiary.custrecord_form_line3}</span></#if></td>
      <td align="right" colspan="3"><#if subsidiary.legalname != 'Arkance Optimum France'>
        <#if !record.class?c_lower_case?contains("bluebeam")>
           <img height="50" src="https://5565205.app.netsuite.com/core/media/media.nl?id=1816723&amp;c=5565205&amp;h=HnF4Qjxw5CF-TVDtlGnnQpSJoyRsx7nlRkpO2RAg0_LWxpmj" style="margin: 3px;padding-top: 1px;" width="76" />
        <#else>
           <img height="21" width="85" style="margin: 3px;padding-top: 3px;position:relative; right: 15px;" src="https://5565205.app.netsuite.com/core/media/media.nl?id=5389446&amp;c=5565205&amp;h=kYofT3sMnv_hwMziplpKfu763H-sGTjOBK938pmB9giKqm-A&amp;fcts=20250122034502" />
        </#if>
          <!--img height="10" width="40" src="https://5565205.app.netsuite.com/core/media/media.nl?id=7412&amp;c=5565205&amp;h=55fec30cedcfef81471d" style="margin: 3px;padding-top: 1px;" width="120" /--></#if></td>
	</tr></table>
        </macro>
    </macrolist>
    <style type="text/css">* {
		<#if .locale == "zh_CN">
			font-family: NotoSans, NotoSansCJKsc, sans-serif;
		<#elseif .locale == "zh_TW">
			font-family: NotoSans, NotoSansCJKtc, sans-serif;
		<#elseif .locale == "ja_JP">
			font-family: NotoSans, NotoSansCJKjp, sans-serif;
		<#elseif .locale == "ko_KR">
			font-family: NotoSans, NotoSansCJKkr, sans-serif;
		<#elseif .locale == "th_TH">
			font-family: NotoSans, NotoSansThai, sans-serif;
		<#else>
			font-family: NotoSans, sans-serif;
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
		td p { align:left }
        b {
            font-weight: bold;
            color: #333333;
        }
        table.header td {
            padding: 0px;
            font-size: 10pt;
        }
        table.footer td {
            padding: 0px;
            font-size: 8pt;
        }
        table.itemtable th {
            padding-bottom: 10px;
            padding-top: 10px;
        }
        table.body td {
            padding-top: 2px;
        }
        table.total {
            page-break-inside: avoid;
        }
        tr.totalrow {
            background-color: #e3e3e3;
            line-height: 200%;
        }
        td.totalboxtop {
            font-size: 12pt;
            background-color: #e3e3e3;
        }
        td.addressheader {
            font-size: 8pt;
            padding-top: 6px;
            padding-bottom: 2px;
        }
        td.address {
            padding-top: 0px;
        }
        td.totalboxmid {
            font-size: 20pt;
            padding-top: 20px;
            background-color: #e3e3e3;
        }
        td.totalboxbot {
            background-color: #e3e3e3;
            font-weight: bold;
        }
        span.title {
            font-size: 28pt;
        }
        span.number {
            font-size: 16pt;
        }
      	span.numberso {
            font-size: 11pt;
        }
        span.itemname {
            font-weight: bold;
            line-height: 150%;
        }
        hr {
            width: 100%;
            color: #d3d3d3;
            background-color: #d3d3d3;
            height: 1px;
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
		span.footer-company-coordinate{
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
<body header="nlheader" header-height="10%" footer="nlfooter" footer-height="40pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">
  <table style="width: 100%; margin-top: 10px;">
    <tr>
        <td style="font-size:24;padding-top: 2px;"><#if .locale == "fr_FR">Avoir<#else>${record.custbody_tran_printout_translation.custrecord_credit_memo_print_page_title@label}</#if></td>
      </tr>
  </table>
  
  <table style="width: 100%;">
	<tr>
      <td style="width: 55%;padding: 0">
        <table style="width: 100%;margin-top:30px;line-height:100%">
           <tr>
                <td width="35%"><#if .locale == "fr_FR">N° d'avoir<#else>Credit memo nr.</#if> :</td>
                <td width="65%" style="padding-top: 2px;"><#if record.status == "Pending Approval" || record.status == "En attente d'approbation">Pro Forma <#else>${record.tranid}</#if></td>
           </tr>
           <tr>
                <td><#if .locale == "fr_FR">N° de commande :<#else>Order number :</#if></td>
                <td style="padding-top: 2px;">${record.otherrefnum}</td>
            </tr>
            <tr>
                <td>Date de l'avoir :</td>
                <td style="padding-top: 2px;">${record.trandate}</td>

            </tr>
          <tr>
                <td>${record.custbody_tran_printout_translation.custrecord_tran_your_vat_num@label} :</td>
                <td style="padding-top: 2px;">${record.entity.vatregnumber}</td>
            </tr>

            <tr>
                <td>${record.custbody_tran_printout_translation.custrecord_tran_client_num@label} :</td>
                <td style="padding-top: 2px;">${record.entity.entityid}</td>
            </tr>
            <tr>
                <td><#if .locale == "fr_FR">Avoir sur facture :<#else>Invoice reference :</#if></td>
              <td style="padding-top: 2px;"><#if record.createdfrom?has_content>${record.createdfrom.tranid}</#if></td>
            </tr>
            <#if record.custbody_swe_from_contract != '' || record.custbody_contract_name != ''>
              <#assign AutodeskContractNumberAlreadyDisplayed = false>
              <!--
              <tr>
                  <td>
                    <#if .locale == "fr_FR">Contrat N° :<#else>Contract N° :</#if>
                  </td>
                  <td style="padding-top: 2px;">
                    <#if record.item?has_content><#list record.item as item><#if item.custcol_product_line=="Autodesk" && AutodeskContractNumberAlreadyDisplayed==false>
                      ${item.custcol_autodesk_contract_number}
                      <#assign AutodeskContractNumberAlreadyDisplayed = true>
                    </#if></#list></#if>
                    <#if AutodeskContractNumberAlreadyDisplayed==false>
                   		<#if record.item?has_content><#list record.item as item><#if item_index==0>${item.custcol_autodesk_contract_number}</#if></#list></#if>
                    </#if>
                  </td>
              </tr>
              <tr>
                  <td>${record.custbody_tran_printout_translation.custrecord_tran_period@label} :</td>
                  <td style="padding-top: 2px;"><#if record.item?has_content><#list record.item as item><#if item_index==0>${item.custcol_swe_contract_start_date} - ${item.custcol_swe_contract_end_date}</#if></#list></#if></td>
              </tr>
              -->
              <tr>
                <td><#if .locale == "fr_FR">Commercial :<#else>${record.salesrep@label} :</#if></td>
                <td style="padding-top: 2px;">${record.salesrep}</td>
              </tr>
            <#else>
              <tr>
                <td><#if .locale == "fr_FR">Commercial :<#else>${record.salesrep@label} :</#if></td>
                <td style="padding-top: 2px;">${record.salesrep}</td>
              </tr>
              <tr height="35px"></tr>
            </#if>
             
        </table>
      </td>
      <td style="width: 45%;padding: 0">
      	<table style="width: 100%;margin-top:20px;">
            <tr>
              <td colspan="2" rowspan = "8" align= "left" style="font-size:9;padding-right:50px;">
                <p style="padding:0px">
                  <span class="addressheader">${record.billaddress@label}</span><br />${record.billaddress}
                </p>
              	<p style="margin-top:105px">
                	<span class="addressheader">${record.shipaddress@label}</span><br />${record.shipaddress}
          		</p>
              </td>
          </tr>
        </table>
      </td>
  	</tr>
</table>

  <!-- Items Section-->


                                                      <!-- Items display-->
     												 <#assign totalDiscount = 0>
                                                      <#assign discountPresent = false>
																<#if record.item?has_content>

																	<table style="width: 100%; margin-top: 10px;"><!-- start items --><#list record.item as item><#if item_index==0>

																		<thead>
<#setting number_format="0.##">

																			<tr>
																				<th align="left" colspan="14">${item.description@label}</th>
																				<th align="center" colspan="2">${record.custbody_tran_printout_translation.custrecord_tran_quantity@label}</th>
																				<th align="center" colspan="2">${record.custbody_tran_printout_translation.custrecord_tran_price_unit@label}</th>
																				<th align="center" colspan="2">${item.amount@label}</th>
																			</tr>
																		</thead>
																	</#if>
                                                                   <#assign itemIsAService = false>
                                                                   <tr>
																	<td align="left" colspan="14">
                                                                      <span style="font-weight: bold; line-height: 150%; color: #333333;">${item.item}</span><br />${item.description}
                                                                      <#list item.item?split("-") as itempart>
                                                                        <#if itempart_index==0 && itempart=="SER">
                                                                          <#assign itemIsAService = true>
                                                                        </#if>
                                                                          <#if itempart_index==1 && item.custcol_autodesk_contract_number?has_content>
                                                                            <span style="white-space:nowrap;">
          																	<#if .locale == "fr_FR">
            																	Contrat N°: ${item.custcol_autodesk_contract_number}. 
              																	Période ${item.custcol_swe_contract_start_date} - ${item.custcol_swe_contract_end_date}.
            																<#else>
                																Contract N°: ${item.custcol_autodesk_contract_number}. 
              																	Period: ${item.custcol_swe_contract_start_date} - ${item.custcol_swe_contract_end_date}.
            																</#if>
                                                                            </span>
      	  																</#if>
                                                                        <!--
                                                                        <#if itempart_index==1 && itempart=="HOT">
                                                                        	<br/><#if .locale == "fr_FR">Contrat N°<#else>Contract N°</#if> : ${item.custcol_autodesk_contract_number}
                                                                        </#if>
																		-->
                                                                      </#list>
                                                                    </td>
																	<td align="center" colspan="2" line-height="150%">${item.quantity}</td>
                                                                    <td align="center" colspan="2"><#if item.custcol_calculated_rate?has_content>${item.rate?string['#,###,##0.00']}</#if></td>
																	<td align="right" colspan="2">${item.amount?string['#,###,##0.00']}</td>
																</tr>
                                                                      <#if item.custcol_inline_discount?has_content> <#assign discountPresent = true> </#if>
                                                                      <#if item.custcol_inline_discount?has_content><#assign totalDiscount = totalDiscount + item.custcol_line_discount_amount></#if>

															</#list><!-- end items --></table>

                                                          </#if>
    	<#assign trueSubtotal = record.subtotal + totalDiscount>

		<!-- Item Totals Section -->

<table style="page-break-inside: avoid; width: 100%; margin-top: 10px;">
   <tr>
     <td colspan="5"></td>
    <td style="width: 1%;"></td>
     <th colspan="3"><#if .locale == "fr_FR">Total en Euro :<#else>Total in Euro :</#if></th>

  </tr>
  <tr>
	<td colspan="5">&nbsp;</td>
    <td style="width: 1%;"></td>
    <td align="left" colspan="2" style="font-weight: bold; color: #333333;">
      <#if .locale == "fr_FR">Sous-Total HT<#else>${record.custbody_tran_printout_translation.custrecord_tran_total_ex_vat@label}</#if>:</td>
    <td align="right" style="font-weight: bold; color: #333333;">${record.subtotal?string['#,###,##0.00']}</td>

	</tr>
	<tr>
	<td colspan="5">&nbsp;</td>
 <td style="width: 1%;"></td>

      <td align="left" colspan="2"><#if .locale == "fr_FR">Total TVA (${(record.taxtotal / record.subtotal)?string.percent})<#else>Total VAT (${(record.taxtotal / record.subtotal)?string.percent})</#if>:</td>

	<td align="right">${record.taxtotal?string['#,###,##0.00']}</td>
	</tr>
	<tr>
		<td colspan="5"></td>
       	<td style="width: 1%;"></td>
        <td style="border-top: 1px solid black;padding-top:10px;" colspan="2" align="left" ><b><#if .locale == "fr_FR">Total TTC<#else>Total</#if> :</b></td>
		<td style="border-top: 1px solid black;padding-top:10px;" align="right">${record.total?string['#,###,##0.00']}</td>
	</tr>
</table>

<!-- Display tax notice -->
<#if .locale == "fr_FR">
  <#assign displayTaxNoticeForEFR = false>
  <#assign displayTaxNoticeForESFR = false>
  <#assign displayTaxNoticeForESSSFR = false>
  <#assign displayTaxNoticeForIFR = false>
  <#assign displayTaxNoticeForOFR = false>
  <#assign displayTaxNoticeForOSFR = false>
  <#assign displayTaxNoticeForENCDED = false>
  <#assign displayTaxNoticeForSFR = false>
  <#assign displayTaxNoticeForUNDEFFR = false>
</#if>
          
     <table style="width: 100%; font-size: 7.5pt;">
  		<tr>
          	<td colspan="5">&nbsp;</td>
      		<td style="width: 1%;"></td>
              <td colspan="3" align="justify" class="address">
                <#if .locale == "fr_FR">
                  <#if record.item?has_content><#list record.item as item>
                    <#list item.taxcode?split(":") as taxcodepart>
                      <#if taxcodepart_index==1>
                          <#if taxcodepart == "E-FR" & displayTaxNoticeForEFR == false>
                            Exonération-Art.294-1 du CGI<br />
                            <#assign displayTaxNoticeForEFR = true>
                          <#elseif taxcodepart == "ES-FR" & displayTaxNoticeForESFR == false>
                            Autoliquidation-Art.138 de la directive 2006/112/CE<br />
                            <#assign displayTaxNoticeForESFR = true>
                          <#elseif taxcodepart == "ESSS-FR" & displayTaxNoticeForESSSFR == false>
                            Autoliquidation-Art.283-2 du CGI<br />
                            <#assign displayTaxNoticeForESSSFR = true>
                          <#elseif taxcodepart == "I-FR" & displayTaxNoticeForIFR == false>
                            <#assign displayTaxNoticeForIFR = true>
                          <#elseif taxcodepart == "O-FR" & displayTaxNoticeForOFR == false>
                            Exonération-Art.262-1 du CGI<br />
                            <#assign displayTaxNoticeForOFR = true>
                          <#elseif taxcodepart == "OS-FR" & displayTaxNoticeForOSFR == false>
                            Exonération-Art.283-2 du CGI<br />
                            <#assign displayTaxNoticeForOSFR = true>
                          <#elseif taxcodepart == "S-FR" & displayTaxNoticeForSFR == false>
                            <#assign displayTaxNoticeForSFR = true>
                          <#elseif taxcodepart == "ENC/DED" & displayTaxNoticeForENCDED == false>
                            TVA exigible sur les débits - CGI, art. 269-2-c, al. 1<br />
                            <#assign displayTaxNoticeForENCDED = true>
                          <#elseif taxcodepart == "UNDEF-FR" & displayTaxNoticeForUNDEFFR == false>
                            <#assign displayTaxNoticeForUNDEFFR = true>
                          </#if>
                      </#if>
                    </#list>
                  </#list></#if>
                <#else>
                  VAT reverse Charge
                </#if>
              </td>
		</tr>
     </table>
          
<#if .locale == "fr_FR">
      <table style="width: 100%; font-size: 7.5pt;padding-top: 40px;">
          <tr>
              <td align="justify" class="address"><span text-transform = "uppercase"><#if subsidiary.legalname == 'Arkance Optimum France'>Sitech France<#else>${subsidiary.legalname}</#if></span> conserve l&rsquo;enti&egrave;re propri&eacute;t&eacute; des biens jusqu&rsquo;au r&egrave;glement complet des factures correspondantes.</td>
          </tr>
          <tr>
              <td align="justify" class="address">Loi n&deg;2001-420 du 15 mai 2001 &ndash; Toute somme impay&eacute;e &agrave; l&rsquo;&eacute;ch&eacute;ance de la facture portera, sans mise en demeure pr&eacute;alable, int&eacute;r&ecirc;t aux taux de 1,5 fois le taux d&rsquo;int&eacute;r&ecirc;t l&eacute;gal en vigueur sur la totalit&eacute; de la somme due et par mois de retard entam&eacute;. Indemnit&eacute; forfaitaire pour frais de recouvrement de 40&euro;</td>
          </tr>
       </table>
      </#if>
          
</body>
</pdf>
