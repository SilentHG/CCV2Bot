const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory, TeamsInfo } = require("botbuilder");
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./internal/config')

class UpdateBotAdminCommandHandler {
  triggerPatterns = "updateBotAdmin";
  

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
    var mentionMessage = context.activity.entities[1];
    var mentionId = mentionMessage.mentioned.id;
    var newAdmin = await TeamsInfo.getMember(context, mentionId);

    // update record in cosmos db
    item.adminId = newAdmin.id;
    item.adminName = newAdmin.name;
    const { resource: updatedItem } = await container.item(channelId, channelId).replace(item);

    const mention = {
      mentioned: {
        id: newAdmin.id,
        name: newAdmin.name,
      },
      text: `<at>${ new TextEncoder().encode(newAdmin.name)}</at>`,
      type: "mention",
    };

    // send reply message
    var message = "Bot admin has been updated successfully. \n\n";
    message += `${mention.text} you are the admin of this bot. \n\n`;

    const replyActivity = MessageFactory.text(message);
    replyActivity.entities = [mention];
    await context.sendActivity(replyActivity);
  }
}

module.exports = {
  UpdateBotAdminCommandHandler,
};

