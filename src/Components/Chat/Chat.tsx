import axios from "axios";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperclip } from "react-icons/fa";
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
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<any>();
  const [fileModal, setFileModal] = useState<boolean>(false);
  const [fileSendingLoading, setFileSendingLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const captionRef = useRef<HTMLInputElement>(null);

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
            myFile: null,
            theirMessage: "",
            theirMessageId: "",
            theirFile: null,
            time: `${new Date().getHours()}:${new Date().getMinutes()}`,
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
              myFile: null,
              theirMessage: "",
              theirMessageId: "",
              theirFile: null,
              time: `${new Date().getHours()}:${new Date().getMinutes()}`,
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
              myFile: null,
              theirMessage:
                messageData.textMessageData?.textMessage ||
                messageData.fileMessageData?.caption,
              theirMessageId: idMessage,
              theirFile: messageData.fileMessageData || null,
              time: `${new Date().getHours()}:${new Date().getMinutes()}`,
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
                  myFile: null,
                  theirMessage:
                    messageData.textMessageData?.textMessage ||
                    messageData.fileMessageData?.caption,
                  theirMessageId: idMessage,
                  theirFile: messageData.fileMessageData || null,

                  time: `${new Date().getHours()}:${new Date().getMinutes()}`,
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

  const uploadFile = async () => {
    setFileSendingLoading(true);
    const value = captionRef.current?.value;
    const { authToken, idInstance } = JSON.parse(
      localStorage.getItem("authData") || ""
    );
    const url = `https://api.green-api.com/waInstance${idInstance}/sendFileByUpload/${authToken}`;
    const formData = new FormData();
    formData.append("chatId", selectedContact?.chatId || "");
    formData.append("caption", value || "");
    formData.append("file", file || "");
    try {
      const response = await axios.post(url, formData);

      if (response.status === 200) {
        const responseData = response.data;
        const updatedContactIndex = contacts.findIndex(
          (contact) => contact.chatId === selectedContact?.chatId
        );
        if (updatedContactIndex !== -1) {
          const updatedContacts = [...contacts];
          const updatedContact = { ...updatedContacts[updatedContactIndex] };
          const chatConversation = updatedContact.chatConversation || [];

          const newChatMessage: IChatConversation = {
            myMessage: value || "",
            myMessageId: responseData.idMessage,
            myFile: file,
            theirMessage: "",
            theirMessageId: "",
            theirFile: null,
            time: `${new Date().getHours()}:${new Date().getMinutes()}`,
          };

          chatConversation.push(newChatMessage);

          updatedContact.chatConversation = chatConversation;
          updatedContacts[updatedContactIndex] = updatedContact;

          setContacts(updatedContacts);
        }
        setFile(null);
        setFileModal(false);
        setFileSendingLoading(false);
      } else {
        console.error(`File upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("An error occurred while uploading the file", error);
    }
  };

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
            <label
              style={{ display: "flex", alignItems: "center" }}
              htmlFor="file"
            >
              <FaPaperclip cursor={"pointer"} color="green" size={24} />
            </label>
            {file && fileModal && (
              <div className="sendingImage">
                <div className="closeFileModal">
                  <button onClick={() => setFileModal(false)}>&#10008;</button>
                </div>
                {file.type !== "application/pdf" && (
                  <img src={URL.createObjectURL(file)} alt="image" />
                )}
                {file.type === "application/pdf" && (
                  <embed
                    src={URL.createObjectURL(file)}
                    width="70%"
                    height="600px"
                    type="application/pdf"
                  />
                )}
                <h4>{fileSendingLoading && "Uploading Please wait..."}</h4>
                <div className="caption">
                  <input type="text" ref={captionRef} placeholder="Message:" />
                </div>
                <div className="uplaod">
                  <button onClick={uploadFile}>Upload</button>
                </div>
              </div>
            )}
            <input
              type="text"
              value={message}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setMessage(e.target.value);
              }}
            />
            <button type="submit">Send </button>

            <input
              type="file"
              name="file"
              id="file"
              accept=".jpg, .png, .webp, .bmp, .pdf"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFile(e.target.files?.[0] || null);
                setFileModal(true);
              }}
            />
          </form>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default Chat;
