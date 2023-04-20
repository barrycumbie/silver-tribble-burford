

mapboxgl.accessToken = 'pk.eyJ1Ijoic2J1cmZvcmQxMTIxIiwiYSI6ImNsZzRqcXRjeDBpN28zZnIzNzFwc3hwOWIifQ.E6KooNfwrwsKBkhWpN9CGQ';
const addAddressButton = document.getElementById("addAddress");
const optimizeRouteButton = document.getElementById("optimizeRoute");



let routeDetails = 
{
start : localStorage.getItem("startAddress"),
end : localStorage.getItem("endAddress"),
addressList : [localStorage.getItem("startAddress"), localStorage.getItem("endAddress")],
currDist : [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
toBeChecked : [true, true],
predecesor : []
};
localStorage.clear();

// console.log(routeDetails.start, routeDetails.end)

addAddressButton.addEventListener("click", (event) => 
{
	const userInput = document.getElementById("address").value;
	const addressTable = document.getElementById("addressTable");
	routeDetails.addressList.push(userInput);
	routeDetails.currDist.push(Number.POSITIVE_INFINITY);
	routeDetails.toBeChecked.push(true);
	const newRow = addressTable.insertRow(-1);
	const addressCell = newRow.insertCell(0);
	addressCell.innerHTML = userInput;
	document.getElementById("address").value = "";
	console.dir(routeDetails);
});

optimizeRouteButton.addEventListener("click", (event) => 
{
	createDistMatrix(routeDetails);
	console.dir(routeDetails);
	//	optimizeRoute(routeDetails);
});

//take route strings into coordinates
//todo: do we need async here? or not 
 async function getCoord(coordObj, place)
{
	const apiURL = `https://nominatim.openstreetmap.org/search?q=${place}&format=geojson`;
	const query = await fetch(apiURL);
	console.log("query: ", query);
	const json = await query.json();
	console.log("query json: ", json);
	console.dir(json.features[0].geometry.coordinates);
	console.dir(json.features[0].geometry.coordinates[0]);
	coordObj.latitude = json.features[0].geometry.coordinates[0];
	coordObj.longitude = json.features[0].geometry.coordinates[1];
	console.dir(coordObj);
	console.dir(coordObj.latitude);
	return coordObj; 
}

// create a function to make a directions request
async function createDistMatrix(routeObject)
{
routeObject.distMatrix = new Array(routeObject.addressList.length);

for(let i = 0; i < routeObject.addressList.length; i++)
{
	console.log("loopin' : ", i)
	let startCoord = 
	{
		latitude :  undefined,
		longitude : undefined
	}
	
	let coordResult = await getCoord(startCoord, routeObject.addressList[i]).then(
		(result) => {

			console.log("result: ", result);
		console.log("get coord: ", startCoord);
		console.log("get coord: ", routeObject.addressList[i]);
		console.log("get coord result:", getCoord(startCoord, routeObject.addressList[i]));
		console.log("Start Coord");
		console.dir(startCoord);
	}

	)
	
	for(let j = 1; j < routeObject.addressList.length; j++)
	{
		let endCoord = 
		{
			latitude : undefined,
			longitude : undefined
		}
		getCoord(endCoord, routeObject.addressList[j]);
		console.log("End Coord");
		console.dir(endCoord.latitude);
		const query = await fetch
		(
			`https://api.mapbox.com/directions/v5/mapbox/driving/${startCoord.latitude},${startCoord.longitude};${endCoord.latitude},${endCoord.longitude}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
			{ method: 'GET' }
		);
		console.log("passing get:", `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoord.latitude},${startCoord.longitude};${endCoord.latitude},${endCoord.longitude}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`);

		const json = await query.json();
		const data = json.routes[0];
		const steps = data.legs[0].steps;
		routeObject.distMatrix[i][j] = Math.floor(data.duration / 60);
		routeObject.distMatrix[j][i] = Math.floor(data.duration / 60);
	}
}
console.log()
}

//function optimizeRoute(routeObject)
//{

//}		