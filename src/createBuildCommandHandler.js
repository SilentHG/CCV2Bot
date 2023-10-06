const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./internal/config')

class CreateBuildCommandHandler {
  triggerPatterns = "createBuild";
  

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

    var name = message.text.split(" ")[1];
    var branch = message.text.split(" ")[2];

    // check if the sender is admin or in createAccessUsers list
    if (item.adminId != senderId && item.createAccessUsers.indexOf(senderId) == -1) {
      var message = "You don't have access to create a build. \n\n";
      await context.sendActivity(MessageFactory.text(message));
      return;
    }

    // call an api to CCV2 to get the environments
    const axios = require("axios");
    const url = base_url + subscriptionId + "/builds";
    console.log(url);
    const response = await axios.post(url, {
      name: name,
      branch: branch
    },
     {
      headers: {
        Authorization: "Bearer " + bearer_token,
      }
    });
    console.log(response.data);
    const build_code = response.data['code'];
    let replyMessage = "Build with name " + name + " and Branch " + branch + "\n\n has been created with code " + build_code;

    // render your adaptive card for reply message
    const cardData = {
      title: "Build is now created",
      body: replyMessage,
    };

    const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}

module.exports = {
  CreateBuildCommandHandler,
};

