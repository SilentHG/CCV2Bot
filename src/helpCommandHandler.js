const helpCard = require("./adaptiveCards/helpCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./internal/config')

class HelpCommandHandler {
  triggerPatterns = "help";

  async handleCommandReceived(context, message) {

    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);

    var body = "Following commands are available: \n\n \n\n";
    body += "1. createBuild <name> <branch> Example: createBuild D1 develop \n\n \n\n";
    body += "2. getBuildProgress <build_code> Example: getBuildProgress 1234 \n\n \n\n";
    body += "3. getEnvironments \n\n \n\n";
    body += "4. getDeploymentProgress <deployment_code> Example: getDeploymentProgress 1234 \n\n \n\n";
    body += "5. createDeployment <build_code> <databaseUpdateMode> <environmentCode> <strategy> Example: createDeployment 1234 NONE|UPDATE d1 ROLLING_UPDATE|RECREATE|GREEN \n\n \n\n";
    body += "6. help \n\n \n\n";
    body += "Note: \n\n"
    body += "databaseUpdateMode can be NONE or UPDATE \n\n \n\n";
    body += "strategy can be ROLLING_UPDATE or RECREATE or GREEN. \n\n \n\n";
    

    // do something to process your command and return message activity as the response

    // render your adaptive card for reply message
    const cardData = {
      title: "Help Section",
      body: body,

    };

    const cardJson = AdaptiveCards.declare(helpCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}

module.exports = {
  HelpCommandHandler,
};
