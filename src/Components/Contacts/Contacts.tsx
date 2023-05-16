interface ContactsProps {
  contacts: IContact[];
  selectedContact: IContact | null;
  handleContactClick: (contact: IContact) => void;
}
import { IContact } from "../../Interface/Interface";
import "./Contacts.scss";
const Contacts = ({
  contacts,
  handleContactClick,
  selectedContact,
}: ContactsProps) => {
  return (
    <div className="contactsContainer">
      <div className="contactsPanel">
        <h2>Contacts</h2>

        {contacts.length ? (
          contacts.map((contact) => (
            <div
              onClick={() => handleContactClick(contact)}
              key={contact.chatId}
              className="contact"
              style={
                contact.name === selectedContact?.name
                  ? { background: "#2a4142c2" }
                  : {}
              }
            >
              {contact.name}
            </div>
          ))
        ) : (
          <p>There are no contacts yet.</p>
        )}
      </div>
    </div>
  );
};

export default Contacts;
