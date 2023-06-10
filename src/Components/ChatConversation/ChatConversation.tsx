import { IChatConversation, IContact } from "../../Interface/Interface";
import "./ChatConversation.scss";
import { useRef, useEffect, useState } from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";
interface ChatConversationProps {
  selectedContact: IContact | undefined;
  contacts: IContact[];
}

const ChatConversation = ({
  selectedContact,
  contacts,
}: ChatConversationProps) => {
  const conversationRef = useRef<HTMLDivElement>(null);
  const [chatConversation, setChatConversation] = useState<
    IChatConversation[] | undefined
  >();
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
    setChatConversation([]);
  }, [selectedContact]);

  useEffect(() => {
    const selectedContactChatConversation = contacts.filter((contact) => {
      return contact.chatId === selectedContact?.chatId;
    })[0]?.chatConversation;

    if (selectedContactChatConversation) {
      setChatConversation(selectedContactChatConversation);
    }
  }, [selectedContact, contacts]);

  return (
    <div ref={conversationRef} className="chatConversation">
      {chatConversation?.map((messages) => (
        <div
          className="chatMessages"
          key={messages.theirMessageId || messages.myMessageId}
        >
          <div>
            <p
              style={messages.theirMessage ? { padding: "4px" } : {}}
              className="theirMessage"
            >
              {messages.theirFile?.mimeType === "image/jpeg" && (
                <img src={messages.theirFile?.downloadUrl} alt="image" />
              )}

              {messages.theirFile?.mimeType === "application/pdf" && (
                <a href={messages.theirFile?.downloadUrl} target="_blank">
                  {messages.theirFile.fileName}
                </a>
              )}
              {messages.theirMessage}

              <span className="time">
                {messages.theirMessage?.length !== 0 && messages.time}
              </span>
            </p>
          </div>
          <div>
            <p
              style={messages.myMessage ? { padding: "4px" } : {}}
              className="myMessage"
            >
              {messages.myFile?.type === "image/jpeg" && (
                <img
                  src={URL.createObjectURL(messages.myFile as Blob)}
                  alt="image"
                />
              )}
              {messages.myFile?.type === "application/pdf" && (
                <a href={URL.createObjectURL(messages.myFile)} target="_blank">
                  {messages.myFile.name}
                </a>
              )}
              {messages.myMessage}
              <span className="time">
                {messages.myMessage.length !== 0 && messages.time}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatConversation;
