/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/**
 * Simple form with Name field - Say hello
 */
define(['N/ui/serverWidget'],
    /**
     * @param{serverWidget} serverWidget
     */
    (serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            if(scriptContext.request.method == "GET") {
                // Loading the page when UI is loaded.
                // Create a form Object
                let uiForm = serverWidget.createForm({
                    title: "Hello dear,<br/> Let me know your good name"
                })
                // Adds the name field in the form
                uiForm.addField({ id: "name", label: "Name", type: serverWidget.FieldType.TEXT });
                // Added the Submit button for the Form
                uiForm.addSubmitButton("Say me hi")
                scriptContext.response.writePage(uiForm)
            }
            else
            {
                // POST - When the submit button is clicked this snippet will portion will execute
                // Title with Name
                let uiFormResponse = serverWidget.createForm({
                    title: "Welcome to Suite Developer life - <i>"+scriptContext.request.parameters.name +"</i>"
                })

                // Inline HTML to include image in
                let showMessage = uiFormResponse.addField({
                    type:serverWidget.FieldType.INLINEHTML,
                    label:"Message",
                    id:"response_message"
                })
                showMessage.defaultValue = '<img src="https://static3.depositphotos.com/1002188/144/i/600/depositphotos_1448005-stock-photo-smile.jpg"/>'
                scriptContext.response.writePage(uiFormResponse)
            }

        }

        return {onRequest}

    });