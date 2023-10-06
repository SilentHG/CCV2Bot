const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./internal/config')

class SetupApiTokenCommandHandler {
  triggerPatterns = "setupApiToken";
  

  async handleCommandReceived(context, message) {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);

    // get mention from the message and update in cosmos db
    var channelId = context.activity.conversation.id;
    var adminId = context.activity.from.id;
    // get record from cosmos db by id as channelId
    const endpoint = config.COSMOS_ENDPOINT;
    const key = config.COSMOS_KEY;
    const databaseId = config.COSMOS_DATABASE;
    const containerId = config.COSMOS_CONTAINER;
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const { resource: item } = await container.item(channelId, channelId).read();
    var itemAdminId = item.adminId;
    if (itemAdminId != adminId) {
      var message = "You are not the admin of this bot. \n\n";
      message += "Only admin can run this commad \n\n";
      await context.sendActivity(MessageFactory.text(message));
      return;
    }

    var apiToken = message.text.split(" ")[1];
    var subscriptionCode = message.text.split(" ")[2];
    // update record in cosmos db
    item.apiToken = apiToken;
    item.subscriptionCode = subscriptionCode;
    const { resource: updatedItem } = await container.item(channelId, channelId).replace(item);

    
    let replyMessage = "You can now create builds and deployments.";

    // render your adaptive card for reply message
    const cardData = {
      title: "Api Token has been updated successfully",
      body: replyMessage,
    };

    const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}

module.exports = {
  SetupApiTokenCommandHandler,
};

