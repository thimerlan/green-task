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
        const updatedContactIndex = contacts.findIndex(
          (contact) => contact.chatId === selectedContact?.chatId
        );
        if (updatedContactIndex !== -1) {
          const updatedContacts = [...contacts];
          const updatedContact = { ...updatedContacts[updatedContactIndex] };
          const chatConversation = updatedContact.chatConversation || [];

          const newChatMessage: IChatConversation = {
            myMessage: message,
            myMessageId: response.data.idMessage,
            theirMessage: "",
            theirMessageId: "",
          };

          chatConversation.push(newChatMessage);

          updatedContact.chatConversation = chatConversation;
          updatedContacts[updatedContactIndex] = updatedContact;

          setContacts(updatedContacts);
        }

        setSelectedContact((prevState) => {
          if (prevState) {
            const updatedChatConversation: IChatConversation = {
              myMessage: message,
              myMessageId: response.data.idMessage,
              theirMessage: "",
              theirMessageId: "",
              status: "",
            };

            const filteredChatConversation = prevState.chatConversation?.filter(
              (message) => message.theirMessageId !== response.data.idMessage
            );

            return {
              ...prevState,
              chatConversation: [
                ...(filteredChatConversation || []),
                updatedChatConversation,
              ],
            };
          }

          return null;
        });

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

  const handleContactClick = (contact: IContact) => {
    setSelectedContact(contact);
  };

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
        const { typeWebhook, messageData, idMessage, senderData } =
          responseData.body;

        if (typeWebhook === "incomingMessageReceived") {
          const updatedContactIndex = contacts.findIndex(
            (contact) => contact.chatId === senderData?.chatId
          );

          if (updatedContactIndex !== -1) {
            const updatedContacts = [...contacts];
            const updatedContact = { ...updatedContacts[updatedContactIndex] };
            const chatConversation = updatedContact.chatConversation || [];

            const newChatMessage: IChatConversation = {
              myMessage: "",
              myMessageId: "",
              theirMessage: messageData.textMessageData.textMessage,
              theirMessageId: idMessage,
            };

            chatConversation.push(newChatMessage);

            updatedContact.chatConversation = chatConversation;
            updatedContacts[updatedContactIndex] = updatedContact;

            setContacts(updatedContacts);
            setSelectedContact((prevState) => {
              if (prevState) {
                const updatedChatConversation: IChatConversation = {
                  myMessage: "",
                  myMessageId: "",
                  theirMessage: messageData.textMessageData.textMessage,
                  theirMessageId: idMessage,
                };

                const filteredChatConversation =
                  prevState.chatConversation?.filter(
                    (message) => message.theirMessageId !== idMessage
                  );

                return {
                  ...prevState,
                  chatConversation: [
                    ...(filteredChatConversation || []),
                    updatedChatConversation,
                  ],
                };
              }

              return null;
            });
          }
        }
        if (typeWebhook === "outgoingMessageStatus") {
          const updatedContactIndex = contacts.findIndex(
            (contact) => contact.chatId === selectedContact?.chatId
          );

          if (updatedContactIndex !== -1) {
            const updatedContacts = [...contacts];
            const updatedContact = { ...updatedContacts[updatedContactIndex] };
            const chatConversation = updatedContact.chatConversation || [];

            const updatedChatConversation = chatConversation.map((message) => {
              if (message.myMessageId === responseData.body.idMessage) {
                return {
                  ...message,
                  status: responseData.body.status,
                };
              }
              return message;
            });
            updatedContact.chatConversation = updatedChatConversation;
            updatedContacts[updatedContactIndex] = updatedContact;
            setContacts(updatedContacts);
          }
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
  }, [selectedContact]);

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
        <ChatConversation
          selectedContact={selectedContact}
          contacts={contacts}
        />
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
