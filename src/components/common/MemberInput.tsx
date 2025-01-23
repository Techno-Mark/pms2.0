import React from "react";

const MemberInput = ({
  label,
  members,
  setMembers,
  inputValue,
  setInputValue,
  error,
  setError,
}: any) => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddMember = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!inputValue.trim()) {
        setError("Please provide an email address.");
        return;
      }
      if (!isValidEmail(inputValue.trim())) {
        setError("Please provide a valid email address.");
        return;
      }
      setMembers([...members, inputValue.trim()]);
      setInputValue("");
      setError(""); // Clear the error after successful addition
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_: any, i: number) => i !== index));
  };

  //   const MAX_VISIBLE = 3;

  return (
    <div className="border-t border-gray-300 py-2 px-4">
      <div className="flex items-start gap-3">
        <p>{label}:</p>
        <div className="flex items-center flex-wrap gap-2 flex-1">
          {members
            // .slice(0, MAX_VISIBLE)
            .map((member: string, index: number) => (
              <div
                key={index}
                className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {member}
                <button
                  onClick={() => handleRemoveMember(index)}
                  className="ml-2 text-gray-500 hover:text-gray-800"
                >
                  &times;
                </button>
              </div>
            ))}

          {/* {members.length > MAX_VISIBLE && (
            <span className="text-sm text-gray-500">
              +{members.length - MAX_VISIBLE}
            </span>
          )} */}

          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(false);
            }}
            onKeyDown={handleAddMember}
            placeholder="Enter Email Address"
            className="flex-grow border-none focus:ring-0 outline-none text-sm py-[2px]"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default MemberInput;
