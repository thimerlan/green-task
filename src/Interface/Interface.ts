export interface IContact {
  chatId: string;
  name: string;
}

export interface IChatConversation {
  myMessage: string;
  myMessageId: string;
  theirMessage: string;
  theirMessageId: string;
}
