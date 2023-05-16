import { useState } from "react";
import { IContact } from "../../Interface/Interface";
import "./CreateContact.scss";
interface CreateContactProps {
  contacts: IContact[];
  setContacts: (contacts: IContact[]) => void;
}

const CreateContact = ({ contacts, setContacts }: CreateContactProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState<IContact>({
    chatId: "",
    name: "",
  });
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewContact({
      chatId: "",
      name: "",
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setNewContact((prevContact) => ({
      ...prevContact,
      [name]: value,
    }));
  };

  const handleCreateContact = (event: React.FormEvent) => {
    event.preventDefault();
    const updatedContact = {
      ...newContact,
      chatId: `${newContact.chatId.replace("+", "")}@c.us`,
    };

    if (updatedContact.chatId && updatedContact.name) {
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
