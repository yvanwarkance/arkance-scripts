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
            <table class="header" style="width: 100%;">
              <tr>
	<td rowspan="3"><#if subsidiary.logo?length != 0><img src="${subsidiary.logo@Url}" style="float: left; margin: 7px; width:170px;height:70px" /> </#if> <span class="nameandaddress">${subsidiary.name}</span><br /><span class="nameandaddress">${subsidiary.mainaddress.addr1} <br />${subsidiary.mainaddress.addr2} <br />${subsidiary.mainaddress.zip}<br /> ${subsidiary.mainaddress.city}<br />${subsidiary.mainaddress.country}</span></td>
	<td align="right"><span class="title">${record@title}</span></td>
	</tr>
	<tr>
	<td align="right"><span class="number"><#if record.status == "Pending Approval" || record.status == "En attente d'approbation">Pro Forma <#else>Facture #${record.tranid}</#if></span></td>
	</tr>
    <#if record.createdfrom.tranid != "">
    <tr>
    <td align="right"><span class="numberso">#${record.createdfrom.tranid}</span></td>
	</tr>
    </#if>
    <tr>
    <td align="right"></td>  
    <td align="right"><span class="numberso">Client: #${record.entity.entityid}</span></td>
	</tr>
	<tr>
      <td align="right"></td>  
      <td align="right"><span class="numberso">${record.trandate}</span></td>
	</tr>
          </table>
        </macro>
        <macro id="nlfooter">
            <table class="footer" style="width: 100%;"><tr>
	<td colspan="12" align="right" width="100%">Page <pagenumber/>/<totalpages/></td>
	</tr>
	<tr>
    <td align="left" style="margin: 3px;padding-top: 8px;" colspan="2" ><#if subsidiary.legalname != 'Arkance Optimum France'><img height="35" src="https://5565205.app.netsuite.com/core/media/media.nl?id=29071&amp;c=5565205&amp;h=fHlBw3ApMvTQHds6Nkd9BCMOk2v9ju5KTXBw8YkNPg7qgMhX&amp;fcts=20201214044405&amp;whence=" style="float: right; margin: 3px;padding-top: 1px;" width="80" /></#if></td>
	<td line-height="8.5" colspan="7" style="padding-left: 20px;"><span class="footer-company-bold">${subsidiary.legalname}</span><span class="footer-company-coordinate">&nbsp;${subsidiary.mainaddress.addr1}-${subsidiary.mainaddress.addr2}&nbsp;${subsidiary.mainaddress.zip}<br />${subsidiary.mainaddress.city}</span><br /><#if subsidiary.legalname='Arkance Optimum France'><span class="footer-company-coordinate">www.arkance-optimum.com &nbsp; <#if subsidiary.custrecord_sub_phone != ''><span class="footer-company-coordinate">T&eacute;l. : ${subsidiary.custrecord_sub_phone}</span></#if></span><#else><span class="footer-company-coordinate"> www.arkance-systems.fr &nbsp; T&eacute;l. : ${subsidiary.custrecord_sub_phone}</span></#if><br /><!--	<span class="footer-company-coordinate">${subsidiary.id.Url}</span><span class="footer-company-bold">&nbsp;Tél. : 01 39 44 18 18</span><br />--> <span class="footer-agency">${subsidiary.custrecord_form_line1}</span><br/><span class="footer-agency">${subsidiary.custrecord_form_line2}</span><#if subsidiary.legalname = 'Arkance Systems France'><span class="footer-agency2">${subsidiary.custrecord_form_line3}</span></#if><#if subsidiary.legalname = 'Arkance Optimum France'><span class="footer-agency">${subsidiary.custrecord_form_line3}</span></#if></td>
      <td align="right" colspan="3">
        <#if subsidiary.legalname != 'Arkance Optimum France'>
            <#if !record.class?c_lower_case?contains("bluebeam")>
				<img height="50" src="https://5565205.app.netsuite.com/core/media/media.nl?id=1816723&amp;c=5565205&amp;h=HnF4Qjxw5CF-TVDtlGnnQpSJoyRsx7nlRkpO2RAg0_LWxpmj" style="margin: 3px;padding-top: 1px;" width="76" />
				<#else>
					<img height="21" width="85" style="margin: 3px;padding-top: 3px;position:relative; right: 15px;" src="https://5565205.app.netsuite.com/core/media/media.nl?id=5389446&amp;c=5565205&amp;h=kYofT3sMnv_hwMziplpKfu763H-sGTjOBK938pmB9giKqm-A&amp;fcts=20250122034502" />
			</#if>
        <!-- <img height="50" src="https://5565205.app.netsuite.com/core/media/media.nl?id=7412&amp;c=5565205&amp;h=55fec30cedcfef81471d" style="margin: 3px;padding-top: 1px;" width="120" /> -->
        </#if>
      </td>
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
            background-color: #e3e3e3;
            color: #333333;
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
			font-size: 9pt;
			font-weight: bold;
			color: #254164;
		}
		span.footer-company-coordinate{
			font-size: 7pt;
			color: #254164;
		}
		span.footer-agency {
			font-size: 7pt;
			font-style: italic;
			color: #254164;
		}
      	span.footer-agency2 {
			font-size: 6.5pt;
			color: #254164;
		}
		span.footer-tiny {
			font-size: 6pt;
			color: #254164;
		}
      	span.numberso {
            font-size: 11pt;
        }
</style>
</head>
<body header="nlheader" header-height="12%" footer="nlfooter" footer-height="40pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">
  <table style="width: 100%; margin-top: 10px;">
   <tr>
      <td class="totalboxtop" colspan="6"><b>${record.total@label?upper_case} TTC</b></td>
      <td class="addressheader" colspan="5">&nbsp;</td>
      <td class="addressheader" colspan="4" ><b>${record.billaddress@label}</b></td>
   </tr>
   <tr>
      <td align="right" class="totalboxmid" colspan="6">${record.total}</td>
      <td class="address" colspan="5" rowspan="2">&nbsp;</td>
      <td class="address" colspan="4" rowspan="2">${record.billaddress}</td>
   </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
   </tr>
   <tr>
      <td colspan="6">&nbsp;&nbsp;&nbsp;&nbsp;</td>
      <td class="addressheader" colspan="5">&nbsp;</td>
      <td class="addressheader" colspan="4" ><b>${record.shipaddress@label}</b></td>
   </tr>
     <tr>
	<td align="right" class="address" colspan="6">&nbsp;</td>
     <td class="address" colspan="5" rowspan="2">&nbsp;</td>
     <td class="address" colspan="4" rowspan="2">${record.shipaddress}</td>
	</tr>
</table>

<table style="width: 55%; font-size: 8pt;padding-top: 10px;"><tr>
	<td align="justify" class="address" colspan="2">Veuillez libeller votre paiement &agrave; l&#39;ordre de : <span text-transform = "uppercase">${subsidiary.legalname} </span></td>
	</tr></table>

<table style="width: 60%; font-size: 8pt;padding-top: 10px; border: 1px #e3e3e3"><tr>
	<td align="justify" class="address">R&eacute;f&eacute;rence bancaire: <span text-transform = "uppercase">${subsidiary.custrecord_filiale_banque} </span> :</td>
	<td align="justify" class="address">${subsidiary.custrecord_ref_bancaire}</td>
	</tr>
	<tr>
	<td align="justify" class="address">No T.V.A :</td>
	<td align="justify" class="address">${subsidiary.federalidnumber}</td>
	</tr>
	<tr>
	<td align="justify" class="address">IBAN :</td>
	<td align="justify" class="address">${subsidiary.custrecord_iban}</td>
	</tr>
	<tr>
	<td align="justify" class="address">BIC :</td>
	<td align="justify" class="address">${subsidiary.custrecord_bic}</td>
	</tr></table>

<table class="body" style="width: 100%; margin-top: 10px;"><tr>
	<th>${record.terms@label}</th>
	<th>${record.duedate@label}</th>
	<th>Commande Client</th>
  
	<th>${record.salesrep@label}</th>
	</tr>
	<tr>
	<td>${record.terms}</td>
	<td>${record.duedate}</td>
	<td>${record.otherrefnum}</td>

	<td>${record.salesrep}</td>
	</tr></table>
<#if record.item?has_content>

<table class="itemtable" style="width: 100%; margin-top: 10px;"><!-- start items --><#list record.item as item><#if item_index==0>
<thead>
	<tr>
	<th align="center" colspan="2">Qt&eacute;</th>
	<th colspan="9">${item.item@label}</th>
	<!--<th colspan="3">${item.options@label}</th>-->
	<th align="right" colspan="4">${item.rate@label}</th>
	<th align="right" colspan="4">Montant HT</th>
	<th align="right" colspan="3">Taux de TVA</th>
	<th align="right" colspan="4">Montant de TVA</th>
	</tr>
</thead>
</#if><tr>
	<td align="center" colspan="2" line-height="150%">${item.quantity}</td>
	<td colspan="9">${item.description}</td>
	<!--<td colspan="3">${item.options}</td>-->
  
	<td align="right" colspan="4">${item.rate}</td>
	<td align="right" colspan="4">${item.amount}</td>
	<td align="right" colspan="3">${item.taxrate1}</td>
	<td align="right" colspan="4">${item.tax1amt}</td>
	</tr>
	</#list><!-- end items --></table>

<hr /></#if>
<table class="total" style="width: 100%; margin-top: 10px;"><tr>
	<td colspan="4">&nbsp;</td>
	<td align="right"><b>${record.subtotal@label} HT</b></td>
	<td align="right">${record.subtotal}</td>
	</tr>
	<tr>
	<td colspan="4">&nbsp;</td>
	<td align="right"><b>${record.taxtotal@label} (${record.taxrate}20%)</b></td>
	<td align="right">${record.taxtotal}</td>
	</tr>
	<tr class="totalrow">
	<td background-color="#ffffff" colspan="4">&nbsp;</td>
	<td align="right"><b>${record.total@label} TTC</b></td>
	<td align="right">${record.total}</td>
	</tr></table>

<table style="width: 70%; font-size: 6pt;padding-top: 10px;"><tr>
	<td align="justify" class="address"><span text-transform = "uppercase">${subsidiary.legalname}</span> conserve l&rsquo;enti&egrave;re propri&eacute;t&eacute; des biens jusqu&rsquo;au r&egrave;glement complet des factures correspondantes.</td>
	</tr>
	<tr>
	<td align="justify" class="address">Loi n&deg;2001-420 du 15 mai 2001 &ndash; Toute somme impay&eacute;e &agrave; l&rsquo;&eacute;ch&eacute;ance de la facture portera, sans mise en demeure pr&eacute;alable, int&eacute;r&ecirc;t aux taux de 1,5 fois le taux d&rsquo;int&eacute;r&ecirc;t l&eacute;gal en vigueur sur la totalit&eacute; de la somme due et par mois de retard entam&eacute;. Indemnit&eacute; forfaitaire pour frais de recouvrement de 40&euro;</td>
	</tr></table>
</body>
</pdf>