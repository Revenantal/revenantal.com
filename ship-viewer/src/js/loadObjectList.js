function buildObjectList()
{
	$.when($.getJSON("./src/sde/EveShips-05032016.json"))
	.done(function (json) {
			
		var objectList = json;
		var objectGroups = [];
		
		// Generate list of all the objects & object group
		$.each(objectList, function( typeID, value ) {
			if (objectGroups.indexOf(value.raceName) == -1){
				objectGroups.push(value.raceName);
			}
			$( "#object-list" ).append( "<div class='object-item' onclick='ChangeObject(\"" + typeID + "\")'data-group=" + value.raceName + " data-typeID=" + typeID + "><img src='img/renders/" + typeID + "_64.png'><p>" + value.typeName + "</p></div>" );	
		});	
		
		
		// create object group tabs
		objectGroups.sort();
		
		var i = 0;
		for (;objectGroups[i];) {
			$( "#object-tab-group" ).append("<button onclick='ChangeObjectGroupTab(\"" + objectGroups[i] + "\")' class='eve-button eve-tab-button' data-group=" + objectGroups[i] + ">" + objectGroups[i] + "</button>");
			i++;
		}
		
		// hide groups and select the tab
		var isFirstObject = true;
		$(".eve-tab-button").each(function(index, element) {
			// if first group, select tab and show objects
			if ($(this).data("group") == objectGroups[0]) {
				$(this).addClass('eve-tab-button-active')
				$(".object-item[data-group='" + $(this).data("group") + "']").each(function(index, element) {
					if (isFirstObject){
						$(this).addClass('active');
						isFirstObject = false;
						getGraphicSOF($(element).data("typeid"), generateObject);
					}
					$(this).removeClass('hide');
				});
			//else hide objects
			}else{
				$(".object-item[data-group='" + $(this).data("group") + "']").each(function(index, element) {
					$(this).addClass('hide');
				});
			}
		});	
	})
	.fail(function(d, textStatus, error) {
		alert("Whao!\nSomething seems to of blown up while loading... mind giving it a refresh?\n If this happens again shoot me an email at admin@revenantal.com");
		console.error("getJSON failed, status: " + textStatus + ", error: "+error);
	});
}	