function toggleMenu() {
	$('#station-menu').toggleClass('hide');
	$('#ship-view').toggleClass('fullscreen');
	$('.hidden-menu').toggleClass('visible');
}

function ChangeObjectGroupTab(group) {	
	var newGroup = group;
	var prevGroup = $('.eve-tab-button.eve-tab-button-active').data("group");
	
	$('.eve-tab-button').removeClass('eve-tab-button-active');
	$(".eve-tab-button[data-group='" + newGroup + "']").addClass('eve-tab-button-active');
	$('.object-item[data-group=' + prevGroup + ']').addClass('hide');
	$('.object-item[data-group=' + newGroup + ']').removeClass('hide');
}

function ChangeObject(typeid) {	
	var newTypeid = typeid;
	var prevTypeid = $('.object-item.active').data("typeid");
	
	$('.object-item[data-typeid=' + prevTypeid + ']').removeClass('active');
	$('.object-item[data-typeid=' + newTypeid + ']').addClass('active');
	
	console.log(ccpwgl_int.resMan.BuildUrl('res:/staticdata/graphicids.json'));	
	getGraphicSOF(newTypeid, generateObject);
	//console.log(graphicSOF);
	//generateObject(graphicSOF);
	
}
