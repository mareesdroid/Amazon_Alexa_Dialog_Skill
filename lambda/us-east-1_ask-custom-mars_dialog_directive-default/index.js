// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk');
const AlexaCore = require('ask-sdk-core');
const AwsSdk = require('aws-sdk');
const DynamoDBAdapter = require('ask-sdk-dynamodb-persistence-adapter');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome, to the dialog test?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const IntroWithAgeHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'IntroWithAge';
    },
    handle(handlerInput) {
        
        const {
			request
		} = handlerInput.requestEnvelope;
		const {
			intent
		} = request;
		if (request.dialogState === 'STARTED') {
			if (intent.slots.Age.value === undefined || intent.slots.Age.value === null)
				intent.slots.Age.value = 24;

			return handlerInput.responseBuilder
				.addDelegateDirective(intent)
				.withShouldEndSession(false)
				.getResponse();
		} else if (request.dialogState !== 'COMPLETED') {
			return handlerInput.responseBuilder
				.addDelegateDirective()
				.withShouldEndSession(false)
				.getResponse();
		} else {
			const name = intent.slots.PersonName.value;
			const age = intent.slots.Age.value;
			const speechText = `Hey ${name}, Your age is ${age}`;

			return handlerInput.responseBuilder
				.speak(speechText)
				.getResponse();
		}
	}
};

const AddUserPreferenceHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddUserPreference';
    },
    handle(handlerInput){
        const { intent } = handlerInput.requestEnvelope.request;
        const personNameSlot = intent.slots.PersonName;
        const countryNameSlot = intent.slots.CountryName;
        const countSlot = intent.slots.Count;

        if(personNameSlot.value === undefined || personNameSlot.value === null){
            return handlerInput.responseBuilder
                .speak('Tell me your name')
                .addElicitSlotDirective(personNameSlot.name)
                .getResponse();
        } else if(countryNameSlot.value === undefined || countryNameSlot.value === null){
            return handlerInput.responseBuilder
                .speak('Which country you want to visit?')
                .addElicitSlotDirective(countryNameSlot.name)
                .getResponse();
        } else if(countSlot.value === undefined || countSlot.value === null){
            return handlerInput.responseBuilder
                .speak('with how many person?')
                .addElicitSlotDirective(countSlot.name)
                .getResponse();
        } else if(countSlot.confirmationStatus === 'NONE'){
            return handlerInput.responseBuilder
                .speak(`You want to visit with ${counSlot.value} right`)
                .addConfirmSlotDirective(countSlot.name)
                .getResponse();
        } else if(countSlot.confirmationStatus === 'DENIED'){
            return handlerInput.responseBuilder
                .speak(`uh! Sorry!! Sorry!! Can you please tell me again with how many friends you want to visit ${countryNameSlot.value}?`)
                .addElicitSlotDirective(countSlot.value)
                .getResponse();
        }
        else{
            const personName = personNameSlot.value;
            const countryName = countryNameSlot.value;
            const count = countSlot.value;

            ////dynamo
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            sessionAttributes.PersonName = personName;
            sessionAttributes.CountryName = countryName;
            sessionAttributes.Count = count;

            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


            return handlerInput.responseBuilder
                .speak(`Your name is ${personName}. you want to visit ${countryName} with ${count} others`)
                .withShouldEndSession(false)
                .getResponse();
        }
    }
};

const SaveUserPreference = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SaveUserPreference'
    },
   handle(handlerInput){
       return new Promise((resolve,reject) => {
           handlerInput.attributesManager.getPersistentAttributes()
            .then((dynamoAttributes) => {
                const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
                dynamoAttributes.PersonName = sessionAttributes.PersonName;
                dynamoAttributes.CountryName = sessionAttributes.CountryName;
                dynamoAttributes.Count = sessionAttributes.Count;
                handlerInput.attributesManager.setPersistentAttributes(dynamoAttributes);
                return handlerInput.attributesManager.savePersistentAttributes(handlerInput, dynamoAttributes);

            })
            .then(()=>{
                resolve(handlerInput.responseBuilder
                    .speak('Saved Successfully! goodbye')
                    .withShouldEndSession(true)
                    .getResponse());
            })
            .catch((error =>{
                reject(error);
            }))
       })
   }
};

const ShowUserPreference = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ShowUserPreference'
    },
   handle(handlerInput){
       return new Promise((resolve,reject) => {
           handlerInput.attributesManager.getPersistentAttributes()
            .then((dynamoAttributes) => {
               const speechText = `Hey ${dynamoAttributes.PersonName} You want to visit ${dynamoAttributes.CountryName} with ${dynamoAttributes.Count} person`;
                resolve(handlerInput.responseBuilder
                    .speak(speechText)
                    .withShouldEndSession(true)
                    .getResponse());
            })
            .catch((error =>{
                reject(error);
            }))
       })
   }
};

const CurrentLocationIntentHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CurrentLocation'
    },
   async handle(handlerInput){
        const { requestEnvelope, serviceClientFactory} = handlerInput;
        const token = requestEnvelope.context.System.user.permissions &&
                requestEnvelope.context.System.user.permissions.consentToken;
                if(!token){
                    return handlerInput.responseBuilder
                    .speak('Please allow address permissions')
                    .withAskForPermissionsConsentCard(['read::alexa:device:all:address'])
                    .getResponse();
                }
                try{
                    const { deviceId } = requestEnvelope.context.System.device;
                    const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
                    const address = await deviceAddressServiceClient.getFullAddress(deviceId);

                    var addressText = 'Not found your address';
                    if(address.addressLine1 !== null && address.stateOrRegion !== null){
                        addressText = `your address is ${address.addressLine1}, ${address.stateOrRegion}, ${address.postalCode}`;
                    }
                    return handlerInput.responseBuilder
                        .speak(addressText)
                        .getResponse();
                }
                catch(error){
                    return handlerInput.responseBuilder
                    .speak('An error occurred to retrive address.')
                    .getResponse();

                }

                }
      

    }


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const FoodOrderIntentHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FoodOrderIntent';
    },
    handle(handlerInput){
        const { intent } = handlerInput.requestEnvelope.request;
        if(intent.confirmationStatus === 'CONFIRMED'){
            const orderItem = intent.slots.OrderItem.value;
            const orderQuantity = intent.slots.OrderQuantity.value;
            const speakOut = `Your order ${orderQuantity} ${orderItem} successfully ordered thank you for using alexa`;
            return handlerInput.responseBuilder
                .speak(speakOut)
                .getResponse();
        } else if(intent.confirmationStatus === 'DENIED'){
            return handlerInput.responseBuilder
                .speak('Can you tell me what you want')
                .reprompt('can you tell me what you want')
                .getResponse();
        } else{
            const orderItem = intent.slots.OrderItem.value;
            const orderQuantity = intent.slots.OrderQuantity.value;
            const speakOut = `You want to buy ${orderQuantity} ${orderItem} right?`;
            return handlerInput.responseBuilder
                .speak(speakOut)
                .addConfirmIntentDirective()
                .getResponse();
        }
        

    }
}
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.standard()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntroWithAgeHandler,
        AddUserPreferenceHandler,
        FoodOrderIntentHandler,
        SaveUserPreference,
        ShowUserPreference,
        
        CurrentLocationIntentHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        ) 
        .addErrorHandlers(
        ErrorHandler,
        )
        
         .withTableName('firstTable')
         .withDynamoDbClient(new AwsSdk.DynamoDB({
             apiVersion: 'latest'
         }))
         .withPartitionKeyGenerator(DynamoDBAdapter.PartitionKeyGenerators.userId)
    // .addRequestInterceptors(function (requestEnvelope){  
    //   //  console.log("\n" + "******************* REQUEST ENVELOPE *******************");
    // //    console.log("\n" + JSON.stringify(requestEnvelope, null, 4));
    // })
    // .addResponseInterceptors(function (requestEnvelope, response) {
    //  //   console.log("\n" + "******************* RESPONSE *******************");
    //   //  console.log("\n" + JSON.stringify(response, null, 4));
    // })
    .lambda();
