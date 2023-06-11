import { IChatConversation, IContact } from "../../Interface/Interface";
import "./ChatConversation.scss";
import { useRef, useEffect, useState } from "react";
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
  const [selectedImage, setSelectedImage] = useState<File | string | null>(
    null
  );

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
      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} className="selectedImage">
          <img
            onClick={(e: React.MouseEvent<HTMLImageElement>) =>
              e.stopPropagation()
            }
            src={
              selectedImage instanceof File
                ? URL.createObjectURL(selectedImage)
                : selectedImage
            }
          />
        </div>
      )}
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
                <img
                  onClick={() =>
                    setSelectedImage(messages.theirFile?.downloadUrl as string)
                  }
                  src={messages.theirFile?.downloadUrl}
                  alt="image"
                />
              )}

              {messages.theirFile?.mimeType === "application/pdf" && (
                <>
                  <a href={messages.theirFile?.downloadUrl} target="_blank">
                    {messages.theirFile.fileName}
                  </a>
                  <br />
                </>
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
                  onClick={() => setSelectedImage(messages.myFile)}
                  src={URL.createObjectURL(messages.myFile)}
                  alt="image"
                />
              )}
              {messages.myFile?.type === "application/pdf" && (
                <>
                  <a
                    href={URL.createObjectURL(messages.myFile)}
                    target="_blank"
                  >
                    {messages.myFile.name}
                  </a>
                  <br />
                </>
              )}
              {messages.myMessage}
              <span className="time">
                {(messages.myMessage.length > 0 && messages.time) ||
                  (messages.myFile && messages.time)}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatConversation;
