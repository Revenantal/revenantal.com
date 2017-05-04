function getData()
{
	console.log(ccpwgl_int.resMan.BuildUrl('res:/staticdata/typeids.json'));	
	console.log(ccpwgl_int.resMan.BuildUrl('res:/staticdata/graphicids.json'));	
	console.log(ccpwgl_int.resMan.BuildUrl('res:/staticdata/categories.json'));	


  /*  $.get('./src/sde/05022016typeIDs.yaml').done(function (data) {
		console.log('File load complete');
		//console.log(jsyaml.load(data));
		var jsonString = JSON.stringify(data);
		//console.log(jsonString);
		//console.log($.parseJSON(jsonString));
		console.log('File complete');
    });*/
	
	var marketIds = [];
	
	
	
	$.when(
	$.getJSON(ccpwgl_int.resMan.BuildUrl('res:/staticdata/typeids.json')),
	$.getJSON(ccpwgl_int.resMan.BuildUrl('res:/staticdata/graphicids.json')),
	$.getJSON(ccpwgl_int.resMan.BuildUrl('res:/staticdata/categories.json'))).done(function (v1, v2, v3)
	{
		var typeids = v1[0];
		var graphicids = v2[0];
		var categories = v3[0];

		/*$.each(categories, function (id, categories)
		{
			console.log(categories.name + ":" + id || 'N/A');	
		});
		*/
		
		
		/* POPULATE CATEGORIES */
		
		var categoriesIndex = {};
		
		// Generate a list of Categories and associate it with the id so I can reference "Ship" instead of "6".
		$.each(categories, function( id, value ) {	
			categoriesIndex[value.name] = id;
			//$.each(categories[id].groups, function( catID, value2 ) {
			//	//console.log( "--------------" + catID + ": " + value2 );
			//	
			//});
		});			
		
		//<button class="eve-button eve-tab-button eve-tab-button-active">Tab 1</button>

		/* POPULATE OBJECT LIST */
	
		$.each(typeids, function (id, typeids)
		{
			
			if (categories[categoriesIndex.Ship].groups[typeids.group]){
				//console.log(typeids);
				
				
				var objectInformation = $.getJSON( "https://www.fuzzwork.co.uk/api/sofapi.php?endpoint=BASICDATA&typeid=" + id, function() {
					if (objectInformation.categoryID=6){
						// USING LOCAL IMAGES
						$( "#object-list" ).append( "<div class='object-item' data-graphicID=" + typeids.graphicID + " data-ID=" + id + " data-marketGroup=" + typeids.group + "><img src='img/renders/" + id + "_64.png'><p>" +typeids.name + "</p></div>" );
						// EVE SERVER IMAGES
						//$( "#object-list" ).append( "<div class='object-item' data-graphicID=" + typeids.graphicID + " data-ID=" + id + " data-marketGroup=" + typeids.group + "><img src='https://image.eveonline.com/Type/" + id + "_64.png'><p>" +typeids.name + "</p></div>" );
					}
				})
				.fail(function() {
					console.log( "error" );
				});
			

				//console.log(typeids);
	
 
				
				
				// "Caldari" for now, but this could be filitered by the user... the classes would also let me cross reference the Graphic JSON to hide each race.
				//if (graphicids[typeids.graphicID].race != "caldari"){
				//	 $('div[data-graphicID="' + typeids.graphicID + '"]').addClass('hide');
				//}
			}
		});
		
		console.log("done");
		
		
		/* POPULATE TABS */
		/*
		console.log(graphicids);
		
		$.each(graphicids[typeids.graphicID], function (id, data){
			console.log(id + ":" + data);
		});
*/

		//console.log(marketIds);

		// Controlling the selected object
		$('.object-item').click(function() {
			$('.object-item').removeClass('active');
			$(this).toggleClass('active');
		});
	});
}



onload = getData();
