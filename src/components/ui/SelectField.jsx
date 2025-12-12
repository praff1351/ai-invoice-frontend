import React from "react";

const SelectField = ({ label, name, options = [], ...props }) => {
  return (
    <div>
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        {label}
      </label>

      {/* Select Input */}
      <select
        id={name}
        name={name}
        {...props}
        className="w-full h-10 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option, index) => (
          <option
            key={option.value || option.label || index}
            value={option.value || option}
          >
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
