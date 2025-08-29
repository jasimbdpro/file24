import { useState } from "react";

// ConditionInputWindow component - modal for password confirmation before performing an action
function ConditionInputWindow({ onClose, onAction }) {
  // State to store the password entered by the user
  const [password, setPassword] = useState("");

  return (
    <div className="modal">
      {/* Title of the modal */}
      <span><h2>Input Window</h2></span>

      {/* Password input field */}
      <input
        type="password"               // hide characters while typing
        placeholder="Enter password"  // guide the user
        value={password}              // bind the input to state
        onChange={(e) => setPassword(e.target.value)} // update state on typing
      />
<br />
      {/* Confirm button */}
      <button
        onClick={() => {
          // Call the function passed as prop with the entered password
          onAction(password); 

          // Close the modal
          onClose();
        }}
      >
        Confirm
      </button>

      {/* Close button - closes modal without performing action */}
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default ConditionInputWindow;
