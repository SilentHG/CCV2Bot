const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./internal/config')

class GetBuildProgressCommandHandler {
  triggerPatterns = "getBuildProgress";
  

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

    var base_url = config.CCV2_BASE_URL;
    var subscriptionId = item.subscriptionCode;
    var bearer_token = item.apiToken;

    var build_code = message.text.split(" ")[1];

    // call an api to CCV2 to get the environments
    const axios = require("axios");
    const url = base_url + subscriptionId + "/builds/"+build_code+"/progress";
    console.log(url);
    const response = await axios.get(url, {
      headers: {
        Authorization: "Bearer " + bearer_token,
      },
    });
    console.log(response.data);
    const response_data = response.data;
    let replyMessage = "Build with code " + build_code + " has the following progress: \n\n";
    replyMessage += "errorMessage: " + response_data['errorMessage'] + "\n\n";
    replyMessage += "Percentage: " + response_data['percentage'] + "%\n\n";

    // render your adaptive card for reply message
    const cardData = {
      title: "Build Progress Information",
      body: replyMessage,
    };

    const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}

module.exports = {
  GetBuildProgressCommandHandler,
};

