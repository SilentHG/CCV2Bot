const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./internal/config')

class GetBotAdminCommandHandler {
  triggerPatterns = "getBotAdmin";
  

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
    var adminId = item.adminId;
    var adminName = item.adminName;

    const mention = {
      mentioned: {
        id: adminId,
        name: adminName,
      },
      text: `<at>${ new TextEncoder().encode(adminName)}</at>`,
      type: "mention",
    };

    // send reply message
    var message = `Bot admin is: ${mention.text} \n\n`;

    const replyActivity = MessageFactory.text(message);
    replyActivity.entities = [mention];
    await context.sendActivity(replyActivity);
  }
}

module.exports = {
  GetBotAdminCommandHandler,
};

