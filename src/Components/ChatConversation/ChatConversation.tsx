import { IChatConversation } from "../../Interface/Interface";
import "./ChatConversation.scss";
import { useRef, useEffect } from "react";
interface ChatConversationProps {
  chatConversation: IChatConversation[] | undefined;
}

const ChatConversation = ({ chatConversation }: ChatConversationProps) => {
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [chatConversation]);
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
          </p>
        </div>
      ))}
    </div>
  );
};

export default ChatConversation;
