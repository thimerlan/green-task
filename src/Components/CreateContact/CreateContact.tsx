import { useState, useEffect } from "react";
import { IContact } from "../../Interface/Interface";
import "./CreateContact.scss";
import axios from "axios";
interface CreateContactProps {
  contacts: IContact[];
  setContacts: (contacts: IContact[]) => void;
}

const CreateContact = ({ contacts, setContacts }: CreateContactProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>();
  const [newContact, setNewContact] = useState<IContact>({
    chatId: "",
    name: "",
  });
  const [isValidNumber, setIsValidNumber] = useState<string>();
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewContact({
      chatId: "",
      name: "",
    });
    setIsValidNumber("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setNewContact((prevContact) => ({
      ...prevContact,
      [name]: value,
    }));
  };

  const handleCreateContact = async (event: React.FormEvent) => {
    event.preventDefault();

    const authData = localStorage.getItem("authData");
    if (!authData) return;
    const { authToken, idInstance } = JSON.parse(
      localStorage.getItem("authData") || ""
    );
    const res = await axios.post(
      `https://api.green-api.com/waInstance${idInstance}/checkWhatsapp/${authToken}`,
      { phoneNumber: newContact.chatId }
    );
    const resData = await res.data;
    resData.existsWhatsapp
      ? ""
      : setIsValidNumber(
          "Invalid phone number. Please enter a valid phone number."
        );

    const updatedContact = {
      ...newContact,
      chatId: `${newContact.chatId.replace("+", "")}@c.us`,
    };
    if (
      updatedContact.chatId &&
      updatedContact.name &&
      resData.existsWhatsapp
    ) {
      setContacts([...contacts, updatedContact]);
      closeModal();
    }
  };

  return (
    <>
      <div className="OpenModal">
        <button onClick={openModal}>Add Contact</button>
      </div>
      {isModalOpen && (
        <div className="modal">
          <div className="modalContent">
            <h3>Add Contact</h3>
            <form onSubmit={handleCreateContact}>
              <input
                type="number"
                name="chatId"
                value={newContact.chatId}
                placeholder="Number: "
                onChange={handleInputChange}
                autoComplete="off"
              />
              {isValidNumber && (
                <p className="invalidNumber">{isValidNumber}</p>
              )}
              <input
                type="text"
                name="name"
                value={newContact.name}
                placeholder="Name: "
                onChange={handleInputChange}
                autoComplete="off"
              />
              <div className="modalActions">
                <button
                  disabled={newContact.chatId && newContact.name ? false : true}
                  type="submit"
                >
                  Save
                </button>
                <button onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateContact;
