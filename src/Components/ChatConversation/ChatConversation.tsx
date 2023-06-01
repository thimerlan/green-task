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
          <p
            style={messages.theirMessage ? { padding: "4px" } : {}}
            className="theirMessage"
          >
            {messages.theirMessage}
          </p>
          <p
            style={messages.myMessage ? { padding: "4px" } : {}}
            className="myMessage"
          >
            {messages.myMessage}
            <span className="statusMessage">
              {messages.status === "sent" || "" ? (
                <BsCheck opacity={0.7} />
              ) : messages.status === "delivered" ? (
                <BsCheckAll opacity={0.7} color="red" />
              ) : (
                messages.status === "read" && <BsCheckAll fontSize={20} />
              )}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default ChatConversation;
