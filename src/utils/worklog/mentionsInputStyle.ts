interface MentionsInputStyle {
  control: {
    backgroundColor: string;
    fontSize: number;
  };
  "&singleLine": {
    display: string;
    width: string;
    highlighter: {
      padding: number;
      border: string;
    };
    input: {
      padding: number;
      border: string;
    };
  };
  suggestions: {
    list: {
      backgroundColor: string;
      border: string;
      fontSize: number;
    };
    item: {
      padding: string;
      borderBottom: string;
      "&focused": {
        backgroundColor: string;
      };
    };
  };
}

const mentionsInputStyle: MentionsInputStyle = {
  control: {
    backgroundColor: "#fff",
    fontSize: 16,
  },
  "&singleLine": {
    display: "inline-block",
    width: "90%",
    highlighter: {
      padding: 1,
      border: "2px inset transparent",
    },
    input: {
      padding: 1,
      border: "2px inset",
    },
  },
  suggestions: {
    list: {
      backgroundColor: "white",
      border: "1px solid rgba(0,0,0,0.15)",
      fontSize: 16,
    },
    item: {
      padding: "5px 15px",
      borderBottom: "1px solid rgba(0,0,0,0.15)",
      "&focused": {
        backgroundColor: "#cee4e5",
      },
    },
  },
};

export default mentionsInputStyle;
