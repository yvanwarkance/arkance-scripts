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
            <table class="header" style="width: 100%;"><tr>
	<td rowspan="4"><#if subsidiary.logo?length != 0><img src="${subsidiary.logo@Url}" style="float: left; margin: 7px; width:170px;height:70px" /> </#if> <!--<span class="nameandaddress">${companyInformation.companyName}</span><br /><span class="nameandaddress">${companyInformation.addressText}</span>--></td>
	<td align="right"><span class="title">Bon de Commande</span></td>
	</tr>
	<tr>
	<td align="right">${record.trandate}</td>
	</tr>
	<tr>
	<td align="right"><span class="number">#${record.tranid}</span></td>
	</tr></table>
        </macro>
      
        <macro id="nlfooter">
          <table class="footer" style="width: 100%;"><tr>
	<td colspan="12" align="right" width="100%">Page <pagenumber/>/<totalpages/></td>
	</tr>
	<tr>
    <td align="left" style="margin: 3px;padding-top: 8px;" colspan="2" ><#if subsidiary.legalname != 'Arkance Optimum France'><img height="35" src="https://5565205.app.netsuite.com/core/media/media.nl?id=29071&amp;c=5565205&amp;h=fHlBw3ApMvTQHds6Nkd9BCMOk2v9ju5KTXBw8YkNPg7qgMhX&amp;fcts=20201214044405&amp;whence=" style="float: right; margin: 3px;padding-top: 1px;" width="80" /></#if></td>
	<td line-height="8.5" colspan="7" style="padding-left: 20px;"><span class="footer-company-bold">${subsidiary.legalname}</span><span class="footer-company-coordinate">&nbsp;${subsidiary.mainaddress.addr1}-${subsidiary.mainaddress.addr2}&nbsp;${subsidiary.mainaddress.zip}<br />${subsidiary.mainaddress.city}</span><br /><#if subsidiary.legalname='Arkance Optimum France'><span class="footer-company-coordinate">www.arkance.world &nbsp; <#if subsidiary.custrecord_sub_phone != ''><span class="footer-company-coordinate">T&eacute;l. : ${subsidiary.custrecord_sub_phone}</span></#if></span><#else><span class="footer-company-coordinate"> www.arkance.world &nbsp; T&eacute;l. : ${subsidiary.custrecord_sub_phone}</span></#if><br /><!--	<span class="footer-company-coordinate">${subsidiary.id.Url}</span><span class="footer-company-bold">&nbsp;Tél. : 01 39 44 18 18</span><br />--> <span class="footer-agency">${subsidiary.custrecord_form_line1}</span><br/><span class="footer-agency">${subsidiary.custrecord_form_line2}</span><#if subsidiary.legalname = 'Arkance Systems France'><span class="footer-agency2">${subsidiary.custrecord_form_line3}</span></#if><#if subsidiary.legalname = 'Arkance Optimum France'><span class="footer-agency">${subsidiary.custrecord_form_line3}</span></#if></td>
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
            padding: 0;
            font-size: 10pt;
        }
        table.footer td {
            padding: 0;
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
            padding-top: 0;
        }
        td.totalboxmid {
            font-size: 28pt;
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
</style>
</head>
<body header="nlheader" header-height="10%" footer="nlfooter" footer-height="40pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">
    <table style="width: 100%;"><tr>
	<td align="right" class="address" style="font-size: 6pt; padding-bottom: 10px;">Merci de rappeler notre num&eacute;ro de commande sur vos factures.</td>
	</tr></table>

<table style="width: 100%;"><tr>
	<td class="addressheader" colspan="5"><b>ADRESSE DE LIVRAISON</b></td>
	<td>&nbsp;</td>
	<td class="addressheader" colspan="5"><b>ADRESS&Eacute;E &Agrave;</b></td>
	</tr>
	<tr><!--<td class="address" colspan="5" rowspan="2">${record.shipaddress}</td>-->
	<td class="address" colspan="5"><!--${record.subsidiary} --><br></br>${record.shipaddress}</td>
	<td>&nbsp;</td>
	<td class="address" colspan="5"> ${record.entity.custentity_vendor_primary_contact}<br></br> ${record.billaddress}</td>
	</tr></table>
<!--<table style="width: 100%;"><tr>
	<td class="addressheader" colspan="5"><b>RESPONSABLE</b></td>
	</tr>
	<tr>
	<td class="address" colspan="5" rowspan="2">${record.createdby}</td>
	</tr></table>-->

<table style="width: 100%;"><tr>
	<td class="addressheader" style="width: 245px;"><b>RESPONSABLE : </b></td>
	<td class="address" style="width: 535px;">${record.custbody_po_creator}</td>
	</tr></table>

<table style="width: 100%;"><tr>
	<td class="addressheader" style="width: 245px;"><b>CONDITIONS DE PAIEMENT : </b></td>
	<td class="address" style="width: 535px;">${record.terms}</td>
	</tr></table>
<!--<table class="body" style="width: 100%;"><tr>
	<th>${record.duedate@label}</th>
	<th>${record.otherrefnum@label}</th>
	<th>${record.billphone@label}</th>
	</tr>
	<tr>
	<td>${record.duedate}</td>
	<td>${record.otherrefnum}</td>
	<td>${record.billphone}</td>
	</tr></table>-->
<#if record.item?has_content>
<table class="itemtable" style="width: 100%;"><!-- start items --><#list record.item as item><#if item_index==0>
<thead>
	<tr>
	<th colspan="12">REF.</th>
	<th align="center" colspan="3">QT&Eacute;</th>
	<th align="right" colspan="4">PRIX PUBLIC</th>
	<!--<th align="right" colspan="4">P.U.H.T</th>-->
	<th align="right" colspan="4">MONTANT NET H.T</th>
	<th align="right" colspan="4">TAUX T.V.A</th>
	<th align="right" colspan="4">T.V.A</th>
	</tr>
</thead>
</#if><tr>
	<td colspan="12"><span class="itemname">${item.item}</span><br />${item.description}</td>
	<td align="center" colspan="3" line-height="150%">${item.quantity}</td>
	<td align="right" colspan="4">${item.rate}</td>
	<td align="right" colspan="4">${item.amount}</td>
	<td align="right" colspan="4">${item.taxrate1}</td>
	<td align="right" colspan="4">${item.tax1amt}</td>
	<!--<td align="right" colspan="2">${item.grossamt}</td>--></tr>
	</#list><!-- end items --></table>
</#if><#if record.expense?has_content>

<table class="itemtable" style="width: 100%;"><!-- start expenses --><#list record.expense as expense ><#if expense_index==0>
<thead>
	<tr>
	<th colspan="12">D&eacute;signation</th>
	<th align="right" colspan="4">${expense.amount@label}</th>
	</tr>
</thead>
</#if><tr>
	<td colspan="12">${expense.memo}</td>
	<td align="right" colspan="4">${expense.amount}</td>
	</tr>
	</#list><!-- end expenses --></table>
</#if>

<hr />
<table class="itemtable" style="width: 100%;"><!-- start items -->
<thead>
	<tr>
	<th colspan="12" style="width: 85px;">TOTAL H.T</th>
	<th align="center" colspan="3" style="width: 100px;">PORT</th>
	<th align="right" colspan="4" style="width: 95px;">T.V.A</th>
	<th align="right" colspan="4" style="width: 142px;">&nbsp;</th>
	<th align="right" colspan="4" style="width: 197px;">TOTAL</th>
	</tr>
</thead><tr>
	<td colspan="12" style="width: 85px;">${record.custbody_stc_amount_after_discount}</td>
	<td align="center" colspan="3" line-height="150%" style="width: 100px;">&nbsp;</td>
	<td align="right" colspan="4" style="width: 95px;">${record.taxtotal}</td>
	<td align="right" colspan="4" style="width: 142px;">&nbsp;</td>
	<td align="right" colspan="4" style="width: 97px;">${record.total}</td>
	</tr></table>

<table class="total" style="width: 100%;"><tr class="totalrow">
	<td background-color="#ffffff" colspan="4">&nbsp;</td>
	<td align="right"><b>SIGNATURE</b></td>
	<td align="right">&nbsp;</td>
	</tr></table>

<table style="width: 60%; font-size: 6pt;padding-top: 10px;"><tr>
	<td align="left" class="address">1. Veuillez envoyer vos factures &agrave; l&#39;adresse ci-dessous ou par mail &agrave; comptabilite@arkance-systems.com</td>
	</tr>
	<tr>
	<td align="left" class="address">2. Cette commande doit &ecirc;tre strictement honor&eacute;e en conformit&eacute; avec les prix, conditions et types de livraison sp&eacute;cifi&eacute;s ci-dessus.</td>
	</tr>
	<tr>
	<td align="left" class="address">3. En cas d&#39;impossibilit&eacute; d&#39;honorer cette commande, veuillez nous le notifier imm&eacute;diatement.</td>
	</tr></table>
</body>
</pdf>