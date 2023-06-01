export interface IChatConversation {
  myMessage: string;
  myMessageId: string;
  theirMessage: string;
  theirMessageId: string;
  status?: string;
}
export interface IContact {
  chatId: string;
  name: string;
  chatConversation?: IChatConversation[];
}
