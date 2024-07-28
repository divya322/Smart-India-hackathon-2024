const { PythonShell } = require("python-shell");

// let options = {
//   mode: "text",
//   //   pythonPath: "path/to/python",
//   pythonOptions: ["-u"],
//   scriptPath: "D:/College/3rd Year/Smart-India-hackathon/People_counter_model/",
//   args: null,
// };

const video = async (req, res) => {
  console.log("Function called");
  //Here are the option object in which arguments can be passed for the python_test.js.

  // Data to send to Python
  const dataToSend = {
    message: "Hello from Node.js",
  };

  // Set options for the PythonShell instance
  const options = {
    mode: "json",
    pythonOptions: ["-u"], // unbuffered mode (for real-time communication)
    scriptPath: "D:/College/3rd Year/Smart-India-hackathon/People_counter_model/", // path to the Python script
  };

  // Create a new PythonShell instance
  const pyShell = new PythonShell("people_counter.py", options);

  // Send data to Python script
//   pyShell.send(JSON.stringify(dataToSend));

  // Receive a response from Python script
  pyShell.on("message", (message) => {
    console.log(`Received from Python: ${message.response}`);
  });

  // Handle errors
  pyShell.on("error", (err) => {
    console.error("PythonShell Error:", err);
  });

  // Close the PythonShell instance
  pyShell.end((err) => {
    if (err) {
      console.error("PythonShell closed with an error:", err);
    } else {
      console.log("PythonShell closed successfully");
    }
  });
};
module.exports = {
  video,
};
