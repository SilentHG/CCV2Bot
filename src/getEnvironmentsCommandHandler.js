const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./internal/config')

class GetEnvironmentsCommandHandler {
  triggerPatterns = "getEnvironments";
  

  async handleCommandReceived(context, message) {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);
    var channelId = context.activity.conversation.id;
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

    let cardData = {};
    try{

      var base_url = config.CCV2_BASE_URL;
      var subscriptionId = item.subscriptionCode;
      var bearer_token = item.apiToken;
      // call an api to CCV2 to get the environments
      const axios = require("axios");
      const url = base_url + subscriptionId + "/environments";
      console.log(url);
      const response = await axios.get(url, {
        headers: {
          Authorization: "Bearer " + bearer_token,
        },
      });
      console.log(response.data);
      const environments = response.data['value'];
      let replyMessage = "";
      for (const environment of environments) {
        replyMessage += " ===================== \n\n Environment: " + environment['name'] + "\n\n Status: " + environment['status'] + " \n\n DeploymentStatus: " + environment['deploymentStatus'] + "\n\n";
      }

      // render your adaptive card for reply message
      cardData = {
        title: "CCV2 Environments Information",
        body: replyMessage,
      };

    } catch (error) {
      console.error(error);
      cardData = {
        title: "Error",
        body: "Failed to get environments information + " + error.message,
      };

    }
    const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}

module.exports = {
  GetEnvironmentsCommandHandler,
};

