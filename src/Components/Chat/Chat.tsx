import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.scss";
import Contacts from "../Contacts/Contacts";
import { IContact, IChatConversation } from "../../Interface/Interface";
import CreateContact from "../CreateContact/CreateContact";
import ChatConversation from "../ChatConversation/ChatConversation";
interface ChatProps {}
const Chat = (props: ChatProps) => {
  const [message, setMessage] = useState<string>("");
  const [chatConversation, setChatConversation] = useState<IChatConversation[]>(
    []
  );
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null);
  const [errorMessage, setErrorMessage] = useState<any>();
  const navigate = useNavigate();
  useEffect(() => {
    // Check if there is an authentication token stored in localStorage
    const authData = localStorage.getItem("authData");
    if (!authData) {
      navigate("/");
      return;
    }

    const { authToken, idInstance } = JSON.parse(authData);

    // Perform automatic login using the stored token and idInstance

    handleSendMessage(authToken, idInstance);
  }, []);
  useEffect(() => {
    setMessage("");
    setErrorMessage("");
  }, [selectedContact]);
  const handleSendMessage = async (token: string, id: string) => {
    if (message) {
      try {
        const response = await axios.post(
          `https://api.green-api.com/waInstance${id}/SendMessage/${token}`,
          { chatId: selectedContact?.chatId, message }
        );

        setChatConversation((prevConversation) => [
          ...prevConversation,
          {
            myMessage: message,
            myMessageId: response.data.idMessage,
            theirMessage: "",
            theirMessageId: "",
          },
        ]);

        setMessage("");
        setErrorMessage("");
      } catch (error) {
        // Handle error
        console.error("Failed to send message", error);
        setErrorMessage("Failed to send message");
      }
    }
  };

  const handleFormSending = (event: React.FormEvent) => {
    event.preventDefault();
    const authData = localStorage.getItem("authData");
    if (!authData) {
      navigate("/");
      return;
    }

    const { authToken, idInstance } = JSON.parse(authData);

    handleSendMessage(authToken, idInstance);
  };

  const handleContactClick = useCallback((contact: IContact) => {
    setSelectedContact(contact);
  }, []);
  const getMessages = async () => {
    try {
      const authData = localStorage.getItem("authData");
      if (!authData) return;
      const { authToken, idInstance } = JSON.parse(
        localStorage.getItem("authData") || ""
      );

      const url = `https://api.green-api.com/waInstance${idInstance}/ReceiveNotification/${authToken}`;
      const response = await axios.get(url);
      const responseData = response.data;

      if (responseData && responseData.body) {
        const { typeWebhook, messageData, idMessage } = responseData.body;

        if (typeWebhook === "incomingMessageReceived") {
          setChatConversation((prevConversation) =>
            prevConversation.filter(
              (message) => message.theirMessageId !== idMessage
            )
          );
          setChatConversation((prevConversation) => [
            ...prevConversation,
            {
              myMessage: "",
              myMessageId: "",
              theirMessage: messageData.textMessageData.textMessage,
              theirMessageId: idMessage,
            },
          ]);
        }

        if (response.data.receiptId) {
          const receiptId = response.data.receiptId;
          const delNoticeUrl = `https://api.green-api.com/waInstance${idInstance}/DeleteNotification/${authToken}/${receiptId}`;
          await axios.delete(delNoticeUrl);
        }
      } else {
        return;
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };
  useEffect(() => {
    const interval = setInterval(getMessages, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="chatContainer">
      <div className="selectedContact">
        {selectedContact ? (
          <h2>{selectedContact.name}</h2>
        ) : (
          <p>To talk select or create at least one contact</p>
        )}
      </div>
      <CreateContact contacts={contacts} setContacts={setContacts} />
      <Contacts
        contacts={contacts}
        handleContactClick={handleContactClick}
        selectedContact={selectedContact}
      />
      {selectedContact && (
        <ChatConversation chatConversation={chatConversation} />
      )}
      {selectedContact ? (
        <>
          <div className="errorMessage">
            {errorMessage && <p>{errorMessage}</p>}
          </div>
          <form className="sendingMessageForm" onSubmit={handleFormSending}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button type="submit">Send </button>
          </form>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default Chat;