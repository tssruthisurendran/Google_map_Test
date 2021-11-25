/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/render', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url'],
    /**
 * @param{file} file
 * @param{render} render
 * @param{runtime} runtime
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (file, render, runtime, search, serverWidget, url) => {
        /***
         * function to get the customer details
         *
         */
        const getCustomerDataArray=(salesRep,location,savedSearch, category) => {
            try{

                var filterArray =[],customerDataArray= [];
                if(salesRep && salesRep!=0){
                    filterArray.push( ["salesrep","anyof",salesRep]);
                }
                if(location){
                    if(filterArray.length>0){
                        filterArray.push("AND");
                    }
                    filterArray.push(["location","anyof",location]);
                }
                if(category){
                    if(filterArray.length>0){
                        filterArray.push("AND");
                    }
                    filterArray.push( ["category","anyof",category]);
                }
                //if saved search then load the search
                //search
                var customerSearchObj = search.create({
                    type: "customer",
                    filters:
                    filterArray,
                    columns:
                          [
                              search.createColumn({name: "internalid", label: "Internal ID"}),
                              search.createColumn({name: "altname", label: "Name"}),
                              search.createColumn({name: "custentitycustentity_ns_lat", label: "Latitude"}),
                              search.createColumn({name: "custentitycustentity_ns_long", label: "Longitude"})
                          ]
                });
                var searchResultCount = customerSearchObj.runPaged().count;
                log.debug("customerSearchObj result count",searchResultCount);
                customerSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    var customerObj={}, customerArray=[];

                    customerObj.internalId =  result.getValue({
                        name: "internalid", label: "Internal ID"
                    });

                    customerObj.name = result.getValue({
                        name: "altname", label: "Name"
                    });

                    customerObj.lat = result.getValue({
                        name: "custentitycustentity_ns_lat", label: "Latitude"
                    });

                    customerObj.lng =  result.getValue({
                        name: "custentitycustentity_ns_long", label: "Longitude"
                    });


                    customerArray.push({"lat": Number(customerObj.lat),"lng":Number(customerObj.lng), "internalID":customerObj.internalId});
                    customerArray.push(customerObj.name);
                    customerDataArray.push(customerArray);
                    return true;
                });

                log.debug("customerDataArray",customerDataArray)

                return customerDataArray;


            }catch (e) {
                log.debug("Err@getCustomer data",e);
                log.error("Err@getCustomer data",e);


            }

        }


        /***
         *Function to get the map details
         */
        const getMapData = (customerData) => {
            try{
                log.debug("customerData =>1 =>",customerData)
                var html =  `<!DOCTYPE html>
                <html>
                <head>
                    <title>Map</title>
                    <style>
                #mapForCustomers {
                  height: 80%;
                }
                
               
                html,
                body {
                  height: 100%;
                  margin: 0;
                  padding: 0;
                  margin-top: 10%;
                  
                }
                
                </style>
                    <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>
                    
                    
                
                </head>
                <body>
                <script>
                  let rectangle;
                
                  var infoWindow2;
                
                  function initMap() {
                  
                    console.log("inn")
                   
                   var tourStops = ${JSON.stringify(customerData)}
                   
                     console.log("tourStops==>",tourStops)
                    const map = new google.maps.Map(document.getElementById("mapForCustomers"), {
                      zoom: 8,
                      controlSize: 32,
                      center: { lat: Number(tourStops[0][0]['lat']), lng: Number(tourStops[0][0]['lng']) },
                      
                    });
                // Create an info window to share between markers.
                    const infoWindow = new google.maps.InfoWindow();
                    console.log("inn2")
                // Create the markers.
                    tourStops.forEach(([position, title], i) => {
                      const marker = new google.maps.Marker({
                            position,
                            map,
                            title: (i+1) + ". "+ title,  
                            label: (i+1).toString(),
                            optimized: false,
                      });
                      console.log("inn3")
                // Add a click listener for each marker, and set up the info window.
                      marker.addListener("click", () => {
                \tinfoWindow.close();
                \tinfoWindow.setContent(marker.getTitle());
                \tinfoWindow.open(marker.getMap(), marker);
                      });
                    });
                    console.log("inn4")
                  }
                 
                
                
                </script>
                <div id="mapForCustomers"></div>
                
                <!-- Async script executes immediately and must be after any DOM elements used in callback. -->
                
                <script
                        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCG3hhpxx1unYEifoqrZ4rBASgeyG91eas&callback=initMap"
                        async
                ></script>
                <script>
                  setTimeout(function (){document.getElementById("mapForCustomers").style="";   
		    }, 2000);
                </script>
                
                </body>
                </html>`;


                // replace
                //html = html.replace(' /**INSERT_TOUR_STOPS*/', customerData);
                return html;


            }catch (e) {
                log.error("Err@getMapDtata",e)
                log.debug("Err@getMapDtata",e)

            }

        }
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try{

                let uiFormResponse = serverWidget.createForm({
                    title: "Map Customers"
                });

                //get sales rep
                var salesRep =  scriptContext.request.parameters.salesRep;

                //get location

                var location =  scriptContext.request.parameters.location;

                //get saved search
                var savedSearch =  scriptContext.request.parameters.savedSearch;

                //get category
                var category =  scriptContext.request.parameters.cusomerCategory;

                log.debug("salesRep",salesRep)
                log.debug("location",location)
                log.debug("savedSearch",savedSearch)
                log.debug("category",category)


                //get the customer name & lat, long, id

                var customerData = getCustomerDataArray(salesRep,location,savedSearch, category);

                //get the static map details
                var mapData = getMapData(customerData);
                let test = uiFormResponse.addField({
                    type:serverWidget.FieldType.TEXT,
                    label:"Test",
                    id:"test_id"
                })
              /*  var usergroup = uiFormResponse.addFieldGroup({
                    id : 'usergroup',
                    label : 'User Information'
                });
                usergroup.isSingleColumn = true;
                    // Inline HTML to include image in
                    let showMessage = uiFormResponse.addField({
                        type:serverWidget.FieldType.INLINEHTML,
                        label:"Message",
                        id:"response_message",
                        container: 'usergroup'
                    })*/
                var tab1 = uiFormResponse.addTab({
                    id : 'tab1id',
                    label : 'Payment'
                });
                uiFormResponse.addSubtab({
                    id : 'subtab1id',
                    label : 'Payment Information',
                    tab: 'tab1id'
                });
                let showMessage = uiFormResponse.addField({
                    type:serverWidget.FieldType.INLINEHTML,
                    label:"Message",
                    id:"response_message",
                    container: 'tab1id'
                })
                    showMessage.defaultValue = mapData;

             /*   let test2 = uiFormResponse.addField({
                    type:serverWidget.FieldType.TEXT,
                    label:"Test 2",
                    id:"test_id2",
                    container: 'subtab1id'
                })*/
                    //add button
                //craete task btn
                uiFormResponse.addSubmitButton({
                    label: 'Create Task'
                });

                    scriptContext.response.writePage(uiFormResponse)


            }catch (e) {
                log.debug("Err",e)
            }

        }

        return {onRequest}

    });
