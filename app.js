const express = require("express");
const app = express();
const path = require("path");

require("./kickoff/logger/logger");
require("./kickoff/startup/startup")(app);
require("./kickoff/db/db")();
require("./kickoff/routes/routes")(app);
require("./kickoff/errorHandling/error")(app);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on the: ${port}`);
});
