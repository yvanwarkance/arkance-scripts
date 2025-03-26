<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">

<#--  Variables to be used in the template (for the discount display logic - Bluebeam Project)  -->
<#assign labDiscount = "Remise" />
<#assign labTotalinWithoutDiscountBox='Total sans remise (€HT)' />
<#assign labTotalinBox='Total (€HT)' />
<#assign currency='€' />
<#assign labTAmount='Montant total (€HT)' />
<#assign labAmountVAT='TVA (20%)' />
<#assign labAmountInclVAT='Montant Total (TTC)' />
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
					<td rowspan="3">
						&nbsp;
					</td>
					<td rowspan="3">
						&nbsp;
					</td>
					<td rowspan="3">
												<#if subsidiary.logo?length != 0><img src="${subsidiary.logo@Url}" style="float: left; margin: 7px; width:170px;height:70px" /> </#if>
                      <!--<img src="https://5565205.app.netsuite.com/core/media/media.nl?id=7404&amp;c=5565205&amp;h=4e5ee471eaafc01f29bf" style="float: right; margin: 7px" /> -->
					</td>
				</tr>
			</table>
        </macro>
      	<macro id="nlheader2">
            <table class="header" style="width: 100%;">
				<tr>
					<td rowspan="3">
						<p class="enrollment-form-ref-number"><span class="enrollment-form-ref-number-label">N/Réf. :</span>&nbsp;${record.tranid}</p>
					</td>
					<td rowspan="3">
						&nbsp;
					</td>
					<td rowspan="3">
												<#if subsidiary.logo?length != 0><img src="${subsidiary.logo@Url}" style="float: left; margin: 7px; width:170px;height:70px" /> </#if>
                      <!--<img src="https://5565205.app.netsuite.com/core/media/media.nl?id=7404&amp;c=5565205&amp;h=4e5ee471eaafc01f29bf" style="float: right; margin: 7px" /> -->
					</td>
				</tr>
			</table>
        </macro>
        <macro id="nlfooter">
			<table class="footer" style="width: 100%;"><tr>
	<td colspan="12" align="right" width="100%">Page <pagenumber/>/<totalpages/></td>
	</tr>
	<tr>
    <td align="left" style="margin: 0px;padding-top: 8px;" colspan="1"><!--<#if subsidiary.legalname != 'Arkance Optimum France'><img height="35" src="https://5565205.app.netsuite.com/core/media/media.nl?id=29071&amp;c=5565205&amp;h=fHlBw3ApMvTQHds6Nkd9BCMOk2v9ju5KTXBw8YkNPg7qgMhX&amp;fcts=20201214044405&amp;whence=" style="float: right; margin: 3px;padding-top: 1px;" width="80" /></#if>--></td>
	<td line-height="8.5" colspan="8" style="padding-top:10px;padding-left:7px;"><span class="footer-company-bold">${subsidiary.legalname}</span><span class="footer-company-coordinate">&nbsp;${subsidiary.mainaddress.addr1}-${subsidiary.mainaddress.addr2}&nbsp;${subsidiary.mainaddress.zip} ${subsidiary.mainaddress.city}</span><br /><span class="footer-agency footer-agency-bold">${subsidiary.custrecord_form_line1}</span><br/><#if subsidiary.legalname='Arkance Optimum France'><span class="footer-company-coordinate">www.arkance.world &nbsp; <#if subsidiary.custrecord_sub_phone != ''><span class="footer-company-coordinate">T&eacute;l. : ${subsidiary.custrecord_sub_phone}</span></#if></span><#else><span class="footer-company-coordinate"> www.arkance.world &nbsp; T&eacute;l. : ${subsidiary.custrecord_sub_phone}</span></#if> - <span class="footer-agency2">${subsidiary.custrecord_form_line2}</span><br /><!--	<span class="footer-company-coordinate">${subsidiary.id.Url}</span><span class="footer-company-bold">&nbsp;Tél. : 01 39 44 18 18</span><br />--><#if subsidiary.legalname = 'Arkance Systems France'><span class="footer-agency2">${subsidiary.custrecord_form_line3}</span></#if><#if subsidiary.legalname = 'Arkance Optimum France'><span class="footer-agency">${subsidiary.custrecord_form_line3}</span></#if></td>
      <td align="right" colspan="2"><#if subsidiary.legalname != 'Arkance Optimum France'>
        <#if !record.class?c_lower_case?contains("bluebeam")>
           <img height="50" src="https://5565205.app.netsuite.com/core/media/media.nl?id=1816723&amp;c=5565205&amp;h=HnF4Qjxw5CF-TVDtlGnnQpSJoyRsx7nlRkpO2RAg0_LWxpmj" style="margin: 3px;padding-top: 1px;" width="76" />
        <#else>
           <img height="21" width="85" style="margin: 3px;padding-top: 3px;position:relative; right: 15px;" src="https://5565205.app.netsuite.com/core/media/media.nl?id=5389446&amp;c=5565205&amp;h=kYofT3sMnv_hwMziplpKfu763H-sGTjOBK938pmB9giKqm-A&amp;fcts=20250122034502" />
        </#if>
          <!--img height="10" width="40" src="https://5565205.app.netsuite.com/core/media/media.nl?id=7412&amp;c=5565205&amp;h=55fec30cedcfef81471d" style="margin: 3px;padding-top: 1px;" width="120" /--></#if></td>
	</tr></table>
        </macro>
    </macrolist>
    <style type="text/css">
		* {
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
		span.footer-tiny {
			font-size: 6pt;
			color: #254164;
		}
		table.recipient {
			width: 100%;
		}
		td.company-name {
			font-size: 11pt;
			font-weight: bold;
		}
		td.attention {
			font-size: 10pt;
			font-weight: bold;
			font-style: italic;
		}
		td.address {
			font-size: 10pt;
		}
		td.reference-number {
			font-size: 10pt;
          	font-weight: bold;
			font-style: italic;
		}
		span.underline {
			text-decoration: underline;
          	font-weight: bold;
		}
		td.object {
			font-size: 10pt;
			font-style: italic;
		}
      	span.bold{
          	font-weight: bold;
		}
		span.bold-underline {
			text-decoration: underline;
          	font-weight: bold;
		}
		td.location {
			font-size: 11pt;
		}
		td.validity {
			font-size: 10pt;
			font-style: italic;
		}
		p.estimate-date {
			font-size: 10pt;
			text-align: right;
		}
        p.general-condition-ordered-sublist {
        	font-size: 5pt;
			font-weight: normal;
			color: black;
      	}
		p.salutation {
			font-size: 10pt;
		}
		p.first-page-text {
			font-size: 10pt;
		}
		span.first-page-bold-text {
		}
		p.employee-signature {
		align: right;
          width: 40%;
		}
		span.employee-signature-name {
			font-size: 10pt;
			font-weight: bold;
		}
		span.employee-signature-phone {
			font-size: 10pt;
		}
		span.employee-signature-email {
			font-size: 10pt;
		}
		span.employee-signature-title {
			font-size: 8pt;
			font-style: italic;
		}
		hr.title-above-and-beyond-line {
			width: 100%;
			background-color: #43aada;
		}
		p.item-page-title {
			font-size: 10pt;
			font-weight: bold;
			font-style: italic;
		}
		p.proposition-commerciale {
			font-size: 12pt;
			font-weight: bold;
			font-style: italic;
			color: #0070c0;
		}
		th.item-table-header {
			font-size: 10pt;
			font-weight: bold;
			text-align: center;
			background-color: #d6edfc;
			border: 1px solid black;
		}
		span.item-table-subheader {
			font-weight: normal;
		}
		td.item-table-item {
			font-size: 8pt;
			border: 1px solid black;
		}
		span.item-table-bold-item-ref {
			font-size: 8pt;
			font-weight: bold;
		}
		span.item-table-header-detail {
			font-size: 7pt;
		}
		td.item-table-empty-total {
			border: 0px;
			background-color: white;
		}
		td.item-table-total-label {
			font-size: 9pt;
			font-weight: bold;
			border: 1px solid black;
		}
		td.item-table-total-value {
			font-size: 9pt;
			font-weight: bold;
			border: 1px solid black;
		}
		p.item-page-total {
			font-size: 12pt;
			font-weight: bold;
		}
		p.delay-label {
			font-size: 12pt;
			font-weight: bold;
			font-style: italic;
			text-decoration: underline;
		}
		p.delay-value {
			font-size: 9pt;
		}
		p.payment-condition-label {
			font-size: 12pt;
			font-weight: bold;
			font-style: italic;
			text-decoration: underline;
		}
		p.payment-condition-value {
			font-size: 10pt;
		}
		p.item-page-disclaimer {
			font-size: 8pt;
		}
		p.training-bold-and-underlined {
			font-size: 10pt;
			font-weight: bold;
			text-decoration: underline;
		}
		span.training-bold-and-underlined {
			font-size: 10pt;
			font-weight: bold;
			text-decoration: underline;
		}
		p.training-text {
			font-size: 10pt;
		}
		span.training-cancelation-bold {
			font-size: 10pt;
			font-weight: bold;
		}
		span.training-existance-declaration-number {
			font-size: 10pt;
		}
		p.enrollment-form-ref-number{
			font-size: 10pt;
			font-weight: bold;
		}
		span.enrollment-form-ref-number-label {
			font-size: 10pt;
			font-weight: bold;
			text-decoration: underline;
		}
		p.enrollment-form-title {
			font-size: 14pt;
			font-weight: bold;
			color: #19426f;
			width: 100%;
			text-align: center;
		}
      	p.enrollment-form-subtitle {
			font-size: 12pt;
			font-weight: bold;
			color: #19426f;
			width: 100%;
			text-align: center;
		}
		div.enrollment-form-box {
			font-size: 10pt;
			padding: 0 10px 0 10px;
			border: 1pt solid black;
			width: 100%;
			text-align: left;
		}
      	div.enrollment-form-dotted-lines{
        	width: 100%;
          	border-bottom: 1px dotted;
            margin-top:20px
      }
		p.enrollment-form-text {
			font-size: 9pt;
		}
      	span.enrollment-form-text-small-italic {
			font-style: italic;
          	font-weight: normal;
          font-size: 8pt;
		}
		span.enrollment-form-bold-and-underlined {
			font-size: 10pt;
			font-weight: bold;
			text-decoration: underline;
			color: #1d416f;
          	margin-bottom:10px;
		}
		ul.enrollment-form-unchecked-checkbox-list {
			list-style-type: "&#x025FB;";
		}
		p.enrollment-form-bold-text {
			font-size: 9pt;
			font-weight: bold;
		}
		span.enrollment-form-underlined-text {
			text-decoration: underline;
		}
		span.enrollment-form-person-to-enroll-title {
			font-size: 10pt;
			font-weight: bold;
			color: #1d416f;
		}
		p.enrollment-form-company {
			font-size: 8pt;
			width: 60%;
			align: center;
			text-align: left;
			padding-bottom: 50px;
			border: 2pt solid #2face6;
		}
      	th.enrollment-form-th{
        	border:0.5px;
          	background-color:white;
      	}
      	tr.enrollment-form-tbody-tr>td{
        	border:0.5px;
          	background-color:white;
          	padding-top: 20px;
      	}
		span.enrollment-form-company-label {
			font-size: 10pt;
			text-align: center;
			font-weight: bold;
		}
		p.forfait-hotline-title {
			font-size: 12pt;
			font-weight: bold;
			color: #1c426e;
		}
		table.forfait-hotline-table {
			border-collapse: collapse;
		}
		th.forfait-hotline-table-header-empty {
			border: 0px;
			background-color: white;
		}
		th.forfait-hotline-table-header {
			font-size: 9pt;
			font-weight: bold;
			background-color: #d6edfc;
			border: 1px solid black;
		}
		td.forfait-hotline-table-subheader-empty {
			border: 0px;
		}
		td.forfait-hotline-table-subheader {
			font-size: 9pt;
			font-style: italic;
			border: 1px solid black;
		}
		td.forfait-hotline-table-data-multirow {
			font-size: 10pt;
			border: 1px solid black;
		}
		td.forfait-hotline-table-data{
			font-size: 9pt;
			border: 1px solid black;
		}
		td.forfait-hotline-table-check {
			color: green;
			border: 1px solid black;
		}
		td.forfait-hotline-table-cross {
			color: red;
			border: 1px solid black;
		}
		td.forfait-hotline-table-data-seperation {
			border-left: 0px;
			border-right: 0px;
		}
		p.forfait-hotline-details-bold {
			font-size: 9pt;
			font-weight: bold;
			font-style: italic;
		}
		p.forfait-hotline-details {
			font-size: 10pt;
		}
		span.forfait-hotline-details-emphasis{
			font-weight: bold;
		}
		p.title-bar-on-top-and-bottom {
			font-size: 10pt;
			width: 100%;
			padding-top: 5px;
			padding-bottom: 3px;
			border-top: 2pt solid #1e416c;
			border-bottom: 2pt solid #1e416c;
		}
		p.financial-offer-text {
			font-size: 9pt;
		}
		ul.financial-offer-text {
			font-size: 9pt;
		}
		p.financial-offer-subtitle {
			font-size: 12pt;
			font-weight: bold;
			font-style: italic;
			color: #1b4170;
		}
		p.reason-to-choose-arkance-label {
			font-size: 12pt;
			font-weight: bold;
			width: 100%
			align: center;
			color: #1caded;
		}
		p.reason-to-choose-arkance-value {
			font-size: 12pt;
			font-style: italic;
			width: 100%
			align: center;
		}
		p.general-condition-title {
			font-size: 9pt;
			font-weight: bold;
			color: #194273;
		}
		p.general-condition-subtitle {
			font-size: 9pt;
			font-weight: bold;
		}
		p.general-condition-text {
			font-size: 5pt;
		}
		td.general-condition-table-data-left {
			border-right: 1px solid #43aada;
		}
		td.general-condition-table-data-right {
			border-left: 1px solid #43aada;
		}
		ol.general-condition-ordered-list {
			font-size: 6pt;
			font-weight: bold;
			color: #1caded;
		}
		li.general-condition-ordered-list-item {
			font-size: 6pt;
			font-weight: bold;
			color: #1caded;
		}
		ol.general-condition-ordered-sublist {
			font-size: 5pt;
			font-weight: normal;
			color: black;
		}
		li.general-condition-ordered-sublist-item {
			font-size: 5pt;
			font-weight: normal;
			color: black;
		}
		ul.general-condition-unordered-subsublist {
			font-size: 5pt;
			font-weight: normal;
			color: black;
		}
      
      	#page1 {
        	header: nlheader;
          	header-height: 10%;
      	}
      	#page2, #page3, #page4, #page5, #page6, #page7, #page8, #page9, #page10 {
        	header: nlheader2;
          	header-height: 10%;
      	}
	</style>
</head>
<body footer="nlfooter" footer-height="40pt" padding="0.1in 0.5in 0.4in 0.5in" size="Letter">
	<#setting locale="fr_FR">
    <#assign hasTrainingItem = false />
	<#if record.item?has_content>
		<#list record.item as item>
			<#if item.item == "Training Item">
				<#assign hasTrainingItem = true />
				<#break />
			</#if>
		</#list>
	</#if>

	<table class="recipient">
		
		<tr>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
			<td class="address">${record.billaddress}</td>
		</tr>
      <tr>
			<td>&nbsp;</td>
			<td>&nbsp;</td>
		</tr>
	</table>
      <br/>
      <br/>

	<table class="estimate-details">
		<tr> 
			<td class="reference-number"><span class="underline">N/Réf. :</span> ${record.tranid}</td>
		</tr>
		<tr>
			<td class="object"><span class="bold-underline">OBJET :</span> Proposition Commerciale</td>
		</tr>
		<tr>
			<td class="location">${record.location}</td>
		</tr>
		<tr>
			<td class="validity">Validité : ${record.custbody_validity_date}</td>
		</tr>
	</table>

	<p class="estimate-date">Le ${record.trandate}</p>

	<p class="salutation">${record.entity.salutation}</p>

	<p class="first-page-text">
		Suite à notre conversation, nous vous remercions de votre confiance et vous adressons notre proposition de formation.
	</p>

	<p class="first-page-text">
		Notre division dédiée à la formation bénéficie des synergies créées entre les activités de terrain (bureau d'études, maintenance, hotline, ...) 
		et les activités d'ingénierie de la société. Cette spécificité nous permet d'avoir à la fois une expertise technique de pointe et une expérience 
		concrète des métiers de nos clients.
	</p>

	<p class="first-page-text">
		25 formateurs permanents agréés, 20 salles de formation dédiées, un parc machine évolué, une hotline formation et matériel, 
		ce sont ces atouts qui sont reconnus par Autodesk dans le cadre du label <span class="first-page-bold-text">ATC</span> (Authorized Training Center).
	</p>

	<p class="first-page-text">
		ARKANCE SYSTEMS dispose de la certification ISO 9001 (2015) et Qualiopi pour l’ensemble de ses procédures de formations.
	</p>

	<p class="first-page-text">
		Notre société s'engage concrètement sur la pertinence et l'efficacité des formations proposées via l’analyse des besoins, la mise en place de 
		formations personnalisées et la certification et le suivi post-formation. 
	</p>

	<p class="first-page-text">
		Nous nous permettrons de vous contacter prochainement pour vous fournir les informations complémentaires dont vous pourriez avoir besoin.
	</p>

	<p class="first-page-text">
		Nous vous prions d'agréer l'expression de nos salutations distinguées. <!-- TODO: Add Primary Contact Salutation -->
	</p>

	<br/>
	<p class="employee-signature" style="page-break-after: always;text-align: left;">
		<span class="employee-signature-name">${record.salesrep.firstname}&nbsp;${record.salesrep.lastname}</span><br />
      	<span class="employee-signature-phone">${record.salesrep.phone}</span><br />
		<span class="employee-signature-email">${record.salesrep.email}</span><br />
		<span class="employee-signature-title">${record.salesrep.title}</span>
	</p>
 
  <!-- <body header="nlheader2" header-height="10%" footer="nlfooter" footer-height="40pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">-->
	<!-- ESTIMATE ITEM TABLE PAGE -->
	<div class="estimate-title">
		<hr class="title-above-and-beyond-line" />
		<p class="proposition-commerciale">Proposition Commerciale</p>
	</div>

	<#--  Logic to apply discounts on the total amount (According to the specifications of the bluebeam project)  -->
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
	<#else>
		<#--  We want to replicate the same behavior as the "noDiscount" option  -->
		<#assign discountDisplay="noDiscount" />
	</#if>

	<#if record.item?has_content>
		<table class="itemtable" style="width: 100%; margin-top: 10px;">
			<!-- start items -->
			<#list record.item as item>
				<#if item_index == 0>
					<thead>
						<tr>
                          <th class="item-table-header" align="center" width="4%">Qté</th>
							<th class="item-table-header" align="center" width="35%">Réf.<br /><span class="item-table-subheader">Désignation</span></th>
							<th class="item-table-header" align="center" width="6%">Marque<br /></th>
							
							<th class="item-table-header" align="center" width="10%">Prix<br />Unitaire<br /><span class="item-table-header-detail">( &euro;HT)</span></th>
							<#if discountDisplay="inlineAndTotal" && discountOnLine=true>
								<th class="item-table-header" align="center" width="10%">
									${labDiscount}
								</th>
							</#if>
							<th class="item-table-header" align="center" width="10%">Total<br /><span class="item-table-header-detail">(&euro;HT)</span></th>
						</tr>
					</thead>
				</#if>
             
				<tr>

					<#assign hasInlineDiscount=false />
					<#if item.custcol_inline_discount?has_content>
						<#assign hasInlineDiscount=true />
					</#if>
                  
					<#--  <#if !inlineDiscountPercentage?has_content>
						<#assign inlineDiscountAmount = "" />
						<#assign standardRate = item.rate />
						<#assign discountedRate = item.rate />
					<#else>
						<#assign hasInlineDiscount = true />
						<#assign term = item.custcol_swe_contract_item_term_months />
						<#if !term?has_content>
							<#assign standardRate = item.custcol_list_rate />
							<#assign discountedRate = item.rate />
						<#else>
							<#assign listRate = item.custcol_list_rate />
							<#assign standardRate = listRate * term />
							<#assign discountedRate = item.rate />
						</#if>
						<#assign inlineDiscountAmount = standardRate - discountedRate />
					</#if>  -->
                    <td class="item-table-item" align="center" width="4%">${item.quantity}</td>
					<td class="item-table-item" align="left" width="35%">
                      <span class="item-table-bold-item-ref">${item.item}</span>
                      <br />${item.description} 
                    </td>
					<td class="item-table-item" align="center" width="6%">${item.custcol_product_line}</td>
                    <#--  4th cell (while removing discount) -->
                    <#assign cal_rate=item.custcol_rate_before_discount />
                    <#if item.itemtype=="Group" || item.itemtype=="EndGroup">
                        <#if item.quantity!=0>
                            <#assign cal_rate=(item.custcol_amount_before_discount / item.quantity) />
                        </#if>
                    </#if>
                    <td class="item-table-item" align="right" width="10%">
                        <#if item.itemtype="Discount">
                            ${item.rate?string['#,###,##0.00']?replace('Ft','')?replace('€','')}
						<#elseif discountDisplay="noDiscount">
							${item.custcol_calculated_rate?string['#,###,##0.00']?replace('Ft','')?replace('€','')}
                        <#else>
                            ${cal_rate?string['#,###,##0.00']}
                        </#if>
                    </td>
                    <#--  5th cell (Dynamically added with discount logic) & last cell  -->
                    <#if (discountDisplay="inlineAndTotal" || discountDisplay="noDiscount" ) && discountOnLine=true>
                        <#if discountDisplay="inlineAndTotal">
                            <td class="item-table-item" align="right" width="10%">
                                <#if item.custcol_inline_discount !=0>
                                    <#--  5th cell  -->
                                    ${item.custcol_line_discount_amount?string['#,###,##0.00']} (${item.custcol_inline_discount})
                                </#if>
                            </td>
                        </#if>
                        <#--  last cell  -->
                        <#assign discountedAmount=item.custcol_amount_before_discount - item.custcol_line_discount_amount>
                        <td class="item-table-item" align="right" width="10%">
                            ${discountedAmount?string['#,###,##0.00']}
                        </td>
                    <#else>
                        <#--  last cell only  -->
                        <td class="item-table-item" align="right" width="10%">
                            ${item.custcol_amount_before_discount?string['#,###,##0.00']}
                        </td>
                    </#if>
                    <#if item.custcol_inline_discount?has_content>
                        <#assign totalDiscount=totalDiscount + item.custcol_line_discount_amount>
                    </#if>
                    <#--  <td class="item-table-item" align="right" width="10%"><#if item.itemtype = "Discount">${item.rate}<#else>${item.custcol_calculated_rate}</#if></td>
					<td class="item-table-item" align="right" width="10%">${item.amount}</td>  -->
				</tr>
			</#list>
			<!-- end items -->
            <#assign trueSubtotal=record.subtotal + totalDiscount>
            <#--  Totals Section (According to the specifications of the bluebeam project)  -->
            <#--  1st total row  -->
            <#if (discountDisplay="inlineAndTotal" || discountDisplay="onTotal" )>
                <tr>
                    <#--  To account for the 1st, 2nd, 3rd column to be skipped, we neeed to add the "&nbsp;" syntax  -->
                    <#--  The colspan property allow the cell to expand to n columns (When necessary)  -->
                    <td class="item-table-empty-total" align="left">&nbsp;</td>
                    <td class="item-table-empty-total" align="left">&nbsp;</td>
                    <#if discountDisplay="inlineAndTotal">
                        <td class="item-table-empty-total" align="left">&nbsp;</td>
                    </#if>
                    <td class="item-table-total-label" colspan="2" align="right">
                        <#if discountDisplay="inlineAndTotal">
                            ${labTotalinWithoutDiscountBox}
                            <#else>
                                ${labTotalinBox}
                        </#if>
                    </td>
                    <td class="item-table-total-value" align="right">
                        <#if trueSubtotal??>
                            ${trueSubtotal?string['#,###,##0.00']} ${currency}
                        </#if>
                    </td>
                </tr>
            </#if>

            <#--  2nd & 3rd total row  -->
            <#if totalDiscount !=0 && (discountDisplay="inlineAndTotal" || discountDisplay="onTotal" )>
                <tr>
                    <td class="item-table-empty-total" align="left">&nbsp;</td>
                    <td class="item-table-empty-total" align="left">&nbsp;</td>
                    <#if discountDisplay="inlineAndTotal">
                        <td class="item-table-empty-total" align="left">&nbsp;</td>
                    </#if>
                    <td class="item-table-total-label" colspan="2" align="right">
                        <#if totalDiscount !=0>
                            ${labDiscount}
                        </#if>
                    </td>
                    <td class="item-table-total-value" align="right">
                        <#if totalDiscount !=0>-&nbsp;${totalDiscount?string['#,###,##0.00']} ${currency}
                        </#if>
                    </td>
                </tr>
                <#if discountDisplay!="onTotal">
                    <tr>
                        <td class="item-table-empty-total" align="left">&nbsp;</td>
                        <td class="item-table-empty-total" align="left">&nbsp;</td>
                        <#if discountDisplay="inlineAndTotal">
                            <td class="item-table-empty-total" align="left">&nbsp;</td>
                        </#if>
                        <td class="item-table-total-label" colspan="2" align="right">
                            ${labTotalinBox}
                        </td>
                        <#if (discountDisplay="inlineAndTotal" || discountDisplay="noDiscount" )>
                            <td class="item-table-total-value" align="right">
                                <#if trueSubtotal??>
                                    ${record.subtotal?string['#,###,##0.00']} ${currency}
                                </#if>
                            </td>
                        <#else>
                            <td class="item-table-total-value" align="right">
                                <#if trueSubtotal??>
                                    ${trueSubtotal?string['#,###,##0.00']} ${currency}
                                </#if>
                            </td>
                        </#if>
                    </tr>
                </#if>
            </#if>

            <#--  4th total row  -->
            <#if discountDisplay="onTotal" || discountDisplay=" onTotal" || discountDisplay="noDiscount">
                <#assign BaseImponible=trueSubtotal - totalDiscount>
                <tr>
                    <td class="item-table-empty-total" align="left">&nbsp;</td>
                    <td class="item-table-empty-total" align="left">&nbsp;</td>
                    <#if discountDisplay="inlineAndTotal">
                        <td class="item-table-empty-total" align="left">&nbsp;</td>
                    </#if>
                    <td class="item-table-total-label" colspan="2" align="right">
                        ${labTAmount}
                    </td>
                    <td class="item-table-total-value" align="right">
                        ${BaseImponible?string['#,###,##0.00']} ${currency}
                    </td>
                </tr>
            </#if>

            <#--  last 2 total row  -->
            <tr>
                <td class="item-table-empty-total" align="left">&nbsp;</td>
                <td class="item-table-empty-total" align="left">&nbsp;</td>
                <#if discountDisplay="inlineAndTotal">
                    <td class="item-table-empty-total" align="left">&nbsp;</td>
                </#if>
                <td class="item-table-total-label" colspan="2" align="right">
                    ${labAmountVAT} 
                </td>
                <td class="item-table-total-value" align="right">
                    ${record.taxtotal?string['#,###,##0.00']} ${currency}
                </td>
            </tr>
            <tr>
                <td class="item-table-empty-total" align="left">&nbsp;</td>
                <td class="item-table-empty-total" align="left">&nbsp;</td>
                <#if discountDisplay="inlineAndTotal">
                    <td class="item-table-empty-total" align="left">&nbsp;</td>
                </#if>
                <td class="item-table-total-label" colspan="2" align="right">   
                    ${labAmountInclVAT}
                </td>
                <td class="item-table-total-value" align="right">
                    ${record.total?string['#,###,##0.00']} ${currency}
                </td>
            </tr>
			<#--  <tr>
				<td class="item-table-empty-total" colspan="2" align="left" width="50%">&nbsp;</td>
				<td class="item-table-total-label" colspan="2" align="right" width="20%">Montant total (&euro;HT)</td>
				<td class="item-table-total-value" align="right" width="20%">${record.subtotal}</td>
			</tr>
			<tr>
				<td class="item-table-empty-total" colspan="2" align="left" width="50%">&nbsp;</td>
				<td class="item-table-total-label" colspan="2" align="right" width="20%">TVA (20%)</td>
				<td class="item-table-total-value" align="right" width="10%">${record.taxtotal}</td>
			</tr>
			<tr>
				<td class="item-table-empty-total" colspan="2" align="left" width="60%">&nbsp;</td>
				<td class="item-table-total-label" colspan="2" align="right" width="20%">Montant total (TTC)</td>
				<td class="item-table-total-value" align="right" width="10%">${record.total}</td>
			</tr>  -->
		</table>
	</#if>

	<p class="payment-condition-label">Conditions de paiement :</p>
	<p class="payment-condition-value">${record.terms}</p>

	<p class="training-text">
		<span class="training-bold-and-underlined">Cet investissement comprend :</span><br />
		<ul>
			<li>La prestation du formateur ;</li>
			<li>La personnalisation des exercices réalisés en formation (si le client en a fait la demande) ;</li>
			<li>Le support de cours correspondant au logiciel de la formation (si disponible) ;</li>
			<li>La mise à disposition d'un poste de travail par stagiaire (pour les formations en nos locaux);</li>
		</ul>
		<span class="training-bold-and-underlined">Financement par un organisme collecteur :</span><br />
		Pour que nous puissions programmer le stage, objet de votre demande, nous vous remercions de bien vouloir<br />
		nous en préciser le mode de prise en charge (par la société ou par un organisme collecteur).<br />
		Si le stage est financé par un organisme collecteur, merci de joindre à votre commande l'avis d'acceptation de
		prise en charge.
      <br />
      <br />
      <span class="training-bold-and-underlined">Avertissement :</span><br />
		ARKANCE Systems a défini des prérequis nécessaires pour profiter au mieux des enseignements de chaque formation. Vous avez en charge de vérifier auprès de vos collaborateurs leur adéquation avec ceux-ci avant de procéder à leur inscription.
      <br />
      <br />
      Arkance Systems a défini un programme de formation qui se compose de 12 thèmes permettant ainsi de valider les objectifs initiaux. Cependant, deux thèmes pourront être adaptés selon les besoins exprimés par les stagiaires lors du tour de table de début de session de formation.
      <br />
      

	</p>

	<p style="page-break-after: always;">
		<span class="training-bold-and-underlined">Annulation :</span><br />
		<span class="training-cancelation-bold">Toute inscription non annulée par écrit 8 jours avant la date de début du stage est considérée comme définitive.</span><br />
		<span class="training-existance-declaration-number">N° de déclaration d'existence :&nbsp;</span><span class="training-cancelation-bold">11780231378</span>
	</p>

	<!-- FORMULAIRE D'INSCRIPTION PAGE -->
	<p class="enrollment-form-title">FORMULAIRE D'INSCRIPTION</p>
    <p class="enrollment-form-subtitle">(1 exemplaire à remplir par module de formation)</p>
	<div class="enrollment-form-box" style="padding-bottom:5px">
    	<p><span class="bold">Formation</span> <span class="enrollment-form-text-small-italic">(intitulé)</span> :</p>
      	<div class="enrollment-form-dotted-lines"/>
      	<div class="enrollment-form-dotted-lines"/>
      	<p><span class="bold">Dates</span> <span class="enrollment-form-text-small-italic">(validées avec ARKANCE SYSTEMS au préalable)</span> :</p>
      	<div class="enrollment-form-dotted-lines"/>
     </div>

	<p class="enrollment-form-text">
		<span class="enrollment-form-bold-and-underlined">Financement par un opérateur de compétence (OPCO)</span><br /><br />
		Vous pouvez bénéficier d’une prise en charge partielle ou totale du budget pour la formation ci-dessus par votre organisme «Collecteur» auquel vous versez vos cotisations annuelles.
	</p>

	<p class="enrollment-form-text">
		<span class="enrollment-form-bold-and-underlined">Procédure à suivre dans le cas d’une demande de prise en charge</span><br /><br />
		<ul style="margin-left:25px;">
			<li>Établir le dossier de prise en charge (délivré par votre organisme collecteur) en y joignant le bon de commande et le plan de formation fourni par ARKANCE SYSTEMS.</li>
			<li>Nous retourner ce devis signé ainsi que l’avis d’acceptation de prise en charge par votre OPCO.</li>
          	<li>Nous vous adresserons alors la convention de formation à nous retourner signée.</li>
		</ul>
	</p>
  	<p class="enrollment-form-text">
      	<span class="enrollment-form-bold-and-underlined">Demandez-vous une prise en charge par votre OPCO ?</span>
	</p>
      <table>
        <tr style="color:red;">
          <td style="border:1px solid red;padding:8px"></td>
          	<td><span class="enrollment-form-text-small-italic">(Je certifie que nous sommes à jour de nos cotisations)</span></td>
        </tr>
  	</table>
	<div class="enrollment-form-box" style="margin:15px 0 0 0;padding-top:5px;padding-bottom:5px">
          <table>
            <tr>
              <td style="border:1px solid;padding:8px"></td>
                <td><span class="bold" style="font-size:14px">OUI</span> dans ce cas merci de préciser les informations ci-dessous :</td>
            </tr>
        </table>
        <div style="padding-left:25px">
			<p class="enrollment-form-text">Nom de l’organisme :</p>
            <div class="enrollment-form-dotted-lines" style="margin-bottom:0px"/>
            <p style="margin-top:0px"><span class="enrollment-form-text-small-italic">(exemple : OPCO ATLAS, OPCO2i, OPCO CONSTRUCTYS…etc)</span> :</p>
            <p class="enrollment-form-text">Adresse de votre OPCO ? </p>
            <div class="enrollment-form-dotted-lines"/>
            <div class="enrollment-form-dotted-lines"/>
            <p class="enrollment-form-text">Nom/Prénom/Courriel/Téléphone du gestionnaire de votre dossier :</p>
            <div class="enrollment-form-dotted-lines"/>
            <div class="enrollment-form-dotted-lines"/>
            <table style="padding-left:0;width:100%;margin-top:5px">
              <tr>
                <td style="padding-left:0">Y-aura-t-il une facturation directe à l’OPCO ? :</td>
                <td>
                  <table>
                      <tr>
                        <td style="border:1px solid;padding:8px"></td>
                      	<td>
                          <span class="bold">Oui</span>
                          <span class="enrollment-form-text-small-italic">(= subrogation si 100% pris en charge)</span>
                        </td>
                      </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <table>
                      <tr>
                        <td style="border:1px solid;padding:8px"></td>
                          <td><span class="bold">Non</span></td>
                      </tr>
                  </table>
                </td>
              </tr>
          </table>
          <p class="enrollment-form-text">Nom/prénom/Adresse pour l’envoi de la facture (OPCO où à l’entreprise) : </p>
          <div class="enrollment-form-dotted-lines"/>
        </div>
    </div>
 	<div class="enrollment-form-box" style="margin-top:0;border-top:0;padding-top:5px;padding-bottom:5px">
      <table>
      	<tr>
        	<td style="border:1px solid;padding:8px"></td>
            <td><span class="bold" style="font-size:14px">NON</span> facturation à l’entreprise, à cette adresse courriel :</td>
        </tr>
      </table>
      <div class="enrollment-form-dotted-lines"/>
  	</div>
	<p class="enrollment-form-text" style="page-break-before: always;">
		<span class="enrollment-form-bold-and-underlined">Attention</span><br />
		<span class="bold">
			Merci de nous informer, <span class="enrollment-form-underlined-text">impérativement avant la facturation</span> si votre OPCO demande à être facturé directement par ARKANCE SYSTEMS. Sans information de votre part, nous vous adresserons les factures directement et aucune modification ne sera possible à posteriori.<br /></span>
      Nous tenons à vous préciser qu’en l’absence d’avis d’acceptation dûment réceptionné, toute formation commandée fera l’objet d’une facturation directe à l’entreprise, conformément aux conditions générales de vente.
    </p>
	<p class="enrollment-form-text">
		<span class="enrollment-form-bold-and-underlined">Inscription du (des) stagiaire(s) :</span>
	</p>
  
  	<table style="width:100%;border:1px;background-color:white;">
      <thead>
        <tr >
          <th class="enrollment-form-th" colspan="1">M/Mme</th>
          <th class="enrollment-form-th" colspan="2">Prénom</th>
          <th class="enrollment-form-th" colspan="4">Nom</th>
          <th class="enrollment-form-th" colspan="4">Fonction</th>
          <th class="enrollment-form-th" colspan="2">Téléphone</th>
          <th class="enrollment-form-th" colspan="4">Courriel</th>
        </tr>
      </thead>
      <tbody>
      		<tr class="enrollment-form-tbody-tr">
        		<td colspan="1"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
              	<td colspan="4"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
        	</tr>
        <tr class="enrollment-form-tbody-tr">
        		<td colspan="1"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
              	<td colspan="4"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
        	</tr>
        <tr class="enrollment-form-tbody-tr">
        		<td colspan="1"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
              	<td colspan="4"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
        	</tr>
        <tr class="enrollment-form-tbody-tr">
        		<td colspan="1"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
              	<td colspan="4"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
        	</tr>
        <tr class="enrollment-form-tbody-tr">
        		<td colspan="1"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
              	<td colspan="4"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
        	</tr>
        <tr class="enrollment-form-tbody-tr">
        		<td colspan="1"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
              	<td colspan="4"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
        	</tr>
        <tr class="enrollment-form-tbody-tr">
        		<td colspan="1"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
              	<td colspan="4"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
        	</tr>
        <tr class="enrollment-form-tbody-tr">
        		<td colspan="1"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
              	<td colspan="4"></td>
              	<td colspan="2"></td>
              	<td colspan="4"></td>
        	</tr>
      </tbody>
  	</table>

	<p class="enrollment-form-text" style="margin-top:20px">
		Fait le ...............................
	</p>

	<p class="enrollment-form-company" style="page-break-after: always;">
		<span class="enrollment-form-company-label">L'ENTREPRISE</span><br />
		(Signature précédée de la mention « lu et approuvé » et cachet)
	</p>


	<!-- GENERAL CONDITION PAGE -->
	<p class="general-condition-title" align="center">CONDITIONS GÉNÉRALES DE VENTE ET DE SERVICES</p>
	<p class="general-condition-title" align="center">Mises à jour le 4 mai 2021</p>
	<table style='table-layout:fixed; width:100%'>
      <tr>
		<td style="text-align:left; width:50%; border-right: 1px solid #43aada;">
			<ol class="general-condition-ordered-list">
				<li value="1" class="general-condition-ordered-list-item">
					Objet
                          <p class="general-condition-ordered-sublist">
                            Les présentes Conditions Générales (« CG ») s’appliquent à tout Client professionnel acceptant une offre commerciale (« l’Offre ») émise par ARKANCE SYSTEMS FRANCE, Société par Actions Simplifiée, sis 2 Rue René Caudron - 78960 Voisins-le-Bretonneux, RCS VERSAILLES 339 715 542 (« AS ») dans les délais spécifiés dans l’Offre. Elles s’appliquent à défaut de contrat spécifique entre les Parties, à l’exclusion des conditions d’achat du Client expressément écartées. Elles forment, avec l’Offre et le(s) Bon(s) de Commande(s), le « Contrat ». Toute Commande devra parvenir à AS par mail, signée et datée. Toute dérogation devra figurer dans des conditions particulières au sein des Bon de Commande. Les présentes CG concernent exclusivement : <br />
                            – La distribution de logiciels standards (« Logiciels ») proposés par les éditeurs (« Editeurs »)<br />
                            – Les prestations type formation, consulting, modélisation numérique, développements spécifiques (les « Services »)<br />
                            – La location et la revente de matériel informatique (les « Matériels »)
                     		</p>
					<br/>
				</li>
				<li value="2" class="general-condition-ordered-list-item">
						Durée et résiliation
					<ol class="general-condition-ordered-sublist">
                    	<li value="2.1" class="general-condition-ordered-sublist-item"><b style="color: #194273;">DUREE DE L’OFFRE : </b>Sauf indication contraire, cette dernière est valable pendant 30 jours à compter de la date qui figure sur l’Offre. Passé ce délai, le Client ne pourra revendiquer les conditions exprimées dans l’Offre. </li>
                        <li value="2.2" class="general-condition-ordered-sublist-item"><b style="color: #194273;">DUREE DU CONTRAT : </b>Le Contrat prendra effet à la date spécifiée dans l’Offre. A défaut, la date de prise d’effet sera celle de l’acceptation de l’Offre par le Client.<br />A défaut d’indication dans l’Offre ou dans le Bon de Commande, le Contrat restera en vigueur : (a) Pour les Services : jusqu’à la complète exécution des prestations, conformément au calendrier d’exécution prévu dans l’Offre ; (b) pour les Logiciels : jusqu’au terme de la licence souscrite par le Client ; (c) pour les Matériels : jusqu’au complet paiement du prix ou des loyers. </li>
                        <li value="2.3" class="general-condition-ordered-sublist-item"><b style="color: #194273;">RECONDUCTION : </b>Au terme des durées susvisées, le Contrat sera tacitement renouvelé, aux mêmes conditions et pour des durées successives équivalentes à la durée initiale, sauf dénonciation par le Client, adressée par courrier recommandé avec accusé de réception dans un délai de 30 jours avant le terme du Contrat.</li>
                        <li value="2.4" class="general-condition-ordered-sublist-item"><b style="color: #194273;">RESILIATION : </b>En cas de manquement par le Client aux obligations qui lui incombent, non réparé dans un délai de 15 jours suivant la réception l’une LRAR notifiant le manquement au Client, AS pourra, sans autre formalité ni recours au juge, et sans indemnité à verser au Client, résilier de plein droit le Contrat ou le Bon de Commande concerné, sans préjudice du droit à réparation auquel pourrait prétendre AS.</li>
					</ol><br/>
				</li>
              	<li value="3" class="general-condition-ordered-list-item">
						Modalités et fourniture des services
						<ol class="general-condition-ordered-sublist">
							<li value="3.1" class="general-condition-ordered-sublist-item"><b style="color: #194273;">GENERALITES : </b>L’Offre définit le périmètre des prestations et les livrables à réaliser, la durée des prestations, les modalités de leur exécution et les conditions financières. Le Client reconnait avoir reçu toutes les informations nécessaires et utiles pour accepter l’Offre. AS exécute les Services du lundi au vendredi de 9H à 17H, hors jours fériés. En cas d’intervention sur site du Client, ce dernier assure le libre accès au personnel d’AS. Un représentant du Client doit être présent lors de toute intervention. Le Client communiquera tout élément nécessaire à l’exécution du Service. </li>
							<li value="3.2" class="general-condition-ordered-sublist-item"><b style="color: #194273;">LES PRESTATIONS SUR PROPOSITION PERSONNALISEE : </b>Telles que les modélisations numériques, font l’objet d’une validation de conformité à la proposition d’AS selon les modalités convenues entre les Parties. Par défaut les livrables sont considérés comme validés 5 jours calendaires après leur livraison si le Client n’a pas signifié une non-conformité documentée pendant cette période.</li>
                          	<li value="3.3" class="general-condition-ordered-sublist-item"><b style="color: #194273;">LES PRESTATIONS DE CONSULTING ET DE MODELISATION : </b>Sont réputées acceptées par le Client s’il n’a pas émis par écrit, par défaut dans un délai maximum de 7 jours calendaires suivant la date de remise du livrable, ses éventuelles réserves telles qu’une demande de clarification ou un défaut de complétude. Toute nouvelle présentation du livrable au Client intervient selon une procédure identique. La mise en œuvre des préconisations figurant dans le livrable entraîne son acceptation de plein droit.</li>
                         	<li value="3.4" class="general-condition-ordered-sublist-item"><b style="color: #194273;">LES PRESTATIONS DE FORMATION : </b>Sont assurées par un formateur choisi librement par AS. Dans le cas où la formation se déroule dans les locaux du Client, celui-ci doit prévoir une salle et le matériel adapté à la formation : confort, calme et équipements pédagogiques et informatiques selon les consignes du formateur. Le Client doit s’assurer de la motivation des participants et de leur niveau technique en raison de complexité des logiciels. Les formations doivent impérativement être suivies d’un investissement personnel et d’une pratique effective du logiciel. La documentation doit être consultée par les utilisateurs. En cas d’annulation par le Client, celui-ci reste redevable des sommes suivantes : 100% du prix si l’annulation par mail est notifiée moins de 24h avant l’heure de début ; 50% si notification entre 2 à 4 jours ouvrés : 25% si notification entre 5 à 8 jours ouvrés. Chaque formation fait l’objet à son issue de deux questionnaires de satisfaction, l’un pour le formateur, l’autre pour les participants.</li>
                          	<li value="3.5" class="general-condition-ordered-sublist-item"><b style="color: #194273;">LES DEVELOPPEMENTS SPECIFIQUES : </b>Font l’objet d’une phase de réception sur la base du cahier de tests et sous la responsabilité du Client qui définit les scenarii de réussite et d’échec adaptés à son activité. Les cahiers de tests, préparés par le Client et validés techniquement par AS, sont réputés être pleinement représentatifs de l’activité du Client. L’achèvement du déroulement de la phase de test donne lieu à l’établissement par AS d’un procès-verbal. Le Client peut mentionner sur ledit procès verbal ses réserves éventuelles avec leurs qualifications dans un délai maximal de 15 jours calendaires. À défaut de réserve, la réception est réputée prononcée de plein droit et ne peut être remise en cause à aucun titre. La mise en production entraîne également réception de plein droit. Si le Client émet des réserves reproductibles, les Parties conviennent alors d’une période de correction compatible avec la nature des anomalies à corriger et des actions à mettre en œuvre par les Parties à cet effet, avant toute nouvelle présentation. Seule une anomalie majeure (empêchant ou gênant substantiellement la mise en production du livrable), est de nature à empêcher le prononcé d’une réception.</li>
						</ol>
				</li>
          </ol>
        </td>
        <td style="text-align:right; border-left: 1px solid #43aada">
          <ol class="general-condition-ordered-list">
              	<li value="4" class="general-condition-ordered-list-item">
						Modalités des livraisons des matériels
                  <p class="general-condition-ordered-sublist">
                    En cas de retard de livraison, le Client signale ce retard par tout moyen à AS qui contactera le transporteur pour faire démarrer une enquête. Si le Matériel est retrouvé, il sera réacheminé à l’adresse de livraison. Si le Matériel n’est pas retrouvé les Parties se concerteront sur les modalités de la poursuite de la commande. Il appartient au Client de vérifier le nombre et l’état des produits à la livraison. En cas d’avarie ou de manquant, il doit faire des réserves précises par LRAR auprès du transporteur dans le délai légal de 3 jours, hors jour férié, qui suivent celui de la livraison sous peine d'extinction de l'action en responsabilité envers le transporteur. Le Client doit adresser à AS, dans un délai de 5 jours calendaires, ses protestations adressées au transporteur ou une erreur de livraison ou encore une non-conformité au Bon de Commande. La réclamation est d’abord adressée par mail en précisant la référence de la commande et les coordonnées complètes du Client puis par LRAR à AS avec les mêmes informations. Les réclamations non effectuées selon les dispositions ci-dessus ne sont pas prises en compte. Le Client ne peut pas refuser des livraisons partielles dès lors qu’elles sont facturées séparément. Aucune marchandise ne pourra être retournée sans l’autorisation préalable et écrite d’AS. 
La réception des Matériels résulte de la constatation de leur conformité avec les spécifications techniques publiées par les constructeurs.
                  </p>
                  <br/>
				</li>
				<li value="5" class="general-condition-ordered-list-item">
				Modalités de fourniture et d'installation des logiciels
				<p class="general-condition-ordered-sublist">
					Les présentes CG ne sauraient être interprétées comme un contrat de licence. Dans le cadre du présent Contrat, AS n’est que distributeur des Logiciels, y compris les logiciels développés par une société du groupe Arkance. Lorsque le Client souscrit à une Licence, il doit accepter les EULA disponibles sur les sites des Editeurs. Les Logiciels sont accessibles, par défaut, par téléchargement via le compte du Client. La fourniture d’un Logiciel par un autre moyen est convenue avec AS si c’est techniquement possible. L’installation des Logiciels est opérée par le Client sauf si les Parties en ont convenu différemment. Il appartient au Client de s’assurer que ses équipements informatiques sont compatibles avec le Logiciel qu’il entend commander en recourant à un prestataire tiers ou en contactant la hotline d’AS.
                </p>
                  <br/>
				</li>
            <li value="6" class="general-condition-ordered-list-item">
				Obligations et droits particuliers des parties
				<p class="general-condition-ordered-sublist">
					Le Client peut vouloir partager ou diffuser sur des sites web, tels que des forums, des propos ou contenus concernant les produits ou services commandés à AS. Le Client doit au préalable s’assurer qu’il en a le droit, en particulier que les propos ne sont pas injurieux, diffamatoires ou dénigrants et que les contenus ne sont pas sujet à des restrictions divulgation ou de de diffusion notamment pour des raisons de propriété intellectuelle ou de secret des affaires.<br/> Le Client est responsable de ses propos et diffusions.
Le Client est responsable de la conformité et de la disponibilité des configurations matérielles et logicielles et, d’une manière générale, de tout équipement qu’il met à la disposition d’AS à l’occasion d’une prestation de services. Il doit prendre à titre préventif toutes les mesures nécessaires pour éviter tout dommage résultant d’une atteinte aux fichiers, données, mémoires, programmes, documentation et informations de toutes natures qui pourraient être mis à la disposition d’AS ou qui pourraient être modifiées ou effacées indirectement par AS. À cet effet, il doit notamment effectuer les sauvegardes de tous ces éléments.<br/>
AS peut refuser d’effectuer la livraison d’un produit ou d’honorer la commande d’une prestation émanant d’un Client qui n’aurait pas réglé totalement une commande précédente ou avec lequel un litige de paiement serait en cours.
              	</p>
              <br/>
            </li>
            <li value="7" class="general-condition-ordered-list-item">
				Prix et paiement
				<p class="general-condition-ordered-sublist">
					Les prix sont exprimés HT, majorés de la TVA lors de la facturation. Le prix sont exigibles à compter de l’émission du Bon de Commande pour les Matériels et au moment où AS commence à fournir le Service, hormis les Services pour lesquels AS a spécifiquement indiqué qu’ils sont payables comptant à la Commande. Les prix s’entendent départ de l’entrepôt, emballage compris. Sauf accord contraire, les frais de transport jusqu’au lieu d’installation sont à la charge du Client.<br/>Le règlement des sommes dues doit intervenir à la date d’échéance portée sur la facture. Sauf accord contraire, les factures sont échues 30 jours après la date de leur établissement. Aucun escompte n’est pratiqué pour paiement anticipé. Le règlement par le Client est réputé accompli lorsque le compte bancaire d’AS est crédité de la totalité des sommes dues, principales et accessoires, avec indication par le Client de la (des) créance(s) correspondante(s) éteinte(s) par le règlement.<br/>Le Client s'acquittera du paiement de chaque facture par virement bancaire en valeur compensée le jour de l’échéance. Nonobstant les dispositions de l’article L 441-6 du Code de Commerce, le Client reconnait que sa Commande ne sera acceptée qu’après sa validation auprès du service financier. AS se réserve le droit de solliciter un acompte correspondant à 50 % du montant de la Commande et la réception d’une traite à 30 jours nets à la Commande.<br/>Les factures sont établies et payables dans la devise exprimée dans l’Offre.
<br/>Toute somme non payée par le Client à l’échéance pourra donner lieu (a) à l’application d’intérêts de retard d’un montant égal à 3 fois le taux d’intérêt légal ; (b) à une indemnité forfaitaire de 40€ pour frais de recouvrement. Si AS doit recourir à un tiers, les frais de recouvrement des factures impayées sont répercutés automatiquement sur le Client. Une indemnité complémentaire pourra être réclamée lorsque les frais de recouvrement exposés sont supérieurs à ce montant ; (c) après mise en demeure adressée par LRAR, restée sans effet au bout de 15 jours calendaires à compter de sa réception, la suspension de la Commande ou sa résiliation, (d) la déchéance du terme de toutes les factures non échues.
              	</p>
             </li>
          </ol>
        </td>
      </tr>
  	</table>
	<table style='table-layout:fixed; width:100%'>
		<tr>
			<td style="text-align:left; width:50%; border-right: 1px solid #43aada;">
              <ol class="general-condition-ordered-list">
                <li value="8" class="general-condition-ordered-list-item">
				Propriété - Licence
				<ol class="general-condition-ordered-sublist">
					<li value="8.1" class="general-condition-ordered-sublist-item"><p>
                      <b style="color: #194273;">BIENS MATERIELS : </b>Nonobstant toute clause de réserve de propriété, les Matériels voyagent aux risques du Client. Les risques sont transférés au Client (a) dès la fin du chargement dans l’établissement d’AS ou de son mandataire sur le moyen de transport pour les marchandises qu’il s’est chargé d’expédier, sauf recours contre le transporteur – (b) dès sa mise à disposition dans les entrepôts d’AS pour la marchandise à enlever chez lui. La même stipulation vaut si l’enlèvement est différé par le Client. Les matériels vendus restent la propriété pleine et entière d’AS jusqu’au complet paiement du prix : principal, frais et taxes.
                      </p></li>
                    <li value="8.2" class="general-condition-ordered-sublist-item"><p>
                      <b style="color: #194273;">PROPRIETE INTELLECTUELLE : </b>Chaque Partie reste propriétaire de ses méthodes et de son savoir-faire. Sans préjudice des dispositions sur la cession du paragraphe suivant, AS reste également propriétaire des documents, schémas, programmes, outils, informations et données, de quelque nature que ce soit, qui sont utilisés, créés ou développés (avec ou sans le concours du Client) par AS dans le cadre de l’exécution des prestations.
Sous réserve de leur complet paiement, AS cède au Client les droits de propriété intellectuelle sur les développements spécifiques, sur les livrables réalisés dans le cadre d’une Offre personnalisée et sur les résultats des prestations de consulting et de bureau d’étude. La cession comprend le droit de reproduction par le Client pour ses besoins propres. Le Client ne dispose sur les supports de formation que d’un droit d’utilisation sans possibilité de le reproduire pour d’autres personnes que celles ayant suivi la formation.
Outre les dispositions imposées par les Editeurs de Logiciels, le Client s’interdit lui-même ou par l’intermédiaire de tiers (a) de reproduire en tout ou partie le Logiciel, au-delà d’une seule copie de sauvegarde pour la sécurité d’exploitation, et/ou la documentation par n’importe quel moyen et sous n’importe quelle forme, (b) de traduire ou de transcrire le Logiciel et/ou la documentation dans tout autre langage où de les adapter.
                      </p>
					</li>
                    <li value="8.3" class="general-condition-ordered-sublist-item"><p>
                      <b style="color: #194273;">LICENCE : </b>Les Logiciels ainsi que les web services associés font l’objet d’une licence d’utilisation ainsi que des conditions contractuelles dont les termes sont de la seule responsabilité des Editeurs. Le Client doit accepter ces conditions au moment de l’installation du logiciel et deviendra alors le cocontractant direct de l’Editeur. L’ensemble des droits, obligations et garanties du Client sont définis dans ces conditions sans aucun recours à l’encontre d’AS qui n’en est que le distributeur. LES LOGICIELS STANDARDS EDITES PAR LE GROUPE ARKANCE FONT L’OBJET D’UNE LICENCE D’UTILISATION SEPAREE, ACCEPTEE AU MOMENT DE L’INSTALLATION DU LOGICIEL PAR LE CLIENT.
                      </p>
					</li>
				</ol><br/>
			</li>
            <li value="9" class="general-condition-ordered-list-item">
				Données personnelles
				<p class="general-condition-ordered-sublist">
                      Pour permettre le traitement de sa Commande, le Client peut être amené à créer un compte en ligne dans lequel il renseigne les rubriques suivantes : nom, prénom, adresse postale, numéro de téléphone, adresse email, mot de passe. Les traitements opérés sur les données à caractère personnel ainsi que les droits du Client sont indiquées dans les CGU du site web d’AS. L’acceptation des présentes CG emporte l’acceptation par le Client du traitement opéré par AS nécessaire à l’exécution des prestations. Si AS doit opérer un traitement dépassant le cadre de l’exécution des prestations, les Parties conviendront des mesures techniques et organisationnelles à mettre en place par elles en application de l’article 28 du Règlement 2016/679 du 27 avril 2016 dit "RGPD" et par la loi n°78-17 du 6 janvier 1978 modifiée dite "Informatique et Libertés", le Client étant identifié comme "Responsable de traitement" et le AS comme "Sous-traitant".
                </p><br/>
			</li>
            <li value="10" class="general-condition-ordered-list-item">
                Garanties
                <p class="general-condition-ordered-sublist">
                    La garantie des Matériels et des Logiciels correspond à celle accordée par leur Fabricant ou Editeur. Les Editeurs ne concèdent pas de licences destinées à répondre aux besoins spécifiques du Client qui est seul responsable de la définition de ses besoins et du choix des Logiciels proposés. AS et les Editeurs ne garantissent aucune adéquation des Logiciels aux besoins spécifiques du Client. En particulier, les Editeurs ne garantissent pas au Client que les calculs opérés par les Logiciels seront pertinents au regard des objectifs techniques que celui-ci veut atteindre et des informations qu’il veut obtenir du Logiciel. Outre les limites de l’état de l’art, les résultats obtenus en utilisant les Logiciels dépendent des données introduites dans le Logiciel. Aucune garantie ne s’appliquera en présence de défauts ou dommages résultant notamment (a) de l’installation par le Client sur des produits informatiques, d’un logiciel ou d’une interface sans l’accord écrit d’AS (b) d’une interconnexion à un produit logiciel ou à des produits tiers ou fournis par le Client, (c) d’un mauvais fonctionnement (panne, erreur, incompatibilité, ...) de l’environnement d’utilisation, (d) d’une modification non approuvée par AS d’un mauvais usage du Matériel, ou d’un entretien incorrect ou inadéquat par le client (e) du non-respect des spécifications d’environnement ou d’alimentation électrique. En cas d’erreur de livraison ou d’échange, le produit doit être retourné à AS dans son ensemble avec tous ses éléments et dans son emballage d’origine, à l’adresse indiquée par mail d’AS en réponse à la demande de retour ou d’échange. Les frais de retour des produits sous garantie sont à la charge d’AS. Les produits voyagent aux risques du Client.
                 </p><br/>
                 </li>
             <li value="11" class="general-condition-ordered-list-item">
                 Responsabilité - Assurance
                  <p class="general-condition-ordered-sublist">
                     AS est soumis à une obligation de moyens au titre de la fourniture des Services. AS prendra en charge toute correction nécessaire pour remédier aux conséquences de ses erreurs, omissions ou négligences, sauf en cas de modification des livrables par le Client sans l’intervention ou l’autorisation préalable et écrite d’AS. La responsabilité d’AS est limitée à la réparation des préjudices directs subis par le Client à l’exclusion des dommages indirects tels que perte de données, la perte d’exploitation, le préjudice commercial ou l’atteinte à l’image de marque. Par ailleurs, sont exclues les mises à niveau ou corrections générées par les modifications légales ou réglementaires ayant une influence sur les biens ou services ou leur utilisation. Cette indemnisation est limitée au montant de la Commande à l’occasion de l’exécution de laquelle le dommage est survenu. Toute réclamation doit être émise dans un délai maximum d’un mois suivant la découverte du dommage. Les éventuelles pénalités prévues dans l’Offre seront libératoires.
                  </p><br/>
              </li>
              </ol>
			</td>
          	<td style="text-align:right; border-left: 1px solid #43aada;">
				<ol class="general-condition-ordered-list">
                     <li value="12" class="general-condition-ordered-list-item">
                          Force majeure
                          <p class="general-condition-ordered-sublist">
                                Aucune des Parties n’aura failli à ses obligations contractuelles, dans la mesure où leur exécution sera retardée, entravée ou empêchée par un cas de force majeure telles que définie à l’article 1218 du code civil, tel que catastrophes naturelles, pandémies, conditions climatiques dégradées, sanctions internationales, embargos, grèves, lockouts ou autres conflits sociaux, troubles à l'ordre public, actes terroristes ou autres actes malveillants, difficultés propres aux réseaux de télécommunication telles que interruption, piratage ou dénis de service, ou encore les défaillances, indisponibilités ou retards des partenaires commerciaux d’AS. La Partie concernée en avisera l’autre dans les 5 jours ouvrables suivant la date à laquelle elle en aura eu connaissance, par tout moyen disponible. Les Parties se rapprocheront alors, dans un délai d’un mois pour examiner l’incidence de l’événement et convenir des conditions dans lesquelles l’exécution du contrat sera poursuivie.
                           </p><br/>
                      </li>
                      <li value="13" class="general-condition-ordered-list-item">
                          Confidentialité
                          <p class="general-condition-ordered-sublist">
                                Pendant toute la durée du Contrat et durant les trois (3) années suivant son terme, pour quelque cause que ce soit, les Parties s'engagent à garder confidentielles les informations dont elles ont connaissance dans le cadre du Contrat. Les informations confidentielles ne doivent pas être divulguées à des tiers, directement ou indirectement, sous quelque forme que ce soit sauf obligation légale, fiscale ou administrative. AS est autorisée à citer le Client ainsi que l’objet générique de ses commandes à titre de référence commerciale, sauf opposition du Client.
                          </p><br/>
                      </li>
                    <li value="14" class="general-condition-ordered-list-item">
                          Dispositions diverses
                          <p class="general-condition-ordered-sublist">
                                Si une ou plusieurs stipulations des présentes conditions générales sont tenues pour non valides ou déclarées telles en application d’une loi, d’un règlement ou à la suite d’une décision définitive d’une juridiction compétente, les autres stipulations garderont toute leur force et leur portée. Le fait pour l’une des parties, de ne pas se prévaloir d’un manquement par l’autre partie à l’une quelconque des obligations visées dans les présentes conditions générales, ne saurait être interprété pour l’avenir comme une renonciation à l’obligation en cause.
                          </p><br/>
                    </li>
					<li value="15" class="general-condition-ordered-list-item">
						Non sollicitation
						<p class="general-condition-ordered-sublist">
                              Le Client s’engage pendant la durée du Contrat, et pour une période de six (6) mois après son terme, à ne pas embaucher, ou faire travailler directement ou par personne ou société interposée, tout collaborateur d’AS ayant participé directement à l’exécution du Contrat.
                        </p><br/>
                     </li>
					<li value="16" class="general-condition-ordered-list-item">
						Notifications
						<p class="general-condition-ordered-sublist">
                              Toutes les notifications, pour être valides, doivent être effectuées par LRAR à l’adresse postale d’AS indiquée au début des présentes CG ou à l’adresse postale du Client indiquées sur son compte.
                        </p><br/>
                    </li>
					<li value="17" class="general-condition-ordered-list-item">
						Droit applicable - Attribution de juridiction
						<p class="general-condition-ordered-sublist">
                              La présent Contrat est régi par loi française. 
A DEFAUT DE PARVENIR A UNE SOLUTION AMIABLE, LES PARTIES S’ACCORDENT A SOUMETTRE TOUT DIFFEREND AU TRIBUNAL DE COMMERCE DE VERSAILLES, SUR L’INITIATIVE DE LA PARTIE LA PLUS DILIGENTE, NONOBSTANT PLURALITE DE DEFENDEURS OU APPEL EN GARANTIE, Y COMPRIS POUR LES PROCEDURES D’URGENCE OU LES PROCEDURES CONSERVATOIRES, EN REFERE OU PAR REQUETE.
                        </p>
					</li>
				</ol>
			</td>
		</tr>
	</table>
</body>
</pdf>