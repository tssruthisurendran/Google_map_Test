/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/**
 * HGPL-10 Create suitelet for filtering customers
 * 
 * Revision History
 * 
 * 1.0      JJ0016      Created the suitelet  15 Nov 2021       SB
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (record, runtime, search, serverWidget, url) => {
        var CLIENT_SCRIPT_FILE_ID = 4512;

        /**
         *
         */
        const getCustomerCategoryData=() => {
            try{


                var customerCategoryDataArray=[];
                var customerCategorySearchObj = search.create({
                    type: "customercategory",
                    filters:
                        [
                            ["isinactive","is","F"]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC,
                                label: "Name"
                            })
                        ]
                });
                var searchResultCount = customerCategorySearchObj.runPaged().count;
                log.debug("customerCategorySearchObj result count",searchResultCount);
                customerCategorySearchObj.run().each(function(result){
                    var categoryObj ={}
                    // .run().each has a limit of 4,000 results
                    categoryObj.id =  result.getValue({
                        name: "internalid", label: "Internal ID"
                    })
                    categoryObj.name = result.getValue({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                    customerCategoryDataArray.push(categoryObj)
                    return true;
                });
                log.debug("customerCategoryDataArray",customerCategoryDataArray)
                return customerCategoryDataArray;

            }catch (e) {
                log.debug("Error @getCustomerCategoryData",e)
                log.error("Error @getCustomerCategoryData",e)

            }
        }

        /***
         *
         */
        const getSavedSearches =() =>{
            try{
                var searchArray =[];
                var savedSearches = search.create({
                    type: search.Type.SAVED_SEARCH,
                    filters: [
                        ['recordtype','is','Customer']
                    ],
                    columns: [
                        search.createColumn({
                            name: 'id'
                        }),
                        search.createColumn({
                            name: 'title'
                        }),
                        search.createColumn({
                            name: 'recordtype'
                        })
                    ]
                });

                var searchResultCount = savedSearches.runPaged().count;
                log.debug("SEARCH result count",searchResultCount);


                savedSearches.run().each(function(result){
                    var savedSearchesObj ={}
                    // .run().each has a limit of 4,000 results
                    savedSearchesObj.id =  result.getValue({
                        name: "id", label: "id"
                    })
                    savedSearchesObj.name = result.getValue({
                        name: "title",

                    })
                    searchArray.push(savedSearchesObj)
                    return true;
                });
                log.debug("searchArray",searchArray)
                return searchArray;

            }catch (e) {
                log.debug("err@getSavedSearches")

            }
        }

        /***
         * Function to get all sales rep
         *
         * @returns {*[]}
         */
        const getSalesRep = () => {
            try{
                var salesRepDataArray=[];
                var employeeSearchObj = search.create({
                    type: "employee",
                    filters:
                        [
                            ["salesrep","is","T"],
                            "AND",
                            ["isinactive","is","F"]
                        ],
                    columns:
                        [
                            search.createColumn({name: "internalid", label: "Internal ID"}),
                            search.createColumn({
                                name: "entityid",
                                sort: search.Sort.ASC,
                                label: "Name"
                            })
                        ]
                });
                var searchResultCount = employeeSearchObj.runPaged().count;
                log.debug("employeeSearchObj result count",searchResultCount);
                employeeSearchObj.run().each(function(result){
                    var salesRepData ={}
                    // .run().each has a limit of 4,000 results
                    salesRepData.id =  result.getValue({
                        name: "internalid", label: "Internal ID"
                    })
                    salesRepData.name = result.getValue({
                        name: "entityid",
                        sort: search.Sort.ASC,
                        label: "Name"
                    })
                    salesRepDataArray.push(salesRepData)
                    return true;
                });
                return salesRepDataArray;

            }catch (e) {
                log.debug("Err@getSales Rep",e)
                log.error("Err@getSales Rep",e)

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

                var request = scriptContext.request;
                var response = scriptContext.response;
                var method = request.method;
                //create a suitelet page
                if (method == 'GET') {

                        var form;
                        form = serverWidget.createForm({
                            title : 'Filter out customers'
                        });
                       form.clientScriptFileId = CLIENT_SCRIPT_FILE_ID;
                        form.addSubmitButton({
                            label : 'Show In Map'
                        });


                        //sales rep
                        var salesRep = form.addField({
                            id: 'salesrepfield',
                            type: serverWidget.FieldType.SELECT,
                            label: 'Select Sales Rep',

                        });
                        var salesRepsData = getSalesRep();
                        log.debug("salesRepsData",salesRepsData)
                        salesRep.addSelectOption({
                            value: 0,
                            text: ''
                        });
                        for(var key=0;key< salesRepsData.length;key++){
                            salesRep.addSelectOption({
                                value: salesRepsData[key]['id'],
                                text: salesRepsData[key]['name']
                            });
                        }

                        //location
                        var location = form.addField({
                            id: 'locationfield',
                            type: serverWidget.FieldType.SELECT,
                            label: 'Select Location',
                            source: 'location'
                        });

                        // Customer Category
                        let customercategory = form.addField({
                            id: 'customercategory',
                            type: serverWidget.FieldType.SELECT,
                            label: 'Customer Category'
                        });
                        var customerCategoryData =  getCustomerCategoryData();

                        customercategory.addSelectOption({
                            value: 0,
                            text: ''
                        });
                        for(var key=0;key< customerCategoryData.length;key++){
                            customercategory.addSelectOption({
                                value: customerCategoryData[key]['id'],
                                text: customerCategoryData[key]['name']
                            });
                        }

                        //saved search

                    let searchField = form.addField({
                        id: 'searchfield',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Select a Saved Search'
                    });
                    var searchListData =   getSavedSearches();

                    searchField.addSelectOption({
                        value: 0,
                        text: ''
                    });
                    for(var key=0;key< searchListData.length;key++){
                        searchField.addSelectOption({
                            value: searchListData[key]['id'],
                            text: searchListData[key]['name']
                        });
                    }

                    scriptContext.response.writePage(form);
                }
                }catch (e) {
                log.debug("Error@ onRequest",e)
                log.error("Error@ onRequest",e)
                
            }

        }

        return {onRequest}

    });
