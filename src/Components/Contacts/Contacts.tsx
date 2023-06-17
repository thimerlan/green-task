interface ContactsProps {
  contacts: IContact[];
  selectedContact: IContact | null;
  handleContactClick: (contact: IContact) => void;
}
import { IContact } from "../../Interface/Interface";
import { MdPictureAsPdf } from "react-icons/md";
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
              key={contact.chatId}
              onClick={() => handleContactClick(contact)}
              className="contact"
              style={
                contact.name === selectedContact?.name
                  ? { background: "#2a4142c2" }
                  : {}
              }
            >
              {contact.name}
              <div className="lastMessage">
                <span>
                  {contact.lastMessage?.message?.length > 18
                    ? contact.lastMessage?.message.slice(0, 18).concat("...")
                    : contact.lastMessage?.message}
                  {contact.lastMessage?.myFile?.type === "image/jpeg" && (
                    <img
                      src={URL.createObjectURL(contact.lastMessage?.myFile)}
                      alt="image"
                    />
                  )}
                  {contact.lastMessage?.theirFile?.mimeType ===
                    "image/jpeg" && (
                    <img
                      src={contact.lastMessage?.theirFile?.downloadUrl}
                      alt={"image"}
                    />
                  )}

                  {contact.lastMessage?.myFile?.type === "application/pdf" && (
                    <>
                      <MdPictureAsPdf color="green" size={20} />
                    </>
                  )}
                  {contact.lastMessage?.theirFile?.mimeType ===
                    "application/pdf" && (
                    <>
                      <MdPictureAsPdf color="green" size={20} />
                    </>
                  )}
                </span>
              </div>
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
