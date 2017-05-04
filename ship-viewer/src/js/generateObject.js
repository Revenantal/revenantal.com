function generateObject(sofString)
{
	var canvas = document.getElementById('shipViewer');
	ccpwgl.initialize(canvas);
	var scene = ccpwgl.loadScene('res:/dx9/scene/universe/a01_cube.red');
	//var scene = quat4.create([0.25, 0.25, 0.25, 1]);

	var camera = new TestCamera(canvas);
	camera.minDistance = 10;
	camera.maxDistance = 100000;
	camera.fov = 30;
	camera.distance = 5000;
	camera.nearPlane = 1;
	camera.farPlane = 10000000;
	camera.minPitch = -0.5;
	camera.maxPitch = 0.65;

	ccpwgl.setCamera(camera);

	var ship = scene.loadShip(sofString, '');

	ccpwgl.enablePostprocessing(true);

}
var getLoad = (function()
{
    var totalLoad = ccpwgl.getPendingLoads();
    var pendingLoads = totalLoad;

    return function()
    {
        pendingLoads = ccpwgl.getPendingLoads();

        if (pendingLoads == 0)
        {
             totalLoad = 0;
             return 100;
        }

        if (pendingLoads > totalLoad) totalLoad = pendingLoads;
        return Math.round((1 - (pendingLoads  / totalLoad)) * 100);   
    }

})()

// Called per frame by ccpwgl
ccpwgl.onPostRender = function(dt)
{
    var load = getLoad();
    if (load !== 100) {
		$('#ship-Loading-Status').show()
		$('#load-percent').text(load + "%");
	}
	if (load == 100) {
		$('#ship-Loading-Status').hide()
	}

}

function getGraphicSOF(ID, callbackFunction){

	var typeID = ID;	
	var graphicSOF = "";
	
	$.when(
	$.getJSON(ccpwgl_int.resMan.BuildUrl('res:/staticdata/typeids.json')),
	$.getJSON(ccpwgl_int.resMan.BuildUrl('res:/staticdata/graphicids.json')))
	.done(function (v1, v2, v3) {
		
		var typeids = v1[0];		
		var graphicids = v2[0];
		
		console.log(graphicids[typeids[typeID].graphicID].graphicFile);
		graphicSOF = graphicids[typeids[typeID].graphicID].graphicFile;
		callbackFunction (graphicSOF);
	})
	.fail(function(d, textStatus, error) {
		alert("Whao!\nSomething seems to of blown up while loading the ship... try selecting another ship.\n If this happens again shoot me an email at admin@revenantal.com");
		console.error("getJSON failed, status: " + textStatus + ", error: "+error);
	});
	
	
}