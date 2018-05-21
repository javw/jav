var id_product_x = "";
var id_branch_x = "";
var id_subbranch_x = "";
var code_order_x = "";
var failed = 0;
function loading(id){
	var el = jQuery("."+id).parents(".portlet");
	App.blockUI(el);
	window.setTimeout(function () {
		App.unblockUI(el);
	}, 1000);
}

function remove_toggle(id){
	jQuery('.'+id).toggle('slow');
}

function close_dialog(id){
	$('#'+id).dialog("close");
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function confirm_approve(){
	$(".dialog_confirm").dialog({
	      dialogClass: 'ui-dialog-green',
	      height: 210,
	      modal: true,
	      buttons: [
	      	{
	      		'class' : 'btn green',	
	      		"text" : "OK",
	      		click: function() {
					$(this).dialog( "close" );
        			save_approve();
      			}
	      	},
	      	{
	      		'class' : 'btn',
	      		"text" : "Cancel",
	      		click: function() {
        			$(this).dialog( "close" );
      			}
	      	}
	      ]
	    });
}

function confirm_reject(){
	$(".dialog_reject").dialog({
	      dialogClass: 'ui-dialog-green',
	      height: 210,
	      modal: true,
	      buttons: [
	      	{
	      		'class' : 'btn green',	
	      		"text" : "OK",
	      		click: function() {
					$(this).dialog( "close" );
        			save_reject();
      			}
	      	},
	      	{
	      		'class' : 'btn',
	      		"text" : "Cancel",
	      		click: function() {
        			$(this).dialog( "close" );
      			}
	      	}
	      ]
	    });
}



function confirm_warning(kata){
	$(".dialog_warning").text(kata);
	$(".dialog_warning").dialog({
	      dialogClass: 'ui-dialog-red',
	      height: 180,
	      modal: true,
	      buttons: [
	      	{
	      		'class' : 'btn',
	      		"text" : "Close",
	      		click: function() {
        			$(this).dialog( "close" );
      			}
	      	}
	      ]
	    });
}

function clearData(){
	$('#myform')[0].reset();
}

function save_approve(){
	//alert("id prod: "+id_product_x+"id sub: "+id_subbranch_x+"id branch: "+id_branch_x+"code: "+code_order_x);
	var temp = $('#myform').serializeArray();
	var z = 0;
	var salah = '';
	var codeOrder="";
	var limit = 0;
	var validTimeToApprove = true;
	var orderDate ;
	
	$("input:checkbox[class^='ord']").each(function() { 
		if(this.checked ) { 
			var ss = $(this).attr('id').split("_");
			var isitext = parseInt($('input:text[name=toApprove_' + ss[1] + ']').val());
			var isistock = parseInt($('input:text[name=toApprove_' + ss[1] + ']').attr('stock'));
			var tot_order = parseInt($('input:text[name=toApprove_' + ss[1] + ']').attr('tot_order'));
			console.log(ss[1]+'|'+isitext+'|'+isistock+'|'+tot_order);
			if ( (isitext  === '') || (isitext == 0) || (! /^[0-9]+$/.test(isitext)) || ( isitext > tot_order ) || ( isitext > isistock ) ) {
				salah = 'salah';
			}	
			z++;	
		}	
	});
	
	
	try{
		$("input:checkbox[class^='checkorder']").each(function() { 
			if(this.checked ) { 
				console.log("getID = "+this.id);
				var tmpX = this.id;
				tmpX=tmpX.split('_');
				codeOrder=tmpX[1];
				console.log("Clean getID = "+codeOrder);
			}	
		});
	}catch(err){
		console.log("err on get code "+err);
	}
			
	
	//validasi untuk mengecek territory sebelum approve	
	if ( z == 0) {
		confirm_warning("You must checked approve");		
		return false;
	}	
	
	if ( salah == 'salah') {
		confirm_warning("Please Check your Qty Approve, some failed, can not fill empty, 0 or greater than Qth OnHand");		
		return false;
	}
	
	//alka ambil date limit dari global parameter begin
	try{
		console.log("try to hit : "+domain+"process_approve/cekDateLimit");
		console.log("code : "+codeOrder);
			alert(result[0]_;
			alert(result[1]_;
			alert(result[2]_;
			$.ajax({
				url:  domain+"process_approve/cekDateLimit",
				dataType: "json",
				type: "POST",
				data: {
						"code_order":codeOrder
					},
				success : function(result){
					console.log("on Success process : "+result);
					limit = result[0];
					orderDate = result[1];
					validTimeToApprove = result[2];	
					if ( validTimeToApprove===false ) {
					confirm_warning("You can not approve because approval time already expired");					
					} else{
						cekTeritory(temp);
					}					
				}
			});

	}catch(err){
		console.log("err "+ err);
	}	
	//alka ambil date limit dari global parameter end
	
	
	
	//$("#add-group").attr('disabled','disabled');
	
}

function cekTeritory(temp){
	$.ajax({
		url:  domain+"process_approve/cekTerritory",
		dataType: "json",
		type: "POST",
		data: {
				"id_product" :  id_product_x,				
				"id_subbranch" :  id_subbranch_x,				
				"id_branch" :  id_branch_x,
				"code_order" : code_order_x
			},
		success : function(data){
			if(data[0].id_territory_distributor==0){
				confirm_warning("Unapproved, because the territory changed");
				$("#toApprove_"+id_product_x+"_"+id_subbranch_x).val('');
			}else{
				//validasi perpindahan
				validationMovement(temp);
			}
		}
	});
}

function validationMovement(temp){
	//alert('validation movement');
	$.ajax({
		url:  domain+"process_approve/cekMovement",
		dataType: "json",
		type: "POST",
		data: {
				"id_product" :  id_product_x,				
				"id_subbranch" :  id_subbranch_x,				
				"id_branch" :  id_branch_x,
				"code_order" : code_order_x
			},
		success : function(data){
			//alert('validation movement success');
			//alert(data[0].total+",id_product:"+id_product_x+",id_subbranch:"+id_subbranch_x+",id_branch:"+id_branch_x+",code_order:"+code_order_x);
			if(data[0].total==0){
				confirm_warning("Unapproved, because outlet, distributor, or territory has moved");
				$("#toApprove_"+id_product_x+"_"+id_subbranch_x).val('');
			}else{
				//approve data
				//alert('approving data');
				save_approve_success(temp);
				
			}
		}
	});
}

function save_approve_success(temp){
	//alert (data);
	$.ajax({
		type : 'post',
		data : {'data':temp},	
		dataType : 'json',
		beforeSend: function() {$('#loading').show();},	
		complete: function() {$('#loading').hide();	},
		url : domain+'process_approve/save',
		success : function(data){
			alert(data.message);
			loadTable('', '', '');
			clearData();
			$("#add-group").removeAttr('disabled');
		}
	});
}

function save_reject(){
	
	var data = $('#myform').serializeArray();
	
	var y = 0;
	var z = 0;
	var salah = '';
	var code_order = '';
	
	$("input:checkbox[class='checkorder']").each(function() { 
		if(this.checked ) { 
			var ss = $(this).attr('id').split("_");
			code_order = ss[1];
			console.log(code_order);
			y++;	
		}	
	});
	
	$("input:checkbox[class^='ord']").each(function() { 
		if(this.checked ) { 
			var ss = $(this).attr('id').split("_");
			var isitext = parseInt($('input:text[name=toApprove_' + ss[1] + ']').val());
			var isistock = parseInt($('input:text[name=toApprove_' + ss[1] + ']').attr('stock'));
			var tot_order = parseInt($('input:text[name=toApprove_' + ss[1] + ']').attr('tot_order'));
			console.log(ss[1]+'|'+isitext+'|'+isistock+'|'+tot_order);
			if ( (isitext  === '') || (isitext == 0) || (! /^[0-9]+$/.test(isitext)) ) {
				salah = 'salah';
			}
			z++;	
		}	
	});
	
	if ( z == 0 && y == 0) {
		confirm_warning("You must checked approve");
		return false;
	}
	
	$("#add-group").attr('disabled','disabled');
	
	$.ajax({
		type : 'post',
		data : {'data'		: data,
				'code_order': code_order,
				'flag'		: z},
		dataType : 'json',
		beforeSend: function() {$('#loading').show();},	
		complete: function() {$('#loading').hide();	},
		url : domain+'process_approve/reject',
		success : function(data){
			alert(data.message);
			loadTable('', '', '');
			clearData();
			$("#add-group").removeAttr('disabled');
		}
	});
}


function execDelete(id){
	$.ajax({
		type : 'post',
		data : {'id':id},	
		dataType : 'json',
		url : domain+'process_approve/delete',
		success : function(data){
			$('.dialog_confirm').dialog("close");
			clearData();
			load_table_subbranch('','');
		}
	});
	 
}

function orderColom(order){
	jQuery.ajax({
			url:  domain + "process_approve/load_table",
			dataType: "json",
			type: "POST",
			beforeSend: function() {$('#loading').show();},	
			complete: function() {$('#loading').hide();	},
			data: {
					'order':order
					},
			success : function(data){
				
			}		
	});			
}

function exportXL() {
	var params = "?id_region=" +  $("#id_region").val();
	params += "&id_branch=" +  $("#id_branch").val();
	params += "&id_subbranch=" +  $("#id_subbranch").val();
	params += "&id_salesman=" +  $("#id_salesman").val();
	params += "&txt_src=" +  $("#txt_src").val();
	params += "&start_date=" +  $("#start_date").val();
	params += "&end_date=" +  $("#end_date").val();
	
	var url2 =  domain + "process_approve/prepareExport" +  params;
	window.location.href = url2; 
}

function loadTable(url, filter, order){	
	
	if(url != ''){
		var url = url;
	}else{
		var url=  domain+"process_approve/load_table";
	}
	
	
		var html = '<table class="table table-striped table-bordered" id="group-list">';
		html += '<thead>';
		html += '<tr>';
		html += '<th></th>';
		html += '<th onclick="loadTable(\'\',\'\',\'id_subbranch\');"><center>DISTRIBUTOR CODE</center></th>';
		html += '<th><center>DISTRIBUTOR NAME</center></th>';
		html += '<th><center>TERRITORY CODE</center></th>';
		html += '<th><center>TERRITORY NAME</center></th>';
		html += '<th><center>SALES CODE</center></th>';
		html += '<th><center>SALES NAME</center></th>';
		html += '<th><center>CUST. CODE</center></th>';
		html += '<th><center>CUST. NAME</center></th>';
		html += '<th><center>DATE</center></th>';
		html += '<th><center>TIME</center></th>';
		html += '<th><center>NO ORDER</center></th>';
		html += '<th><center>PROCESS</center></th>';
		html += '</tr>';
		html += '</thead>';
		html += '<tbody id="data-table">';
	
	
	jQuery.ajax({
			url:  url,
			dataType: "json",
			type: "POST",
			beforeSend: function() {$('#loading').show();},	
			complete: function() {$('#loading').hide();	},
			data: {
					id_salesman 	: $("#id_salesman").val(),
					id_region 		: $("#id_region").val(),
					id_branch 		: $("#id_branch").val(),
					id_subbranch 	: $("#id_subbranch").val(),
					start_date 		: $("#start_date").val(),
					order 			: order,
					txt_src 		: $("#txt_src").val(),
					end_date 		: $("#end_date").val()	
				},		
			//beforeSend: progress_jenis_user_list,
			success: function(data) {
			
										jQuery('#table-append-group-list').find('#group-list').remove();
										var result = '';
										var salesman = 1;
										var x="";
										var j=0;
										jQuery('#table-append-group-list-order'+salesman).find('#group-list-order').remove();
											$.each(data.result, function(key, list){
												x += '<div id="table-append-group-list-order'+salesman+'"></div>';
												result += '<tr class="odd gradeX" id="tr_'+salesman+'">';
												result += '<td id="get_data_order'+salesman+'" onclick="get_data_order(\''+salesman+'\',\''+list.code_order+'\',\''+list.code_salesman+'\',\''+list.id_order+'\')"><img id="cpImg_'+list.id_order+'" align="absmiddle" src="'+domain+'assets/img/portlet-collapse-icon.png"></td>';
												result += '<td>'+list.code_subbranch+'</td>';
												result += '<td>'+list.name_subbranch+'</td>';
												result += '<td>'+list.territory_code+'</td>';
												result += '<td>'+list.territory_name+'</td>';
												result += '<td>'+list.code_salesman+'</td>';
												result += '<td>'+list.name_salesman+'</td>';
												result += '<td>'+list.code_customer+'</td>';
												result += '<td>'+list.name_customer+'</td>';
												result += '<td>'+list.tanggal+'</td>';
												result += '<td>'+list.jam+'</td>';
												result += '</td>';
												result += '<td>'+list.code_order+'</td>';
												result += '<td><center><input type="checkbox" class="checkorder" id="ord_' + list.code_order + '"></center></td>';
												result += '</tr>';			
												result += '<tr><td colspan="11" id="aa_'+salesman+'"> </td></tr>';
												get_data_order(salesman, list.code_order, list.code_salesman, list.id_order);
												salesman++;
											});
									
										jQuery('#txt_specific_date').val(data.result.custom_date);
										// console.log(data.pagination);
										$('#paging').html(data.pagination);
										var totalz =0;
										if(typeof data.total[1] === 'undefined') {
											var totalz = data.total[0].total;
										}
										else {
											var totalz = +data.total[0].total + +data.total[1].total;
										}
										
										$('#total').html('Total: '+totalz);
										$('#table-append-group-list').append(html+result+'</tbody></table>'+x);
										$('#grid_order').show();
										//handleTablesGroupList();
									}
		   });	
}

function get_data_order(salesman, code_order, code_salesman, id_order){	
	$.removeCookie("stock");
	$.removeCookie("lastNilai");
	
	//$('#get_data_order'+salesman).prop('disabled',true);
	
	var cekchild = jQuery('#child_'+salesman).children().length;
	if(cekchild >= 4){
		$('#cpImg_'+id_order).attr('src',domain+'assets/img/portlet-expand-icon.png');
		jQuery('#table-append-group-list-order'+salesman).find('#group-list-order').remove();
	}else{
		jQuery('#table-append-group-list-order'+salesman).find('#group-list-order').remove();
		$('#cpImg_'+id_order).attr('src',domain+'assets/img/portlet-collapse-icon.png');
		var url=  domain+"process_approve/get_data_order";
	
		var html = '<table class="table table-striped table-bordered" id="group-list-order">';
			html += '<thead>';
			html += '<tr>';
			html += '<th><center>Code</center></th>';
			html += '<th><center>Description</center></th>';
			html += '<th><center>Price</center></th>';
			html += '<th><center>Carton</center></th>';
			html += '<th><center>Bottle</center></th>';
			html += '<th><center>Qty OnHand</center></th>';
			html += '<th><center>Qty Order</center></th>';
			html += '<th><center>Qty Approved</center></th>';
			html += '<th><center>Pending Approve</center></th>';
			html += '<th><center>Qty To Approved</center></th>';
			html += '<th><center>Approve</center></th>';
			html += '</tr>';
			html += '</thead>';
			html += '<tbody id="data-table">';
	
	
	jQuery.ajax({
			url:  url,
			dataType: "json",
			beforeSend: function() {$('#loading').show();},	
			complete: function() {$('#loading').hide();	},
			type: "POST",
			data: {
					"id_salesman" :  code_order,				
				},		
			//beforeSend: progress_jenis_user_list,
			success: function(data) {
					if(data.result!=""){

						var result = '';
						var war_zero = '';
						//$('#get_data_order'+salesman).prop('disabled',false);a
						
						$.each(data.result, function(key, list){
							result  += '<tr class="odd gradeX" id="child_'+salesman+'">';
							result  += '<td>'+list.code_product+'</td>';
							result  += '<td>'+list.name_product+'</td>';
							result  += '<td>'+numberWithCommas(list.price_2)+'</td>';
							result  += '<td>'+list.order_carton+'</td>';
							result  += '<td>'+list.order_bottle+'</td>';
							
							if ( list.total < 1 ) {
								war_zero = 'style="color: red;font-weight:bold;"';
							} else {
								war_zero = '';
							}	
							
							result  += '<td ' + war_zero + ' >'+list.total+'</td>';
							result  += '<td>'+list.total_qty+'</td>';
							result  += '<td>'+list.qty_approved+'</td>';
							//alert("qty: "+list.total_qty+" aprv: "+list.qty_approved);
							//if(list.total_qty < list.qty_approved) result  += '<td>'+0+'</td>';
							//else result  += '<td>'+(list.total_qty - list.qty_approved)+'</td>';
							result  += '<td>'+(list.total_qty - list.qty_approved)+'</td>';
							result  += '</td>';
							result  += '<td>';
							result  += '	<input type="hidden"  name="qtyOrder_'+list.id_order+'" value="'+list.total_qty+'">';
							result  += '	<input type="hidden"  name="idproduct_'+list.id_order+'" value="'+list.id_product+'">';
							result  += '	<input type="hidden" name="idsubbranch_'+list.id_order+'" value="'+list.id_subbranch+'">';
							result  += '	<input type="hidden" name="idbranch_'+list.id_order+'" value="'+list.id_branch+'">';
							result  += '	<input type="hidden" name="codeSalesman_'+list.id_order+'" value="'+code_salesman+'">';
							result  += '	<input disabled class="ord_' + code_order + '" style="width:30%" type="text" id="toApprove_'+list.id_product+'_'+list.id_subbranch+'"  name="toApprove_'+list.id_order+'"  stock="'+list.total+'"  tot_order="'+list.total_qty+'"   oninput="cekInput(\''+code_order+'\',\''+list.id_product+'\',\''+list.id_subbranch+'\',\''+list.id_branch+'\',\''+list.total+'\',\''+list.total_qty+'\', \''+list.qty_approved+'\', \''+list.id_order+'\')">';
							result  += '</td>';
							result  += '<td><center><input style="display:none" class="ord_' + code_order + '" type="checkbox" name="chk_'+list.id_order+'"   stock="'+list.total+'"  tot_order="'+list.total_qty+'"  id="chk_'+list.id_order+'"></center></td>';
							result  += '</tr>';			
						});
					
						jQuery('#txt_specific_date').val(data.result.custom_date);
						// console.log(data.pagination);
						$('#table-append-group-list-order'+salesman).append(html+result+'</tbody></table>');
						$("#aa_"+salesman).append($('#table-append-group-list-order'+salesman));
						//handleTablesGroupList();
					}
				}		
		   });	
		}
}

function cekInput(code_order, id_product, id_subbranch, id_branch, totalStock, order, approve, id){
	//alert("id prod: "+id_product+"id sub: "+id_subbranch+"id branch: "+id_branch+"code: "+code_order);
	var a = 0;
	var b = 0;
	id_product_x = id_product;
	id_subbranch_x = id_subbranch;
	id_branch_x = id_branch;
	code_order_x = code_order;
	
	$('input[id^="toApprove_'+id_product+'_'+id_subbranch+'"]').each(function() {
		b = $(this).val();
		
		if($(this).val() == '') {
			return false;
		}
		
		if (! /^[0-9]+$/.test(b)) {
			confirm_warning("Just Accept Numeric");
			$("#toApprove_"+id_product+"_"+id_subbranch).val('');
			return false;
		}
		
		if(b == 0) {
			confirm_warning("must be fill is greater than 0");
			$("#toApprove_"+id_product+"_"+id_subbranch).val('');
			return false;
		}
		
		if(b){
		a += parseInt(b);}
	});
	var nilai = $("#toApprove_"+id_product+"_"+id_subbranch).val();
	var ord = parseInt(order);
	var app = parseInt(approve);
	var jml = ord-app;
	//alert('id_product:'+id_product+',id_subbranch:'+id_subbranch+',id_branch:'+id_branch);
	//cek stock
	$.ajax({
		url:  domain+"process_approve/cekStock",
		dataType: "json",
		type: "POST",
		data: {
				"id_product" :  id_product,				
				"id_subbranch" :  id_subbranch,
				"id_branch" :  id_branch
			},		
		
		success: function(data) {
			//console.log('nilai'+nilai+',a'+a+',jml'+jml+',total'+data[0].total);
			//alert('nilai'+nilai+',a'+a+',jml'+jml+',total'+data[0].total);
			if(nilai > jml || a  > data[0].total){
				confirm_warning("Invalid Qty Approve");
				$("#toApprove_"+id_product+"_"+id_subbranch).val('');
				$("#add-group").attr('disabled','disabled');
			}else{
				$("#add-group").removeAttr('disabled');
			}
		}
	});

	
	
	
	return false;
/*
var ni = $('input').val();
console.log(ni);
	var nilai = $("#toApprove_"+id).val();
	var a = parseInt(approve);
	var b = parseInt(order);
	var jml = b-a;

	var sisaStock=0;
	var lastN=0;

	if($.cookie("stock")!=null)
		{ 
			sisaStock = parseInt($.cookie("stock"));
			lastN = $.cookie("lastNilai");
			if(nilai!=""){
				var cekSisaStock = sisaStock - nilai;
			}else{
				sisaStock += parseInt(lastN);
				var cekSisaStock = sisaStock;
			}
			// console.log('dengan coocies='+ sisaStock +'=>'+ lastN);
			// $.removeCookie("stock");
		}else{
			var cekSisaStock = totalStock - nilai;
			// console.log('bukan coocies='+totalStock +'=>'+nilai);
			// $.removeCookie("stock");
		}
		$.cookie("lastNilai", nilai, { expires: 1 });
		$.cookie("stock", cekSisaStock, { expires: 1 });
		sisaStock = $.cookie("stock");
console.log(nilai+'=='+sisaStock);
		if(nilai > jml || sisaStock  < 0){
			alert("Invalid Qty Approve");
			$("#add-group").attr('disabled','disabled');
		}else{
			$("#add-group").removeAttr('disabled');
		}
		
		return false;
		*/
}

function handleTablesGroupList(){
	//Data table
	if (!jQuery().dataTable) {
		return;
	}

	// begin first table
	$('#group-detail').dataTable({
		"aLengthMenu": [
			[10, 25, 50, -1],
			[5, 15, 20, "All"]
		],
		// set the initial value
		"iDisplayLength": 5,
		"sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
		"sPaginationType": "bootstrap",
		"oLanguage": {
			"sLengthMenu": "_MENU_ records per page",
			"oPaginate": {
				"sPrevious": "Prev",
				"sNext": "Next"
			}
		},
		"aoColumnDefs": [{
			'bSortable': false,
			'aTargets': [0]
		}]
	});

	jQuery('#group-detail .group-checkable').change(function () {
		var set = jQuery(this).attr("data-set");
		var checked = jQuery(this).is(":checked");
		jQuery(set).each(function () {
			if (checked) {
				$(this).attr("checked", true);
			} else {
				$(this).attr("checked", false);
			}
		});
		jQuery.uniform.update(set);
	});

	jQuery('#group-detail_wrapper .dataTables_filter input').addClass("m-wrap medium"); // modify table search input
	jQuery('#group-detail_wrapper .dataTables_length select').addClass("m-wrap xsmall"); // modify table per page dropdown
	//End of Data Table	
}