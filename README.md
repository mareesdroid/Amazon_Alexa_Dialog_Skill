# Alexa_Custom_Skill
# Dialog
  - Invocation
    - mars dialog
  - Intents
  1.
    - I am marees
      - which country you want to visit
      - I would love to visit thailand
        - with how many
        - 4
          - You are going with 4 person right?
          - yes
            - Your name is marees. you want to visit thailand with 4 others.
              - save my data (saves in dynamodb countryName,name,personcount)
              - Saved Successfully! goodbye.
   2. previously saved data show
      - show my data
        - Your name is marees. you want to visit thailand with 4 others.
   3.
    - I would like to order 4 pizza
      - You want to buy 4 pizza right?  
        - ** Accept **
          - Yes
          - Your order 4 pizza successfully ordered thank you for using alexa
        - ** deny **
          - no
          - Can you tell me what you want (again start intent (confirm intent))
  4. Device address
      - Where am i
        - tells mylocation
        
  # used methods
    - addDelegateDirective
    - addElicitSlotDirective
    - addConfirmIntentDirective
    - addConfirmSlotDirective
    - reprompt
   ## Dynamodb
      ###### npm
        - npm install --save ask - sdk
        - npm install --save aws -sdk
        - npm . install --save ask -sdk-dynamodb-persistence-adapter
      ###### import package
        - const Alexa = require('ask-sdk');
        - const AlexaCore = require('ask-sdk-core');
        - const AwsSdk = require('aws-sdk');
        - const DynamoDBAdapter = require('ask-sdk-dynamodb-persistence-adapter');
      ###### usage
      
        - in export handler
        
         .withTableName('firstTable')
         .withDynamoDbClient(new AwsSdk.DynamoDB({
             apiVersion: 'latest'
         }))
         .withPartitionKeyGenerator(DynamoDBAdapter.PartitionKeyGenerators.userId)
         
         
        - methods
        
        
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
