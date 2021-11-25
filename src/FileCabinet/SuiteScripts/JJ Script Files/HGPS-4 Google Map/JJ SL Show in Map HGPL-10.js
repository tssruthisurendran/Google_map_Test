/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/runtime', 'N/search', 'N/url', 'N/ui/serverWidget','N/file','N/render'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{url} url
 */
    (record, runtime, search, url,serverWidget,file,render) => {

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
                    var customerObj={};

                    customerObj.internalId =  result.getValue({
                        name: "internalid", label: "Internal ID"
                    });

                    customerObj.name = result.getValue({
                        name: "altname", label: "Name"
                    });

                    customerObj.latitude = result.getValue({
                        name: "custentitycustentity_ns_lat", label: "Latitude"
                    });

                    customerObj.longitude =  result.getValue({
                        name: "custentitycustentity_ns_long", label: "Longitude"
                    });

                    customerDataArray.push(customerObj);
                    return true;
                });

                log.debug("customerDataArray",customerDataArray)

                return customerDataArray;


            }catch (e) {
                log.debug("Err@getCustomer data",e);
                log.error("Err@getCustomer data",e);


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
                var instform = file.load({ id: '4514' });
                var html = instform.getContents();

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

                /**INSERT_DATA_IN_MAP**/

                var renderObj = render.create();
                //render create and add content
                renderObj.templateContent = html
                //Adding ThirdParty Libraries
              /*  renderObj.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: "libraryPath",
                    data: libraryPath.all()
                });*/

                //
                var finalRender = renderObj.renderAsString();

                log.debug('finalRender', finalRender)
                scriptContext.response.write({
                    output: finalRender
                });


            }catch (e) {
                log.debug("Err@onRequest",e)
                log.error("Err@onRequest",e)

            }

        }

        return {onRequest}

    });
