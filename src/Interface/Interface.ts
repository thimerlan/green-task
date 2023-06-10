export interface IChatConversation {
  myMessage: string;
  myMessageId: string;
  theirMessage: string;
  theirMessageId: string;
  myFile: File | null;
  theirFile: {
    caption: string;
    downloadUrl: string;
    fileName: string;
    forwardingScore: number;
    isForwarded: boolean;
    jpegThumbnail: string;
    mimeType: string;
  } | null;
  time: string;
}
export interface IContact {
  chatId: string;
  name: string;
  chatConversation?: IChatConversation[];
}
