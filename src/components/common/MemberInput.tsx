import React from "react";

const MemberInput = ({
  label,
  members,
  setMembers,
  inputValue,
  setInputValue,
  error,
  setError,
  validate = false,
}: any) => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addMember = (email: string) => {
    if (!email.trim()) return;

    if (!isValidEmail(email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    if (members.includes(email.trim())) {
      setError("This email is already added.");
      return;
    }

    setMembers([...members, email.trim()]);
    setInputValue("");
    setError("");
  };

  const handleAddMember = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addMember(inputValue);
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_: any, i: number) => i !== index));
  };

  const handleBlur = () => {
    addMember(inputValue);
  };

  return (
    <div className="border-t border-gray-300 py-2 px-4">
      <div className="flex items-start gap-3">
        <p>{label}:</p>
        <div className="flex items-center flex-wrap gap-2 flex-1">
          {members.map((member: string, index: number) => (
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

          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
            }}
            onKeyDown={handleAddMember}
            onBlur={handleBlur}
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
