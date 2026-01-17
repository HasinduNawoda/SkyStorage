import ModalPortal from "./ModalPortal"
import close from "../assets/icons/close.png" // Make sure the path is correct
import React from "react"
import remove from "../assets/icons/minus.png"
import link from "../assets/icons/link.png"
import share from "../assets/icons/shareb.png"
import add from "../assets/icons/add.png"

type ShareModalProps = {
  open: boolean
  onClose: () => void
  fileName: string
    onShare?: (payload: { name: string; people: { email: string; role: "Editor" | "Viewer" }[]; message?: string; dateShared: string }) => void

}

/*type SharedFile = {
  name: string
  size: string
  lastModified: string
  people: { email: string; role: string }[]
  message?: string
  dateShared: string
}*/

export default function ShareModal({ open, onClose, fileName,onShare }: ShareModalProps) {
  if (!open) return null

 // const [role, setRole] = React.useState("Owner") 
const [emailInput, setEmailInput] = React.useState("");
const [people, setPeople] = React.useState<{ email: string; role: "Editor" | "Viewer" }[]>([]);
const [sendMessage, setSendMessage] = React.useState(false);
const [message, setMessage] = React.useState("");
const [emailError, setEmailError] = React.useState("");

const addPerson = () => {
  const email = emailInput.trim();
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email) return;

  if (!emailRegex.test(email)) {
    setEmailError("Please enter a valid email address");
    return;
  }

  if (people.some(p => p.email === email)) {
    setEmailError("This email is already added");
    return;
  }

  setPeople([...people, { email, role: "Viewer" }]);
  setEmailInput("");
  setEmailError(""); // Clear error on success
};




  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center">

        {/* Overlay - closes when clicked */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Box */}
        <div
           className="relative z-10 w-[40%] h-[85%] rounded-xl bg-white p-6 shadow-xl "
          onClick={(e) => e.stopPropagation()} // Stop closing on inside click
          tabIndex={-1} // Prevents accidental blur closing
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 opacity-60 hover:opacity-100"
          >
            <img src={close} alt="close" className="w-14 h-14 opacity-50 hover:opacity-100" />
          </button>

          <h1 className="text-3xl font-semibold mb-2 text-center" >Share "{fileName}"</h1>

<div className="flex flex-row mt-12 mb- w-[85%]">
<input
  type="email"
  placeholder="Add people by email"
  value={emailInput}
  onChange={(e) => setEmailInput(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && addPerson()}
  className={`h-12 rounded-full p-2 text-black flex-1
    border ${emailError ? "border-red-500 text-red-600 focus:ring-red-500" : "border-black focus:border-blue-500 focus:ring-blue-500"} 
    focus:outline-none focus:ring-2`
  }
/>
<button
  onClick={addPerson}
  disabled={!emailInput.trim()}
  className="ml-4 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
>
  <img src={add} className=" w-12 h-12" />
</button></div>


<div className="flex flex-col mb-4">
  {emailError && (
    <span className="text-red-500 text-sm mt-1">{emailError}</span>
  )}

</div>

          <h3 className="text-xl font-semibold mb-2">People with access</h3>
          <div className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50">
  <div className="flex items-center justify-between">
    <span className="font-medium">You (Owner)</span>
    <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded">
      Owner
    </span>
  </div>
</div>

<div className="max-h-64 overflow-y-auto pr-2">
{people.length > 0 && (
  <div className="border border-gray-300 rounded-lg mb-4 ">
    {people.map((person, index) => (
      <div
        key={index}
        className="flex text-lg items-center justify-between p-2 border-b last:border-b-0 "
      >
        {/* Remove Icon */}
        <button
          onClick={() => {
            const updated = people.filter((_, i) => i !== index);
            setPeople(updated);
          }} >
          <img src={remove} className="opacity-80 hover:opacity-100 w-10 h-10"/>
        </button>

        {/* Email */}
        <span className="flex-1 text-sm">{person.email}</span>

        {/* Role Dropdown (Owner removed) */}
        <select
          value={person.role}
          onChange={(e) => {
            const updated = [...people];
            updated[index].role = e.target.value as "Editor" | "Viewer";
            setPeople(updated);
          }}
          className="border rounded p-3 text-sm ml-2"
        >
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>
    ))}
  </div>
)}
{/* Checkbox to enable message */}


<div className="flex items-center mb-2">
  <input
    type="checkbox"
    id="sendMessage"
    checked={sendMessage}
    onChange={() => setSendMessage(!sendMessage)}
    className="mr-2 accent-blue-500"
  />
  <label htmlFor="sendMessage" className="text-sm font-medium">
    Send a message to the receivers
  </label>
</div>

{/* Textarea for optional message */}
<textarea
  placeholder="Add a message to the receivers..."
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  disabled={!sendMessage} // Disabled if checkbox is unchecked
  className={`w-[90%] ml-3 rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none ${
    !sendMessage ? "bg-gray-100 cursor-not-allowed" : "bg-white"
  }`}
  rows={4}
/>
</div>

  <div className="absolute bottom-6 left-6 right-6 justify-center flex gap-4">
  {/* Copy Link Button */}
  <button className="w-[40%] rounded-full bg-gray-100 p-2 border border-gray-300 hover:bg-gray-200">
    <img src={link} alt="Copy Link" className="inline-block mr-2" />
    Copy Link
  </button>

  {/* Send Button */}
<button
  onClick={() => {
    // Format the date before sending
    const formatDate = (date: Date): string => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    };

    const payload = {
      name: fileName,
      people,
      message: sendMessage ? message : undefined,
      dateShared: formatDate(new Date()), // Use formatted date
    }
    onShare?.(payload)
    onClose()
  }}
  disabled={people.length === 0}
  className={`w-[40%] rounded-full p-2 border 
    ${people.length > 0 
      ? "bg-blue-500 text-white hover:bg-blue-600" 
      : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
>
  <img src={share} alt="Share" className="inline-block mr-2 w-5 h-5" />
  Share
</button>
</div>

     
        </div>
        
      </div>

    </ModalPortal>
  )
}
