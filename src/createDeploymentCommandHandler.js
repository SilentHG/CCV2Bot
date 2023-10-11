const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./internal/config')

class CreateDeploymentCommandHandler {
  triggerPatterns = "createDeployment";
  

  async handleCommandReceived(context, message) {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);

    var channelId = context.activity.conversation.id;
    var senderId = context.activity.from.id;
    const endpoint = config.COSMOS_ENDPOINT;
    const key = config.COSMOS_KEY;
    const databaseId = config.COSMOS_DATABASE;
    const containerId = config.COSMOS_CONTAINER;
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const { resource: item } = await container.item(channelId, channelId).read();

    // check if item is null
    if (item.apiToken == null || item.subscriptionCode == null) {
      var message = "You need to setup the api token first. \n\n";
      message += "Please run the command: setupApiToken (apiToken) (subscriptionCode) \n\n";
      await context.sendActivity(MessageFactory.text(message));
      return;
    }

    var base_url = config.CCV2_BASE_URL;
    var subscriptionId = item.subscriptionCode;
    var bearer_token = item.apiToken;

    var build_code = message.text.split(" ")[1];
    var databaseUpdateMode = message.text.split(" ")[2].toUpperCase();
    var environmentCode = message.text.split(" ")[3];
    var strategy = message.text.split(" ")[4].toUpperCase();

    var build_code = context.activity.text.split(" ")[1];
    var databaseUpdateMode = context.activity.text.split(" ")[2].toUpperCase();
    var environmentCode = context.activity.text.split(" ")[3];
    var strategy = context.activity.text.split(" ")[4].toUpperCase();

    if (databaseUpdateMode == "INITIALIZE") {
      // not allowed to INITIALIZE
      var message = "You are not allowed to INITIALIZE. \n\n";
      await context.sendActivity(MessageFactory.text(message));
      return;
    }

    // check if the sender is admin or in createAccessUsers list
    if (item.adminId != senderId && item.createAccessUsers.indexOf(senderId) == -1) {
      var message = "You don't have access to create a deployment. \n\n";
      await context.sendActivity(MessageFactory.text(message));
      return;
    }

    // call an api to CCV2 to get the environments
    const axios = require("axios");
    const url = base_url + subscriptionId + "/deployments";
    console.log(url);
    const response = await axios.post(url, {
      "buildCode": build_code,
      "databaseUpdateMode": databaseUpdateMode,
      "environmentCode" : environmentCode,
      "strategy" : strategy
    }, 
    {
      headers: {
        Authorization: "Bearer " + bearer_token,
      }
    });
    console.log(response.data);
    const deployment_code = response.data['code'];
    let replyMessage = "Deployment with build code " + build_code + "\n\n Database Update Mode " + databaseUpdateMode + "\n\n Environment Code " + environmentCode + "\n\n Strategy " + strategy + "\n\n has been created with code " + deployment_code;

    // render your adaptive card for reply message
    const cardData = {
      title: "Deployment is now created",
      body: replyMessage,
    };

    const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}

module.exports = {
  CreateDeploymentCommandHandler,
};

